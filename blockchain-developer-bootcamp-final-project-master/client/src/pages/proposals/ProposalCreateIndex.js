import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProposalCreate from '../../components/proposals/ProposalCreate'
import { Container } from 'react-bootstrap';

export default function ProposalCreateIndex() {
    return (
        <>
            <Helmet>
                <title>Create Proposal</title>
            </Helmet>
            <Container fluid>
                <ProposalCreate />
            </Container>
        </>
    )
}
