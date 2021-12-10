import React from 'react';
import { Col, Card, ListGroup, ListGroupItem, Button} from 'react-bootstrap';

// for downloading
import axios from 'axios';
import fileDownload from 'js-file-download';


export default function VectorCard({name, description, externalLink, category, handle, type}) {
    const handleDownload = (link, fileName) =>{
        axios.get(link, {
            responseType: 'blob',
        }).then(({data}) => fileDownload(data, fileName))
    }
    return (
        <Col lg="4" style={{padding: '2rem'}}>
            <Card >
                {/* image hash get storage link from web3.storage */}
                <Card.Img variant="top" src={externalLink}/>
                <Card.Body>
                    <Card.Title>{name}</Card.Title>
                    <Card.Text>
                        {description}
                    </Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroupItem>Category: {category}</ListGroupItem>
                    {/* image hash get storage link from web3.storage */}
                    <ListGroupItem>Handle: {handle}</ListGroupItem>
                    <ListGroupItem>Type: {type}</ListGroupItem>
                </ListGroup>
                <Card.Body>
                    <Button className="primary" onClick={()=>handleDownload(externalLink, name)}>Download Image</Button>
                </Card.Body>
            </Card>
        </Col>
    )
}
