import React from 'react'; 
import { Helmet } from 'react-helmet-async';
import { Container } from 'react-bootstrap';
import NFTList from '../../components/nfts/NFTList';

export default function NFTSIndex() {
    return (
        <>
            <Helmet>
                <title>Nfts</title>
            </Helmet>
            <Container fluid style={{marginTop: "10rem"}}>
                <NFTList /> 
            </Container>
        </>
    )
}