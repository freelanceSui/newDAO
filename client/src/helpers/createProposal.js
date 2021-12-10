// web 3
import Web3 from 'web3';

// abis 
import daoArtifact from '../contracts/IkonDAO.json';
import governorArtifact from '../contracts/IkonDAOGovernor.json';
import govTokenArtifact from '../contracts/IkonDAOGovernanceToken.json';
import tokenArtifact from '../contracts/IkonDAOToken.json';
import nftArtifact from '../contracts/IkonDAOVectorCollectible.json';
import timelockerArtifact from '../contracts/Timelock.json'; 

// utils 
import { unitToBN  } from '../utils/utils';

function Proposal (targets, datas, description, values = undefined){
    this.targets = typeof(targets) != 'object' ? Array(targets) : targets;
    this.values = typeof(values) === 'undefined' ? [0] : values;
    this.calldatas = typeof(targets) != 'object' ? Array(datas) : datas;
    this.description = description;
}

export function createProposalAction(action, inputs, description){ // returns an action object based on action type
    
    // provider
    const provider = new Web3(`https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY_ID}`);

    // contract instances  
    const governor = new provider.eth.Contract(governorArtifact.abi, process.env.GOVERNOR_CONTRACT);
    const token = new provider.eth.Contract(tokenArtifact.abi, process.env.UTILITY_TOKEN_CONTRACT);
    const timelocker = new provider.eth.Contract(timelockerArtifact.abi, process.env.TIMELOKCER_CONTRACT);
    const nft = new provider.eth.Contract(nftArtifact.abi, process.env.NFT_CONTRACT);
    const proxy = new provider.eth.Contract(daoArtifact.abi, process.env.PROXY_CONTRACT);
    const govToken = new provider.eth.Contract(govTokenArtifact.abi, process.env.GOV_TOKEN_CONTRACT);
    
    switch(action){

        // system proposals
        case "setVotingPeriod":
            return new Proposal(
                process.env.GOVERNOR_CONTRACT, // targets,
                governor.methods.setVotingPeriod(Number(inputs)).encodeABI(),// calldatas
                description // description
                // values
            )

        case "setVotingDelay":
            return new Proposal(
                process.env.GOVERNOR_CONTRACT, // targets,
                governor.methods.setVotingDelay(Number(inputs)).encodeABI(),// calldatas
                description // description
                // values
            )

        case "setBaseReward":
            return new Proposal(
                process.env.UTILITY_TOKEN_CONTRACT, // targets,
                token.methods.setBaseReward(unitToBN(Number(inputs))).encodeABI(),// calldatas
                description // description
                // values
            )

        case "setRewardVotes":
            return new Proposal(
                process.env.GOV_TOKEN_CONTRACT, // targets,
                govToken.methods.setRewardVotes(unitToBN(Number(inputs))).encodeABI(),// calldatas
                description // description
                // values
            )

        case "updateDelay":
            return new Proposal(
                process.env.TIMELOKCER_CONTRACT, // targets,
                timelocker.methods.updateDelay(Number(inputs)).encodeABI(),// calldatas
                description // description
                // values
            )

        case "updateTimelock":
            return new Proposal(
                process.env.GOVERNOR_CONTRACT, // targets,
                governor.methods.updateTimelock(inputs).encodeABI(),// calldatas
                description // description
                // values
            )

        case "upgradeTo": 
            return new Proposal(
                process.env.PROXY_CONTRACT, // targets,
                proxy.methods.upgradeTo(inputs).encodeABI(),// calldatas
                description // description
                // values
            )
        
        // accountability proposals
        case "slashVotes":
            return new Proposal(
                process.env.GOV_TOKEN_CONTRACT, // targets,
                govToken.methods.slashVotes(inputs.target, unitToBN(Number(inputs.value))).encodeABI(),// calldatas
                description // description
                // values
            )
        
        case "banMember":
            return new Proposal(
                process.env.PROXY_CONTRACT, // targets,
                proxy.methods.banMember(inputs).encodeABI(),// calldatas
                description // description
                // values
            )
        
        // dao proposals
        case "rewardTokens":
            return new Proposal(
                process.env.UTILITY_TOKEN_CONTRACT, // targets,
                token.methods.rewardTokens(inputs).encodeABI(),// calldatas
                description // description
                // values
            )
        
        case "rewardVotes":
            return new Proposal(
                process.env.GOV_TOKEN_CONTRACT, // targets,
                govToken.methods.rewardVotes(inputs).encodeABI(),// calldatas
                description // description
                // values
            )
            
        case 'safeMintVector':
            return new Proposal(
                [
                    process.env.NFT_CONTRACT,
                    process.env.GOV_TOKEN_CONTRACT,
                    process.env.UTILITY_TOKEN_CONTRACT
                ], // targets,
                [
                    nft.methods.safeMintVector(
                        inputs.nft.imageHash,
                        inputs.nft.category
                    ).encodeABI(),
                    govToken.methods.rewardVotes(inputs.proposer).encodeABI(),
                    token.methods.rewardTokens(inputs.proposer).encodeABI()
                ],// calldatas
                description, // description
                [0, 0, 0] // values
            )
        default:
            return undefined
    } 
}
