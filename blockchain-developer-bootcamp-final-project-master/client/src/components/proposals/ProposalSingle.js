import React from 'react';
import { Container, Col , Row} from 'react-bootstrap';
import ProposalInfo from './ProposalInfo';
import VoteInfoCard from './VoteInfoCard';
import VoteCurrentResults from './VoteCurrentResults';
import CastVote from './CastVote';

export default function ProposalSingle({proposals}) {
    

    return (            
        <Container style={{marginTop: "10rem"}}>
            <Row className="d-flex flex-row">
                <Col lg="9">
                    <Container as="div" fluid>
                        <ProposalInfo proposals={proposals}/>
                    </Container>
                    <Container className="text-center" as="div" fluid>
                        <CastVote />
                    </Container>
                </Col>
                <Col lg="3">
                    <VoteInfoCard proposals={proposals}/>
                    <VoteCurrentResults />
                </Col>
            </Row>
        </Container>
    )
}
