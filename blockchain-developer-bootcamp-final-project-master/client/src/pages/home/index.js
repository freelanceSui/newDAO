import React from 'react'; 
import { Container } from 'react-bootstrap';
import Hero from '../../components/home/Hero';
import { Helmet } from 'react-helmet-async';

export default function Home() {

    return (
        <>
        <Helmet>
            <title>IkonDao</title>
        </Helmet>
        <Container id="home" fluid>
            <Hero />
        </Container>
        </>
    )
}
