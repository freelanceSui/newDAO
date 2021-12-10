import React, { useState } from 'react';
import MemberCard from '../member/MemberCard'; 
import ProposalItem from './ProposalItem';
import { Col, Container } from 'react-bootstrap';

// for loading the proposal intially
import { useProposals } from '../../hooks/useProposals';
import { useAppContext } from '../../AppContext';

export default function ProposalList() {
    const [loaded, setLoaded] = useState(); 
    
    const proposals = useProposals(loaded, setLoaded);
    const { injectedProvider } = useAppContext();
    
    return (
        <Container className="d-flex flex-row" style={{marginTop: "10rem"}}>
            {
                injectedProvider 
                ? <Col lg="3">
                        <Container as="div" fluid>
                            <MemberCard />
                        </Container>
                    </Col>
                : null
            }
            <Col lg={injectedProvider ? "9" : "12"}>
                <Container as="div" fluid>
                    {
                        proposals && loaded
                        ? [...proposals.entries()].map(([id, proposal]) => (
                            <ProposalItem 
                            key={id} 
                            id={id} 
                            type={proposal.type} 
                            title={proposal.title} 
                            description={proposal.description}
                            value={proposal.value}
                            proposor={proposal.proposor}
                            proposals={proposals}
                            setLoaded={setLoaded}

                        />))
                        : <h1>...fetching proposals from ipfs</h1> 
                    }
                </Container>
            </Col>
        </Container>
    )
}
