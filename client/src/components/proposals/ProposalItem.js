import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom'; 
import { Card, Badge, Container, Button, Spinner, Form } from 'react-bootstrap';
import { shortenAddress } from '../../utils/shortenAddress'; 
import { useProposalInformation } from '../../hooks/useProposalInformation';
import { proposalStates } from '../../helpers/proposalStates';
import { useForm } from 'react-hook-form';

// for handling queueing and execution of proposal
import daoArtifact from '../../contracts/IkonDAO.json';
import { useContract } from '../../hooks/useContract';
import { callContract } from '../../helpers/transactor';

export default function ProposalItem({id, type, title, description, value, proposor, proposals, setLoaded }) {
    
    const states = proposalStates;
    const { state } = useProposalInformation(id);
    const proxy = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);
    const [queueClicked, setQueueClicked] = useState();
    const [executeClicked, setExecuteClicked] = useState();
    const [isSuccessfull, setIsSuccessfull] = useState();
    const [queueRejected, setQueueRejected] = useState();
    const [executeRejected, setExecuteRejected] = useState();
    const { handleSubmit, formState: { isSubmitting, isSubmitted }} = useForm();
    
    const handleQueue = async () => {
        // handleExecuted
        setQueueClicked(true);
        const {targets, calldatas, values, descriptionHash } = proposals.get(id).call;
        const queCallData = proxy.methods.queue(targets, values, calldatas, descriptionHash).encodeABI();
        alert(`queueing proposal with id ${shortenAddress(id)}`);
        try {
            let { transactionHash } = await callContract(process.env.PROXY_CONTRACT, queCallData);
            alert(`proposal queued with transaction hash ${transactionHash}`);   
            setLoaded(false);
            setIsSuccessfull(true);
        } catch(e){
            alert(`code: ${e.code}, message: ${e.message}`);
            setQueueRejected(true);
        }
        window.location.reload();
    }
    
    const handleExecute = async () => {
        // handleExecute 
        setExecuteClicked(true);
        const {targets, calldatas, values, descriptionHash } = proposals.get(id).call;
        const executeCallData = proxy.methods.execute(targets, values, calldatas, descriptionHash).encodeABI();
        alert(`executing proposal with id ${shortenAddress(id)}`);
        try { 
            let {transactionHash} = await callContract(process.env.PROXY_CONTRACT, executeCallData);
            alert(`proposal executed with transaction hash ${transactionHash}`);   
            setLoaded(false);
            setIsSuccessfull(true);
        } catch (e){
            alert(`code: ${e.code}, message: ${e.message}`);
            setExecuteRejected(true);
        }
        window.location.reload();
    }

    return (

        <Container className="proposalItem" style={{padding: "2rem 0rem"}}  as="div" fluid>
            {
                state ? 
                <Card >
                <Card.Header as='div'  className="d-flex">
                        <div className="d-flex flex-column justify-content-start">
                            <Badge className="mt-2" bg={state ? states[state].color : null} style={{width: "85%"}} >{state ? states[state].text : "..loading"}</Badge>
                            <Badge className="mt-2" >{type}</Badge>
                            <Badge className="mt-2" >{shortenAddress(id)}</Badge>
                            <Badge className="mt-2" >{proposor}</Badge>
                        </div>
                        <div style={{width: "100%", height: "40%"}} className="d-flex justify-content-end" >
                            { state && proposalStates[state].text === 'Succeeded' || state && proposalStates[state].text === 'Queued'
                            ?  
                                <div className="d-flex">
                                        <Form onSubmit={handleSubmit(handleQueue)}> 
                                            {
                                                !queueClicked && !isSubmitted && !isSubmitted &&
                                                    <Button 
                                                        className="me-3" 
                                                        variant="info" 
                                                        disabled={state && proposalStates[state].text === 'Succeeded' ? false : true }
                                                        type='submit'
                                                        >Queue Proposal
                                                    </Button> 
                                            }
                                            { 
                                                queueClicked && isSubmitting && !isSuccessfull
                                                ? <Button 
                                                    className="me-3" 
                                                    variant="info" 
                                                    disabled
                                                    > 
                                                        <Spinner as="span" animation="border" role="status" aria-hidden="true"/>{' '} Loading... 
                                                    </Button> 
                                                : queueClicked && isSubmitted 
                                                    ? !queueRejected ? <Button 
                                                        className="me-3" 
                                                        variant="info" 
                                                        disabled> Success </Button>
                                                        : <Button 
                                                        className="me-3"
                                                        variant="danger" 
                                                        disabled>Error</Button>
                                                    : null 
                                            } 
                                        </Form>

                                        <Form onSubmit={handleSubmit(handleExecute)}> 
                                        {
                                            !executeClicked && !isSubmitted && !isSubmitted &&  
                                            <Button 
                                                variant="success" 
                                                disabled={state && proposalStates[state].text === 'Queued' ? false : true}
                                                type='submit'
                                                >Execute Proposal 
                                            </Button>
                                        }
                                        { 
                                                executeClicked && isSubmitting && !isSuccessfull
                                                ? <Button 
                                                    className="me-3" 
                                                    variant="success" 
                                                    disabled
                                                    > 
                                                        <Spinner as="span" animation="border" role="status" aria-hidden="true"/>{' '} Loading... 
                                                    </Button> 
                                                : executeClicked && isSubmitted 
                                                    ? !executeRejected ? <Button 
                                                        className="me-3" 
                                                        variant="success" 
                                                        disabled
                                                        > Success </Button>
                                                        : <Button className="me-3" variant="danger" disabled>Error</Button>
                                                    : null 
                                            } 
                                        </Form>      
                                </div> 
                            :
                            
                            null
                            
                            }
                        </div>
                      
                </Card.Header>
                <Card.Body className="mt-2">
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                        { description }
                </Card.Text>
                <div>
                <h6>Proposed Change: </h6>
                {
                    value ? value.map((v, i) => (
                        <span style={{display: "block", fontSize: '0.8rem'}} key={i}>
                            <b>{v[0]}:</b> {v[1]}
                        </span>
                    ))
                    : null 
                }
                </div>
                    <Link to={`/proposals/${id}`} state={{proposals: proposals}}>Info</Link>
                </Card.Body>
            </Card>
            : <h2>...gathering data</h2>
        }
        
        </Container>
    )
}
