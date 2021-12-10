import {useState, useEffect} from 'react';
import { useAppContext } from '../AppContext';

// for validating nft
import { useContract } from './useContract';
import nftArtifact from '../contracts/IkonDAOVectorCollectible.json';


export function useGetTokenId(imageHash) {
    const nft = useContract(process.env.NFT_CONTRACT, nftArtifact.abi);
    const [tokenId, setTokenId ] = useState();
    useEffect(()=> {
        nft.methods.totalSupply().call().then(supply => {
            for(let i = 0; i < supply; i++){
                nft.methods.getMetadata(i).call().then(({image}) => {
                    if(image === imageHash)setTokenId(i);
                })
            }
        });

        
    }, [imageHash]);
    return tokenId; 
}
