import React from 'react'; 
import { Helmet } from 'react-helmet-async';
import ProposalsList from '../../components/proposals/ProposalList'; 
import {Container } from 'react-bootstrap';

export default function ProposalsIndex() {
    return (
        <>
            <Helmet>
                <title>Proposal</title>
            </Helmet>
            <Container id="proposals" fluid>
                <ProposalsList />
            </Container>
        </>
    )
}
