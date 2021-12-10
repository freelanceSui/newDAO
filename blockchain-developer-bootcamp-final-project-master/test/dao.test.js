// load dependencies 
const { deployProxy, upgradeProxy , upgrades} = require('@openzeppelin/truffle-upgrades');
const { assert } = require('chai');
// const Contract = require('web3-eth-contract');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { time } = require('console');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { toUnit, unitToBN, toBN, extractEventSignatures, generateMappingsFromSignatures, subscribeToLogs, fakeMine, fakeMineTwo} = require("./helpers");

const IkonDAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const Timelock = artifacts.require('Timelock');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOVectorCollectible = artifacts.require("IkonDAOVectorCollectible");

web3.setProvider('ws://localhost:8545');
const utils = web3.utils;
const toSha3 = web3.utils.soliditySha3;

contract("IkonDAO (proxy)", accounts => {

    // general 
    let [owner, other , alice, bob, carl, david, ed, fred, gerald, hilda] = accounts;

    let [MEMBER_ROLE, ADMIN_ROLE, BANNED_ROLE, PAUSER_ROLE, MINTER_ROLE, TIMELOCK_ADMIN_ROLE, PROPOSER_ROLE, EXECUTOR_ROLE] = [
        toSha3("IKONDAO_MEMBER_ROLE"),
        toSha3("IKONDAO_ADMIN_ROLE"),
        toSha3("IKONDAO_BANNED_ROLE"),
        toSha3("IKONDAO_PAUSER_ROLE"),
        toSha3("IKONDAO_MINTER_ROLE"),
        toSha3("TIMELOCK_ADMIN_ROLE"),
        toSha3("PROPOSER_ROLE"),
        toSha3("EXECUTOR_ROLE")
    ]

    // inputs 
    // gov token 
    let weigthLimitFraction = toBN(49); 
    let initialVotes = unitToBN(100);
    let baseRewardVotes = unitToBN(100); 

    // utility token
    let baseRewardUtility = unitToBN(5);

    // governor
    let votingDelay = 3;
    let votingPeriod = 10;
    
    // timelocker 
    let timelockDelay = 2;
    let proposers = [owner]
    let executors = [owner]
    
    let settings = {};
    settings.votingDelay = votingDelay + 2;
    settings.queued =  votingDelay + votingPeriod + 5;
    settings.timelockDelay = settings.queued + timelockDelay + 5;

    // govToken
    let initialUsers = [alice, bob, carl, david, ed, fred, gerald, hilda];

    // artifacts
    let dao, daoProxy, govToken, token, governor, timelocker, nft;

    // contract instance -> for getting abi methods
    var governorInst, govTokenInst, tokenInst, timelockerInst, daoProxyInst;

    // voting
    const proposalState = {
        Pending: 0,
        Active: 1, 
        Canceled: 2,
        Defeated: 3,
        Succeeded: 4,
        Queued: 5,
        Expired: 6,
        Executed: 7
    }
    let support = {
        Against: 0,
        For: 1,
        Abstain: 2
    }

    // for proposals
    function Proposal (targets, datas, description, values = undefined){
        this.targets = typeof(targets) != 'object' ? Array(targets) : targets;
        this.values = typeof(values) === 'undefined' ? [0] : values;
        this.calldatas = typeof(targets) != 'object' ? Array(datas) : datas;
        this.description = description;
    }

    beforeEach( async () => {
        
        // initiate new contracts before each describe 
        dao = await IkonDAO.new();
        govToken = await IkonDAOGovernanceToken.new(weigthLimitFraction, initialUsers, initialVotes, baseRewardVotes, {from: owner});
        token = await IkonDAOToken.new(baseRewardUtility, {from: owner});
        timelocker = await Timelock.new(timelockDelay, proposers, executors);
        governor = await IkonDAOGovernor.new(govToken.address, timelocker.address, votingDelay, votingPeriod, {from: owner});
        daoProxy = await deployProxy(IkonDAO, [governor.address, timelocker.address, token.address], {initializer: '__IkonDAO_init', kind: 'uups', unsafeAllow: ['constructor', 'delegatecall']});
        nft = await IkonDAOVectorCollectible.new(daoProxy.address);

        /// contract instance 
        governorInst = new web3.eth.Contract(governor.abi, governor.address); 
        govTokenInst = new web3.eth.Contract(govToken.abi, govToken.address); 
        tokenInst = new web3.eth.Contract(token.abi, token.address); 
        timelockerInst = new web3.eth.Contract(timelocker.abi, timelocker.address);
        nftInst = new web3.eth.Contract(nft.abi, nft.address);
        daoProxyInst = new web3.eth.Contract(daoProxy.abi, daoProxy.address);

        // give proxy admin rights to governor
        await governor.grantRole(ADMIN_ROLE, daoProxy.address, {from: owner}); // for proxy to make proposals and execute through governor
        await governor.grantRole(ADMIN_ROLE, timelocker.address, {from: owner}); // for timelocker to execute proposals
        await token.grantRole(ADMIN_ROLE, timelocker.address, {from: owner}); // for timelocker to execute proposals
        await token.grantRole(ADMIN_ROLE, governor.address, {from: owner}); // for timelocker to execute proposals
        await govToken.grantRole(ADMIN_ROLE, timelocker.address, {from: owner}); // for timelocker to execute proposals
        await daoProxy.grantRole(ADMIN_ROLE, timelocker.address, {from: owner}); // for timlocker to exectute proposals
        await nft.grantRole(MINTER_ROLE, timelocker.address, {from: owner}) // for timelocker to mint nfts

        await timelocker.grantRole(PROPOSER_ROLE, governor.address); // for queueing of proposals
        await timelocker.grantRole(EXECUTOR_ROLE, governor.address); // for executing transactions
                  

    });    
        
    describe("Initialization", () => {
        
        // upgradeabillity tests
        it("set the correct admin", async () => {
            let daoAdmin = await daoProxy.hasRole(ADMIN_ROLE, owner);
            assert.isTrue(daoAdmin === true, "owner is not the deployer contract");
        });

        it("makes designated contracts admins", async () => {
            await daoProxy.grantRole(ADMIN_ROLE, other, {from: owner});
            let newAdmin = await daoProxy.hasRole(ADMIN_ROLE, other);
            assert.isTrue(newAdmin === true, "does not set admins correctly");
        });

        it("allows only admins to upgrade", async () => {
            let newImplementation = await IkonDAO.new();
            await expect(daoProxy.upgradeTo(newImplementation.address, {from: other})).to.be.rejected;
        });

        it("upgrades contract correctly and maintains state", async () => {
            await daoProxy.createMember({from: fred});
            let newImplementation = await IkonDAO.new();
            await daoProxy.upgradeTo(newImplementation.address);
            let newProxy = new web3.eth.Contract(newImplementation.abi, daoProxy.address);
            assert.isTrue(await newProxy.methods.hasRole(MEMBER_ROLE, fred).call(), "does not upgrade sucessfully");
        });

    })


    describe("Member functionalities", () => {

        it("creates members", async ()=> {
            // create members
            await daoProxy.createMember({from: alice});            
            let isAliceMember = await daoProxy.hasRole(MEMBER_ROLE, alice);
            assert.equal(isAliceMember, true, "member not created"); 
        });

        // only nonmembers banned members cannot members
        it("allows only non members and non banned members to be created", async ()=>{
            await daoProxy.createMember({from: alice})
            await expect(daoProxy.createMember({from: alice})).to.be.rejected
            await daoProxy.banMember(alice, {from: owner});
            await expect(daoProxy.createMember({from: alice})).to.be.rejected
        });

        it("bans members", async () => {
            await daoProxy.createMember({from: david});
            await daoProxy.banMember(david, {from: owner});
            assert.isTrue(await daoProxy.hasRole(BANNED_ROLE, david), "member does not have banned role");
        });
    });


    describe("Proposals", () => {
        
        /// proposal description
        it("dissalows non members and banned members from creating proposals", async () => {

            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(5).encodeABI(),
                "update voting period"
            ) 
            await expect(daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: carl})).to.be.rejected;
        })
        
        
        it("allows for proposal creation", async () => {

            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(10).encodeABI(),
                "allows for proposal creation"
            )

            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
            await daoProxy.createMember({from: alice});
            await daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice});
            let state = await governor.state(proposalId);
            
            assert.equal(state, proposalState.Pending, "proposal not created successfully");
        });
        
        it("allows only members to cast votes on proposals", async () => {

            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(10).encodeABI(),
                "allows only members to cast votes on proposals"
            )
            
            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));                    
            
            let actions = [  
                {
                    height: 0,
                    callback: async () => {
                        try {

                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})

                        } catch(e){

                            return e ? e : "created members sucessfully";
                        }
                    }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: 4,
                    callback: async () => daoProxy.castVote(proposalId, support.For, {from: fred})
                }
            ]
            
            let results = await  fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                actions,
                15
            )                                                   
            assert.equal(results[results.length - 1].e.reason, String(`AccessControl: account ${String(fred).toLowerCase()} is missing role ${MEMBER_ROLE}`), "allows non member to cast vote");
        });

        it("queues proposals", async ()=> {        
               
            
            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(15).encodeABI(),
                "queues proposals"
            )

            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));

            /// fake mine
            let actions = [
                {
                    height: 0,
                    callback: async () => {
                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})
                        }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: Number(votingDelay+1),
                    callback: async () => { 
                        await daoProxy.castVote(proposalId, support.For, {from: alice}) 
                        await daoProxy.castVote(proposalId, support.For, {from: bob}) 
                        await daoProxy.castVote(proposalId, support.For, {from: carl}) 
                        await daoProxy.castVote(proposalId, support.For, {from: david}) 
                        await daoProxy.castVote(proposalId, support.For, {from: ed}) 
                    }
                },
                {
                    height: Number(votingDelay+1+votingPeriod+1+votingDelay),
                    callback: async () => {
                            await daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: alice})
                    }
                },
                {
                    height: 44,
                    callback: async () => governor.state(proposalId) 
                },
            ]
            
            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                actions,
                45
            )

            let state = results[results.length-1];
            assert.equal(state.toNumber(), proposalState.Queued, "proposal is not queued");
        });

        
        it("allows only members execute proposal", async ()=> {

            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(25).encodeABI(),
                "allows only members to execute proposals"
            )

            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
            let actions = [
                {
                    height: 0,
                    callback: async () => {

                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})

                        }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: Number(votingDelay+1),
                    callback: async () => { 
                        await daoProxy.castVote(proposalId, support.For, {from: alice}) 
                        await daoProxy.castVote(proposalId, support.For, {from: bob}) 
                        await daoProxy.castVote(proposalId, support.For, {from: carl}) 
                        await daoProxy.castVote(proposalId, support.For, {from: david}) 
                        await daoProxy.castVote(proposalId, support.For, {from: ed}) 
                    }
                },
                {
                    height: Number(votingDelay+1+votingPeriod+1+votingDelay),
                    callback: async () => {
                            await daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: alice})
                    }
                },
                {
                    height: 44,
                    callback: async () => daoProxy.execute(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: fred})
                }
            ]

            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                actions,
                45
            )
            assert.equal(results[results.length - 1].e.reason , String(`AccessControl: account ${String(fred).toLowerCase()} is missing role ${MEMBER_ROLE}`))
        });

        it("executes proposal", async ()=> {


            let proposal = new Proposal(
                governor.address,
                governorInst.methods.setVotingPeriod(15).encodeABI(),
                "executes proposals"
            )

            let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));

            let actions = [
                {
                    height: 0,
                    callback: async () => {
                            await daoProxy.createMember({from: alice})
                            await daoProxy.createMember({from: david})
                            await daoProxy.createMember({from: carl})
                            await daoProxy.createMember({from: ed})
                            await daoProxy.createMember({from: bob})
                        }
                },
                {
                    height: 1,
                    callback: async () => daoProxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: alice})
                },
                {
                    height: Number(votingDelay+1),
                    callback: async () => { 
                        await daoProxy.castVote(proposalId, support.For, {from: alice}) 
                        await daoProxy.castVote(proposalId, support.For, {from: bob}) 
                        await daoProxy.castVote(proposalId, support.For, {from: carl}) 
                        await daoProxy.castVote(proposalId, support.For, {from: david}) 
                        await daoProxy.castVote(proposalId, support.For, {from: ed}) 
                    }
                },
                {
                    height: Number(votingDelay+1+votingPeriod+1+votingDelay),
                    callback: async () => daoProxy.queue(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: alice})
                },
                {
                    height: 44,
                    callback: async () => daoProxy.execute(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description), {from: carl})
                },
                {
                    height: 49,
                    callback: async () => governorInst.methods.votingPeriod().call()
                }
            ]

            let results = await fakeMine(
                async () => token.rewardTokens(other, {from: owner}),
                actions,
                50,
                {
                    logs: true,
                    actionNumber: [
                        {h: 44, wrapper: result => console.log(result)}
                    ]
                }
            )

            let newVotingPeriod = results[results.length -1];
            assert.equal(Number(newVotingPeriod), 15, "proposal not executed correctly");
        })
    })

    describe("Execution of core dao functionalities through proposals", ()=> {

        // create all proposals wih their descriptions
        let [ 
            setVotingPeriodDesc, 
            setVotingDelayDesc, 
            setTokenRewardDesc, 
            setTimelockAddressDesc, 
            setTimelockDelayDesc, 
            setGovTokenRewardDesc, 
            setImplementationAddressDesc,
            slashVotesDesc,
            rewardTokensDesc,
            rewardVotesDesc,
            createNftDesc
         ] = [
            "set voting period", 
            "set voting delay",
            "set token reward",
            "set timelock address",
            "set timelock delay",
            "set vote reward",
            "set implemenation address",
            "slash votes of account",
            "reward tokens", 
            "reward votes",
            "create NFT"
        ]

        let members = [
            {address: alice, support: support.For},
            {address: bob, support: support.For},
            {address: carl, support: support.For},
            {address: david, support: support.For},
            {address: ed, support: support.For},
            {address: gerald, support: support.For},
            {address: hilda, support: support.For}
        ]

            describe("System Proposals", () => {
                            
                
                it("it updates voting period through proposal", async ()=> {

                    let proposal = new Proposal(
                        governor.address,
                        governorInst.methods.setVotingPeriod(13).encodeABI(),
                        setVotingPeriodDesc
                    )
                    
                    let toTest = async () => governor.votingPeriod()
                    
                    let [results, testResults, error] = await fakeMineTwo(governor,
                        daoProxy, 
                        proposal, 
                        members,
                        async () => token.rewardTokens(other, {from: owner}),
                        toTest,
                        proposalState,
                        settings
                    )
                    let [votingPeriod] = testResults
                    assert.equal(Number(votingPeriod.toString()), 13, "voting period does not match input"); 
                });

                it("it updates voting delay through proposal", async ()=> {
                    
                    let proposal = new Proposal(
                        governor.address,
                        governorInst.methods.setVotingDelay(15).encodeABI(),
                        setVotingDelayDesc
                    )

                    let toTest = async () => governor.votingDelay()
                    
                    let [results, testResults] = await fakeMineTwo(
                        governor,
                        daoProxy, 
                        proposal, 
                        members,
                        async () => token.rewardTokens(other, {from: owner}),
                        toTest,
                        proposalState,
                        settings
                    )
                    let [votingDelay] = testResults; 
                    assert.equal(Number(votingDelay.toString()), 15, "does not set correct voting delay through proposal");

                });

                it("it updates token reward through proposal", async ()=> {
                    
                    let proposal = new Proposal(
                        token.address,
                        tokenInst.methods.setBaseReward(unitToBN(10)).encodeABI(),
                        setTokenRewardDesc
                    )
                    
                    let toTest = async () => token.getBaseReward();
                    
                    let [results, testResults, error] = await fakeMineTwo(
                        governor,
                        daoProxy, 
                        proposal, 
                        members,
                        async () => token.rewardTokens(other, {from: owner}),
                        toTest,
                        proposalState,
                        settings
                    )
                    let [newBaseReward] = testResults;
                    assert.equal(toUnit(newBaseReward), 10, "does not reward tokens through daoProxy proposal");
                });

                it("it updates timelock address through proposal", async ()=> {
                    
                    let newTimelock = await Timelock.new(timelockDelay, proposers, executors);
                    
                    let proposal = new Proposal(
                        governor.address,
                        governorInst.methods.updateTimelock(newTimelock.address).encodeABI(),
                        setTimelockAddressDesc
                    )
                    
                    let toTest = async () => governor.timelock();
                    
                    let [results, testResults, error] = await fakeMineTwo(
                        governor,
                        daoProxy, 
                        proposal, 
                        members,
                        async () => token.rewardTokens(other, {from: owner}),
                        toTest,
                        proposalState,
                        settings
                    )
                    let [newAddress] = testResults;
                    assert.equal(newAddress.toString(), newTimelock.address, "does not reward tokens through daoProxy proposal");
                });

                it("it updates timelockdelay", async ()=> {
                    
                    let proposal = new Proposal(
                        timelocker.address,
                        timelockerInst.methods.updateDelay(5).encodeABI(),
                        setTimelockDelayDesc,
                    )
                    
                    let toTest = async () => timelocker.getMinDelay();
                    
                    let [results, testResults, error] = await fakeMineTwo(
                        governor,
                        daoProxy, 
                        proposal, 
                        members,
                        async () => token.rewardTokens(other, {from: owner}),
                        toTest,
                        proposalState,
                        settings
                    )

                    let [newDelay] = testResults;
                    assert.equal(Number(newDelay.toString()), 5, "does not update delay succesfully");
                });

                it("it sets govToken rewards through proposal", async ()=> {
                    
                    let proposal = new Proposal(
                        govToken.address,
                        govTokenInst.methods.setRewardVotes(unitToBN(150)).encodeABI(),
                        setGovTokenRewardDesc
                    )
                    
                    let toTest = async () => govToken.getRewardVotes();
                    
                    let [results, testResults, error] = await fakeMineTwo(
                        governor,
                        daoProxy, 
                        proposal, 
                        members,
                        async () => token.rewardTokens(other, {from: owner}),
                        toTest,
                        proposalState,
                        settings
                    )

                    let [newBase] = testResults;
                    assert.equal(toUnit(newBase), 150, "does govToken rewards succesfully");
                });

                it("it updates proxy to new implementation through proposal", async ()=> {
                    
                    let newImplementation = await IkonDAO.new();

                    let proposal = new Proposal(
                        daoProxy.address,
                        daoProxyInst.methods.upgradeTo(newImplementation.address).encodeABI(),
                        setImplementationAddressDesc
                    )

                    let toTest = async () => {}
                    
                    
                    let [results, testResults, error] = await fakeMineTwo(
                        governor,
                        daoProxy, 
                        proposal, 
                        members,
                        async () => token.rewardTokens(other, {from: owner}),
                        toTest,
                        proposalState,
                        settings
                    )

                    let upgradedTo = results[results.length - 1].logs[0].args['implementation']
                    // console.log(results[results.length - 1].logs[0].args['implementation'])
                    assert.equal(upgradedTo, newImplementation.address, "does not upgrade implemenation while maitaining state");
                });

            });

        describe("Accountability proposal", () => { 
            it("slashes votes through proposal", async () => {

                let proposal = new Proposal(
                    govToken.address,
                    govTokenInst.methods.slashVotes(bob, unitToBN(30)).encodeABI(),
                    slashVotesDesc
                )

                let toTest = async () => govToken.balanceOf(bob)
                                
                let [results, testResults, error] = await fakeMineTwo(
                    governor,
                    daoProxy, 
                    proposal, 
                    members,
                    async () => token.rewardTokens(other, {from: owner}),
                    toTest,
                    proposalState,
                    settings
                )

                let [bobsVotes] = testResults;
                assert.equal(toUnit(bobsVotes), 70, "does not slash votes of account");

            });
            it("it bans members through proposal", async () => {

                let proposal = new Proposal(
                    daoProxy.address,
                    daoProxyInst.methods.banMember(bob).encodeABI(),
                    slashVotesDesc
                )

                let toTest = async () => daoProxy.hasRole(BANNED_ROLE, bob);
                                
                let [results, testResults, error] = await fakeMineTwo(
                    governor,
                    daoProxy, 
                    proposal, 
                    members,
                    async () => token.rewardTokens(other, {from: owner}),
                    toTest,
                    proposalState,
                    settings
                )
                
                let [isBobBanned] = testResults;
                assert.isTrue(isBobBanned, "does not slash votes of account");
            });
        });

        describe("DAO proposals", () => {
            it("rewards tokens through proposal", async () => {
                let proposal = new Proposal(
                    token.address,
                    tokenInst.methods.rewardTokens(members[2].address).encodeABI(),
                    rewardTokensDesc
                )
                
                let toTest = async () => {
                    let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
                    let state = await governor.state(proposalId);
                    return state; 
                };

                                
                let [results, testResults, error] = await fakeMineTwo(
                    governor,
                    daoProxy, 
                    proposal, 
                    members,
                    async () => token.rewardTokens(other, {from: owner}),
                    toTest,
                    proposalState,
                    settings
                )
                
                let state = Number(testResults[testResults.length - 1].toString());
                assert.isTrue(state === proposalState.Executed, "does reward tokens");
            });

            it("rewards votes through proposal", async () => {
                let proposal = new Proposal(
                    govToken.address,
                    govTokenInst.methods.rewardVotes(carl).encodeABI(),
                    rewardVotesDesc
                )

                let toTest = async () => govToken.balanceOf(carl);                                
                
                let [results, testResults, error] = await fakeMineTwo(
                    governor,
                    daoProxy, 
                    proposal, 
                    members,
                    async () => token.rewardTokens(other, {from: owner}),
                    toTest,
                    proposalState,
                    settings
                )

                let [carlVotes] = testResults;
                assert.isAbove(toUnit(carlVotes), 100, "does not slash votes of account");
            }); 

            it("it mints nfts through proposal", async () => {
                
                let nftArgs = {
                    imageHash: "oidiuaerahdfaoi",
                    category: web3.utils.utf8ToHex("Things"),
                }
                
                let proposal = new Proposal(
                    [
                        nft.address, // mint nft
                        govToken.address, // reward votes
                        token.address, // reward tokens
                    ],
                    [
                        nftInst.methods.safeMintVector(
                            nftArgs.imageHash,
                            nftArgs.category
                        ).encodeABI(),
                        govTokenInst.methods.rewardVotes(carl).encodeABI(),
                        tokenInst.methods.rewardTokens(carl).encodeABI()
                    ],
                    createNftDesc,
                    [0, 0, 0]
                )

                let toTest = async () => {
                    let proposalId = await governor.hashProposal(proposal.targets, proposal.values, proposal.calldatas, toSha3(proposal.description));
                    let state = await governor.state(proposalId);
                    return state; 
                };          
                
                let [results, testResults, error] = await fakeMineTwo(
                    governor,
                    daoProxy, 
                    proposal, 
                    members,
                    async () => token.rewardTokens(other, {from: owner}),
                    toTest,
                    proposalState,
                    settings
                )
                let [state] = testResults;
                assert.isTrue(Number(state.toString()) === proposalState.Executed, "does not create nft on proposal execution");
            });
        });       
    });
    
})