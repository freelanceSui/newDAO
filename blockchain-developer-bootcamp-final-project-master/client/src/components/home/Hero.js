import React from 'react';
import { Container } from 'react-bootstrap';
import Register from './Register.js';


export default function Hero() {
    const containerStyle={height: "100%"}
    return (
        <>
            <Container style={containerStyle} className="d-flex align-items-center justify-content-center">
                <Register />
            </Container>
        </>
    )
}
