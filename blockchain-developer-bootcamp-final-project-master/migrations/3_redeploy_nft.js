require('dotenv').config({path: "client/.env.development"});
const {unitToBN, toBN } = require('../test/helpers');
const toSha3 = web3.utils.soliditySha3;

// artifact 
const IkonDAOVectorCollectible = artifacts.require("IkonDAOVectorCollectible");

module.exports = async function (deployer, networks, accounts) {
    
    if (networks !== 'development'){
        const [MINTER_ROLE, PAUSER_ROLE] = [toSha3("IKONDAO_PAUSER_ROLE"), toSha3("IKONDAO_MINTER_ROLE")];
    
        // deploy nft
        await deployer.deploy(IkonDAOVectorCollectible, process.env.PROXY_CONTRACT);
        let nft = await IkonDAOVectorCollectible.deployed(); 
    
        await nft.grantRole(MINTER_ROLE, process.env.TIMELOKCER_CONTRACT) // for timelocker to mint nfts
        await nft.grantRole(PAUSER_ROLE, process.env.TIMELOKCER_CONTRACT) // for timelocker to mint nfts
    }
    // do nothing
}