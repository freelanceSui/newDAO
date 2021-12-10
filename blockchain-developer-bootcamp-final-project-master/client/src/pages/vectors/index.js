import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from 'react-bootstrap'; 
import VectorList from '../../components/vectors/VectorList';

export default function VectorsIndex() {
    return (
        <>
            <Helmet>
                <title>Vectors</title>
            </Helmet>
            <Container fluid style={{marginTop: "10rem"}}>
                <VectorList />
            </Container>
        </>
    )
}