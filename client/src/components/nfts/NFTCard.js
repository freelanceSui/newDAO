import React from 'react';
import { Col, Card, ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import { useGetTokenId } from '../../hooks/useGetTokenId'; 

export default function NFTCard({hash, name, description, externalLink, category, handle, type}) {
    // hash is used to create web3.storage link
    const tokenId = useGetTokenId(hash);
    
    return (
            <Col lg="4" style={{padding: '2rem'}}>
                <Card >
                    {/* image hash get storage link from web3.storage */}
                    <Card.Img variant="top" src={externalLink} />
                    <Card.Header>token-id: {tokenId}</Card.Header>
                    <Card.Body>
                        <Card.Title>{name}</Card.Title>
                        <Card.Text>
                            {description}
                        </Card.Text>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroupItem>Category: {category}</ListGroupItem>
                        {/* image hash get storage link from web3.storage */}
                        <ListGroupItem><a href={externalLink}>External Url</a></ListGroupItem>
                        <ListGroupItem>Handle: {handle}</ListGroupItem>
                        <ListGroupItem>Type: {type}</ListGroupItem>
                    </ListGroup>
                    <Card.Body>
                        <Card.Link> <Button onClick={()=>alert("functionality coming soon")} varient="success">Buy</Button> </Card.Link>
                    </Card.Body>
                </Card>
            </Col>

    )
}
