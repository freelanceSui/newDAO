import React , {useState}from 'react';
import VectorCard from './VectorCard';
import { Container } from 'react-bootstrap';

// for retrieving vectors
import {useGraphics} from '../../hooks/useGraphics';

export default function VectorList() {
    const [loaded, setLoaded] = useState(false);
    const graphics = useGraphics(loaded,    setLoaded) 

    return (
            <Container className="d-flex flex-wrap" fluid>
            {   
                loaded && graphics ? [...graphics.entries()].filter(([hash, meta]) => meta.type !== 'nft' && Number(meta.status) === 0).map(([hash, meta]) => (
                    <VectorCard 
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
                ) :
                <h1>...Loading</h1>
            }
            </Container>
        )
}
