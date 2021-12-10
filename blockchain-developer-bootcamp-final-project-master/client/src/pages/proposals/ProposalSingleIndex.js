import React from 'react'
import ProposalSingle from '../../components/proposals/ProposalSingle';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';


export default function ProposalSingleIndex() {
    const { state: { proposals } } = useLocation();

    return (
        <>
            <Helmet>
                <title>Proposal</title>
            </Helmet>
            <Container fluid>
                <ProposalSingle proposals={proposals} />
            </Container>
        </>

    )
}
