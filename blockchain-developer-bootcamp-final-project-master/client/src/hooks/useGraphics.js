import {useState, useEffect} from 'react';
import { useAppContext } from '../AppContext';

// for retrieving tokenIds and validating nfts
import nftArtifact from '../contracts/IkonDAOVectorCollectible.json';
import governorArtifact from '../contracts/IkonDAOGovernor.json';
import { useContract } from './useContract';
import { mergeIpfsData } from '../web3-storage/ipfsStorage';

// for making freebies available for download
import { proposalStates } from '../helpers/proposalStates';

export function useGraphics(loaded, setLoaded) {
    const { setGraphics, graphics } = useAppContext();
    const nft = useContract(process.env.NFT_CONTRACT, nftArtifact.abi);
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi)
    
    useEffect(()=> {
        if (!graphics && !loaded){
            setGraphics();
            setLoaded(true);
        }
        if(graphics){
            // validates if token is in contract
            nft.methods.totalSupply().call() 
            .then(tokens => {
                for(let i = 0; i < tokens; i++){
                    nft.methods.getMetadata(i).call().then(async ({image}) => {
                        if(graphics.get(image) && graphics.get(image).type !== 'nft'){
                            let nftObj = graphics.get(image);
                            nftObj.status = 0; // sets status to processed 
                            nftObj.type = 'nft'; // sets type to nft
                            
                            // updates data on ipfs to reflect changes
                            // reloads data in appcontext
                            await mergeIpfsData('graphics', image, nftObj);
                            await setGraphics();
                        };
                    }).catch(e => console.log(e));
                }
            }).catch(e => console.log(e));
            
            
            // validates if graphic is processed 
            // proposals with state canceled, defeated, or expired are marked as processed
            // succeeded proposals will automatically have their status change to processed
            // only targets non processed freebies  
            [...graphics.entries()].filter(([hash, vector]) => vector.type !== 'nft')
            .forEach(([hash, vector], i) => {    
                governor.methods.state(vector.proposalId).call().then(async state => {
                    if(
                        (proposalStates[String(state)].text === 'Canceled' || 
                        proposalStates[String(state)].text === 'Expired' || 
                        proposalStates[String(state)].text === 'Defeated!') &&
                        vector.status != 0 
                    ) {
                        vector.status = 0; // vector processed
                        // updates data on ipfs to reflect changes 
                        await mergeIpfsData('graphics', vector.image, vector);
                    }
                })
                
            })
            setLoaded(true); // set loaded
        } 


    }, [graphics]);

    return graphics; 
}
