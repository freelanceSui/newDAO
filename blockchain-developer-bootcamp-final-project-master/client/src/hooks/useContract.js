import { useMemo } from 'react';
import {
  Contract,
  // ContractInterface
} from '@ethersproject/contracts';
import { AddressZero } from '@ethersproject/constants';
import Web3 from 'web3';

export function useContract(contractAddress, ABI) {

    if (contractAddress === AddressZero) {
        throw Error(`Invalid 'contractAddress' parameter '${contractAddress}'.`);
    }
    
    return useMemo(() => {
        const provider = new Web3(`https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY_ID}`);
        return new provider.eth.Contract(ABI, contractAddress);
    }, [ABI, contractAddress]);
}
