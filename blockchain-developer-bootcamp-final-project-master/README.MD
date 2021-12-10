# Project Description
IkonDAO a dao for creatives e.g. graphic design, Icons and vecto design artists.

This platform that enables cooperative contributions from digital art creatives and fascilitates the (automatic) administration of the rewards attributed to their contributions. (note: this is an mvp, core functionalities are implemented, however the project is pre-alpha version thus a lot of work still needs to be done).

Hosted on Vercel [Demo Here](https://blockchain-developer-bootcamp-final-project-drab.vercel.app/)
WalkThrough [Youtube](https://youtu.be/iG6d8sCN1rQ)

Ethereum Address: 0x3AB9cb1244aa19aA727f33BBE1cfC6a6E09eC0D3

# How it works
The Dao act's a a collective that mints nfts on behalf of contributers contributers can propose to mint an nft, and if the proposal passes it will be minted. The DAO owns the nfts, but revenue (will) distributed by equal to the proportion of staked IKN tokens (biweakly).

The Idea is to have an organization that automates payments and that is owned and controlled by all.  

note: staking of NFT and buying nfts is not possible yet, given the timeline of the bootcamp was short, on top of that i'm pretty new at this.But would love to complete this project as a real product after the bootcamp.

## Workflows
- user logs in with metamask and clicks become member
- on proposals page user submits proposal
- user creates proposals
- if proposal passes changes are applied
    
### Types of proposals
- system proposals -> set voting period, delay, implementation contract, voting rewards etc.
- accountability proposals -> for holding bad actors accountable e.g. slashing votes and banning members (a participant is banned indefinitely)
- DAO proposals e.g. mint nfts (any other ideas?)

## Nuts and bolts
Proposals are done through a proxy contract that interfaces with the main implementation (dao contract, yes the doa can be upgraded). The governor keeps a tally of proposals and their ids, who voted, who didnt. Then there is a timelocker contracts that is the sole executer of proposals. only members can make proposals and instruct the timelocker to execute them, however it has to go through the proxy contract, members cannot directly interact with the governor contract, since the admin of the governor is the proxy (dao). 

note: only the timelocker has the rights to execute proposals and the timelocker itself is not owned by anyone (in the testing env. I'm the owner hehe). the timelocker address can be changed through votes as well, giving users complete control of the function of the dao.  

There is more to this but this should suffice for giving a relative understanding.

# Prerequisites
- Ganache-cli
- truffle v5
- webpack 5
- solidity v8.2.0
- metamask wallet connected to rinkeby

# Directory Structure
+ contracts - solidity contracts libraries and abstract contracts 
+ client/src/contracts - abis (.json)
+ test - js tests for smartcontracts 
+ client/src - react components for front-end
+ client/src/we3 - web3.storage ipfs storage api
+ client/src/pages - routes to application pages 

note: for more detailed information about the project [click this link](https://github.com/RasenGUY/blockchain-developer-bootcamp-final-project/blob/master/PROJECTINFO-README.md)

# Running the application locally
## # 1 Initializing project 
    # Clone project and install dependencies
    $ git clone git@github.com:RasenGUY/blockchain-developer-bootcamp-final-project.git
    $ cd blockchain-developer-bootcamp-final-project 
    $ yarn install 
    
    # Create env file
    $ touch .env 
    
### Contents of env file
- INFURA_RINKEBY_ID=infura project id
- INFURA_RINKEBY_SECRET=infura secret
- MNEMONIC=mnemonic of publisher wallet
- ALICE_ADDRESS=user address
- BOB_ADDRESS=user address
- CARL_ADDRESS=user address
- DAVID_ADDRESS=user address

    

## # 2 Runing tests
Once all dependencies are installed you can go ahead and run tests.
    # Ganache-cli 
    $ yarn add -g ganache-cli
    
    # Startup ganache client
    $ ganache-cli 
    
    # run tests
    $ truffle console --network development 
    $ truffle test

All tests you pass note that the tests are taking a while to run because some of the test require some blocks to be mined before they can be executed, alot of while loops :(

## # 3 Publishing Contracts
Once tests are run sucessfully you can go ahead and publish the contracts to rinkeby, but youl need some rinkeby which you can aquire [https://faucet.rinkeby.io/](https://faucet.rinkeby.io/), seems to offline now though.

    # Deploy to rinkeby 
    $ truffle migrate --network rinkeby

## # 4 Initializing the client
Once you deployed the contracts store the contract address on somewhere youl need them in a bit.
    
    # Copy Contract abi
    $ cd build/contracts
    $ cp IkonDAO.json IkonDAOGovernanceToken.json IkonDAOGovernor.json IkonDAOToken.json IkonDAOVectorCollectible.json Timelock.json client/contracts
    
    # .env.development in client folder (from root)
    $ touch client/.env.development
    
    #install dependencies for client
    $ cd client
    $ yarn install

    # running an instance of the app locally (see scripts package.json)
    $ npm run dev

+ Add the following inforamtion to client/.env
    - ENV=development
    - INFURA_RINKEBY_ID="your infura project id (rinkeby network)"
    - INFURA_RINKEBY_SECRET="your infura project secret (rinkeby network)"
    - PORTIS_ID="your portis id for"
    - FORTMATIC_KEY="your formatic key"
    - WEB3STORAGE="web3.storage api key"
    - GOV_TOKEN_CONTRACT="governance token contract"
    - UTILITY_TOKEN_CONTRACT="utility token contract address"
    - TIMELOKCER_CONTRACT="timelocker contract address"
    - GOVERNOR_CONTRACT="governor contract address"
    - PROXY_CONTRACT="proxy contract address"
    - IMPLEMENTATION_CONTRACT="IkonDAO contract address"
    - NFT_CONTRACT="nft contract address"


## Running without publishing contracts
if you want to test out the contract without publishing the contract yourself, you can just skip step # 3 and use these contract addresses instead: However, you will still have to add your infura, web3.storage etc. Alos, you will not be able to proposals since you wont have any voting power, however you can hit me up on discord @rassenguy#0445 and i will create a proposal so you can get some voting power.
    
+ Contract addresses
    - GOV_TOKEN_CONTRACT=0xbD5e679D716148000EB2712676A1FCBDAB916313
    - UTILITY_TOKEN_CONTRACT=0x4a159649CB08aC68fA8856753754decc67FCFe85
    - TIMELOKCER_CONTRACT=0x4075B994B91f809cD589A8b953BcE41031E47EC4
    - GOVERNOR_CONTRACT=0xb477339cd38458e5bB9F9c7dab3605b2f218d8fD
    - PROXY_CONTRACT=0x543aB80967A12AE906dEF07144262Ec4843C2e5a
    - IMPLEMENTATION_CONTRACT=0x394837B2566A383FA51F1B703B5F85f7B38FBC8D
    - NFT_CONTRACT=0x34232aE317c4d48D98b055f08d3A3F351C2F0883

#### credits to openzepplin and their governance smart contracts that made this project possible. 