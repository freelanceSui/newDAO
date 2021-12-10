// modules
require('dotenv').config({path: "client/.env.development"});
const {unitToBN, toBN } = require('../test/helpers');
const toSha3 = web3.utils.soliditySha3;

// contracts
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const IkonDAO = artifacts.require('IkonDAO');
const IkonDAOGovernanceToken = artifacts.require('IkonDAOGovernanceToken');
const IkonDAOToken = artifacts.require('IkonDAOToken');
const IkonDAOGovernor = artifacts.require('IkonDAOGovernor');
const Timelock = artifacts.require('Timelock');
const IkonDAOVectorCollectible = artifacts.require("IkonDAOVectorCollectible");


module.exports = async function (deployer, networks, accounts) {
  let [MEMBER_ROLE, ADMIN_ROLE, BANNED_ROLE, PAUSER_ROLE, MINTER_ROLE, TIMELOCK_ADMIN, PROPOSER_ROLE, EXECUTOR_ROLE] = [
    toSha3("IKONDAO_MEMBER_ROLE"),
    toSha3("IKONDAO_ADMIN_ROLE"),
    toSha3("IKONDAO_BANNED_ROLE"),
    toSha3("IKONDAO_PAUSER_ROLE"),
    toSha3("IKONDAO_MINTER_ROLE"),
    toSha3("TIMELOCK_ADMIN_ROLE"),
    toSha3("PROPOSER_ROLE"),
    toSha3("EXECUTOR_ROLE")
  ]
  
  // gov token 
  let weigthLimitFraction = toBN(49); // set weight limit fraction to 49%
  let initialVotes = unitToBN(100); // initial users are rewarded 100 votes tokens
  let baseRewardVotes = unitToBN(100); // the base rewards for votes
  
  // utility token
  let baseRewardUtility = unitToBN(10);
  
  // governor
  let votingDelay = 4; // one minute delay for voting to start aftercreation
  let votingPeriod = 40; // 10 minute window for voting  
  
  // timelocker 
  let timelockDelay = 4; // 1 minute delay for succeeded proposals execution 

  // users and initial users for contract
  let owner = accounts[0]
  let [alice, bob, carl, david] = networks !== 'development' 
  ? [process.env.ALICE_ADDRESS, process.env.BOB_ADDRESS, process.env.CARL_ADDRESS, process.env.DAVID_ADDRESS]
  : [accounts[2], accounts[3], accounts[4], accounts[5]]

  
  let initialUsers = [owner, alice, bob, carl, david];
  let proposers = [owner]
  let executors = [owner]

  // initiate new contracts before each describe 
  // deploy governance token
  await deployer.deploy(IkonDAOGovernanceToken, weigthLimitFraction, initialUsers, initialVotes, baseRewardVotes, {from: owner});
  let govToken = await IkonDAOGovernanceToken.deployed()
  
  // deploy token
  await deployer.deploy(IkonDAOToken, baseRewardUtility, {from: owner});
  let token = await IkonDAOToken.deployed()
  
  // deploy timelocker
  await deployer.deploy(Timelock, timelockDelay, proposers, executors);
  let timelocker = await Timelock.deployed()

  // deploy governor
  await deployer.deploy(IkonDAOGovernor, govToken.address, timelocker.address, votingDelay, votingPeriod, {from: owner});
  let governor = await IkonDAOGovernor.deployed()
  
  // deploy proxy
  let daoProxy = await deployProxy(IkonDAO, [governor.address, timelocker.address, token.address], {initializer: '__IkonDAO_init', kind: 'uups', unsafeAllow: ['constructor', 'delegatecall']});
  
  // deploy nft
  await deployer.deploy(IkonDAOVectorCollectible, daoProxy.address);
  let nft = await IkonDAOVectorCollectible.deployed()
  
  // initiate members
  await daoProxy.grantRole(MEMBER_ROLE, alice);
  await daoProxy.grantRole(MEMBER_ROLE, bob);
  await daoProxy.grantRole(MEMBER_ROLE, carl);
  await daoProxy.grantRole(MEMBER_ROLE, david);
  
  // give proxy admin rights to governor
  await governor.grantRole(ADMIN_ROLE, daoProxy.address, {from: owner}); // for proxy to make proposals and execute through governor
  await governor.grantRole(ADMIN_ROLE, timelocker.address, {from: owner}); // for timelocker to execute proposals

  // token intial roles
  await token.grantRole(ADMIN_ROLE, timelocker.address, {from: owner}); // for timelocker to execute proposals
  await token.grantRole(ADMIN_ROLE, governor.address, {from: owner}); // for timelocker to execute proposals
  
  // govtoken initial roles
  await govToken.grantRole(ADMIN_ROLE, timelocker.address, {from: owner}); // for timelocker to execute proposals
  
  // proxy initial roles
  await daoProxy.grantRole(ADMIN_ROLE, timelocker.address, {from: owner}); // for timlocker to exectute proposals
  
  // nft initial roles 
  await nft.grantRole(MINTER_ROLE, timelocker.address, {from: owner}) // for timelocker to mint nfts
  await nft.grantRole(PAUSER_ROLE, timelocker.address, {from: owner}) // for timelocker to mint nfts

  // timelocker initial roles
  await timelocker.grantRole(PROPOSER_ROLE, governor.address); // for queueing of proposals
  await timelocker.grantRole(EXECUTOR_ROLE, governor.address); // for executing transactions
};

