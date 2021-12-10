import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'react-bootstrap';

// for retrieving proposal information
import { useAppContext } from '../../AppContext';
import { useProposalInformation } from '../../hooks/useProposalInformation';

// for displaying proposal information
import { shortenAddress } from '../../utils/shortenAddress';

export default function VoteInfoCard({proposals}) {
    const { proposalId }= useParams();
    const {start, deadline} = useProposalInformation(proposalId); 
    return (
        
            <Card className="text-center" style={{padding: '2rem 0rem'}}>
                <Card.Title>Information</Card.Title>
                <Card.Body style={{textAlign: 'left'}}>
                    <Card.Text><b>Proposer: </b>{shortenAddress(proposals.get(proposalId).proposor)}</Card.Text>
                    <Card.Text><b>Start: </b><span style={{fontSize: '0.8rem'}}>{true && String(start)}</span></Card.Text>
                    <Card.Text><b>End: </b><span style={{fontSize: '0.8rem'}}>{true && String(deadline)}</span></Card.Text>
                </Card.Body>
            </Card>
    )
}
