// load dependencies 
const { assert } = require('chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

const { toUnit, unitToBN } = require("./helpers");
const IkonDAOToken = artifacts.require('IkonDAOToken');



contract("IkonDAO (utility token)", accounts => {
    let owner = accounts[0]; 
    let other = accounts[1];
    let alice = accounts[2];
    
    // utility token
    let baseRewardUtility = unitToBN(5);
    let token;    

    beforeEach(async ()=> {
        /// create contract insntance
        token = await IkonDAOToken.new(baseRewardUtility, {from: owner}); 
    })

    // initializes correctly
    it("sets correct baserewards", async () => {  
        let basereward = await token.getBaseReward();
        assert.equal(toUnit(basereward), 5, "should initialize with 5");        
    }); 

    it("admin (dao) should have 10million tokens", async () => {
        let balanceOfOwner = await token.balanceOf(owner);
        assert.equal(toUnit(balanceOfOwner), 1000000, "initial dao balance not set correctly");
    });

    // functionalities
    it("should reward tokens", async () => {
        await token.rewardTokens(alice);
        let balanceOfAlice = await token.balanceOf(alice); 
        assert.equal(toUnit(balanceOfAlice), 5, "does not distribute rewards correctly"); 
    });

    it("sets new base reward", async () => {
        await token.setBaseReward(unitToBN(10));
        let baseReward = await token.getBaseReward();
        assert.equal(toUnit(baseReward), 10, "does not correctly set basereward");
    });

    it("allows only minter to mint", async () => {
        await expect(token.mint(unitToBN(500), {from: alice})).to.be.rejected
    }); 
})