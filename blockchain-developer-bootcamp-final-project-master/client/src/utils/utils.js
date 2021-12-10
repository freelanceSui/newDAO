// some helper functions for calculating bignumbers
const { replace } = require("lodash");
// const BN = require("big.js");
const web3 = require("web3");
const BN = web3.utils.BN;


// from normal number to bn
exports.toUnit = res => new BN(String(res)).div(new BN(String(1e18))).toNumber();
exports.unitToBN = num => new BN(String(num * 1e18));
exports.toNumber = res => new BN(String(res)).toNumber();
exports.toBN = num => new BN(String(num));
/// for fakeMining items
exports.fakeMine = async (fakeMine, actions, miningLength, options = undefined) => {

    let results = [];
    let counter = 0;
    for (let i = 0; i < miningLength; i++){
            
            if (actions.filter(action => action.height === i).length != 0){
                
                let result, error;
                try {
                        result = await actions[counter].callback();
                } catch (e){
                        error = e;
                }
                if (options != undefined && options.log === true){
                        if (options.actionNumber.h != undefined && options.actionNumber.h === i){
                                options.actionNumber.wrapper(result);
                        } 
                        if (options.actionNumber.length != undefined && options.actionNumber.filter(action => action.h === i).length != 0){
                                options.actionNumber.filter(action => action.h === i)[0].wrapper(result);
                        }
                                
                } 
                results.push(error ? {r: result, e: error} : result);
                counter++; 
            } 
            await fakeMine();       
    }
    return results; 
} 
exports.extractEventSignatures = abi => abi.filter( obj => (obj.type === 'event'));

exports.generateMappingsFromSignatures = objSigs => { 
        
        let sigMap = new Map();

        for(let i = 0; i < objSigs.length; i++){
                if (objSigs[i] && objSigs[i].name && objSigs[i].signature){
                        sigMap.set(objSigs[i].name, [objSigs[i].signature]);
                }
        }
        return sigMap;
}

exports.subscribeToLogs = (address, topics, web3, type) => web3.eth.subscribe(
        type, 
        {address: address, topics: topics}, 
        (error, result) => !error ? console.log(result) : console.log(error) 
        ) 

exports.fakeMineTwo = async (gov, proxy, proposal, members, fakeMineFunc, testFunc, proposalState, settings) => {

        let results = []; 
        let testResults = [];
        let proposalId, resCreateMembers, state;

        try {
                
                resCreateMembers = await Promise.all(members.map(async member => await proxy.createMember({from: member.address})));  
                // create members first 
                await proxy.propose(proposal.targets, proposal.values, proposal.calldatas, proposal.description, {from: members[Math.floor(Math.random() * members.length)].address }); /// create proposal
                
                proposalId = await gov.hashProposal(proposal.targets, proposal.values, proposal.calldatas, web3.utils.soliditySha3(proposal.description)); 
                
                state = await gov.state(proposalId, {from: members[Math.floor(Math.random() * members.length)].address }); ///

                results.push(resCreateMembers);
                results.push(proposalId);
                results.push(state);

        } catch (e){
                console.log(e);
        }

        let stopFakeMining = false;
        let counter = 1; 
        let error;
        while (!stopFakeMining){
                
                state = await gov.state(proposalId, {from: members[Math.floor(Math.random() * members.length)].address});

                if ( (counter === settings.votingDelay ) && Number(state.toString()) === proposalState.Active){

                        try {
                                let result = await Promise.all(members.map(async member => proxy.castVote(proposalId, member.support, {from: member.address})));
                                results.push(result);
                                
                        } catch (e){
                                error = e;
                        } 

                }
                
                if (Number(state.toString()) === proposalState.Succeeded){
                        try {
                                let result = await proxy.queue(proposal.targets, proposal.values, proposal.calldatas, web3.utils.soliditySha3(proposal.description), {from: members[Math.floor(Math.random() * members.length)].address })
                                results.push(result);

                        } catch (e){ 
                                error = e;                                
                        }
                }

                if ((counter === settings.timelockDelay) && Number(state.toString()) === proposalState.Queued){
                        try {
                                let result = await proxy.execute(proposal.targets, proposal.values, proposal.calldatas, web3.utils.soliditySha3(proposal.description), {from: members[Math.floor(Math.random() * members.length)].address})
                                results.push(result);
                                continue;

                        } catch (e){ 
                                error = e;                                
                        }
                }
                if (    
                        (counter === settings.timelockDelay) &&
                        (Number(state.toString()) === proposalState.Executed || 
                        Number(state.toString()) === proposalState.Failed || 
                        Number(state.toString()) === proposalState.Expired || 
                        Number(state.toString()) === proposalState.Defeated || 
                        Number(state.toString()) === proposalState.Canceled)  
                ){
                        let result = await testFunc();
                        testResults.push(result); 
                        stopFakeMining = true;
                }

                if (error){
                        console.log(error);
                        stopFakeMining = true;
                }

                counter++; 
                await fakeMineFunc();
        }
        
        
        return [results, testResults]; 
}
exports.toSha3 = (input) => web3.utils.soliditySha3(input);
exports.stringToHex = input => web3.utils.utf8ToHex(input);