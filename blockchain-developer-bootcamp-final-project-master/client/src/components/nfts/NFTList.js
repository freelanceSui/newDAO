import React, {useState} from 'react';
import NFTCard from './NFTCard';
import { Container } from 'react-bootstrap';

// for retrieving nfts
import {useGraphics} from '../../hooks/useGraphics';

export default function NFTList() {
    // retrieve nft's from web3.storage
    const [loaded, setLoaded] = useState(false);
    const graphics = useGraphics(loaded, setLoaded);
        
    return (
        <Container className="d-flex flex-wrap" fluid>
        {   
            loaded && graphics ? [...graphics.entries()].filter(([hash,meta]) => meta.type !== 'freebie').map(([hash, meta]) => (
                <NFTCard 
                    key={hash}
                    hash={hash}
                    name={meta.name}
                    description={meta.description}
                    externalLink={meta.external_url}
                    category={meta.category} 
                    handle={meta.artistHandle}
                    type={meta.type}
                />
                )
            )
            : <h1>...Loading</h1>
        }
        </Container>
    )
}
