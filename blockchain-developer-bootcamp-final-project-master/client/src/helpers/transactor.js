// // for creating an ethererum transactions
import Web3 from 'web3';

export async function callContract(to, data) {
    
    // create provider
    const provider = new Web3(window.ethereum);
    provider.eth.defaultAccount = window.ethereum.selectedAddress;

    const transaction = {
        from: provider.eth.defaultAccount,
        to: to,
        data: data,
        nonce: await provider.eth.getTransactionCount(window.ethereum.selectedAddress, 'latest'),
    }
    
    return provider.eth.sendTransaction(transaction).on('transactionHash', hash => {
        console.log(hash)// should emit event after reception of txHash
    }); 
}   