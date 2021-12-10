import { useMemo } from 'react';
import { AddressZero } from '@ethersproject/constants';
import Web3 from 'web3';

export function useProvider(id) {
    return useMemo(() => {
        return new Web3(`https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY_ID}`);
    }, [id]);
}
