import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useProposalInformation } from '../../hooks/useProposalInformation';
import { proposalStates } from '../../helpers/proposalStates';
import { options } from '../../helpers/proposalOptions';
import daoArtifact from '../../contracts/IkonDAO.json'; 
import { useContract } from '../../hooks/useContract'; 
import { callContract } from '../../helpers/transactor';
import { toBN } from '../../utils/utils';

export default function CastVote() {

    const { proposalId } = useParams();
    const { state } = useProposalInformation(proposalId); 

    // for casting votes
    const proxy = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);
    const {register, handleSubmit, formState: {erros, isSubmitting, isSubmitted} } = useForm();
    const [isSuccessfull, setIsSuccessfull] = useState();

    const onSubmit = async (data) => { 
        const support = Number(data['option']);
        const callCastVote = proxy.methods.castVote(toBN(proposalId), support).encodeABI(); 
        
        // // cast votes workflow
        alert(`casting vote with support: ${options[data['option']]}`);
        
        try {
            let {transactionHash} = await callContract(process.env.PROXY_CONTRACT, callCastVote);
            alert(`Vote casted sucessfully. Transaction hash ${transactionHash}`);
            setIsSuccessfull(true);
            window.location.reload();

        } catch(e){
            alert(`code: ${e.code}: ${e.message}`); 
        }
    } 

    return (
        state ? // only renders if proposal is active
        <Form id="castVote" onSubmit={handleSubmit(onSubmit)}>
            
            {  
                proposalStates[state].text === 'Active' ? 
                <>
                    <Form.Group>
                        <h2>Cast your vote here</h2>
                    </Form.Group>

                    <Form.Group>
                        <Form.Select {...register("option")} aria-label="Select Support">
                            <option value="0">Against</option>
                            <option value="1">For</option>
                            <option value="2">Abstain</option>
                        </Form.Select>
                    </Form.Group>

                    {!isSubmitted && !isSubmitting && <Button className="callout-button" type="submit">Vote</Button> }
                    { 
                        isSubmitting && !isSuccessfull
                        ? <Button className="callout-button" disabled> 
                            <Spinner as="span" animation="grow" size="lg" role="status" aria-hidden="true"/>{' '} Loading... 
                        </Button> 
                        : isSubmitted ? <Button className="callout-button" type="submit" disabled>Success</Button> : null 
                    } 
                </> : 
                <h1>Cannot cast votes on { proposalStates[state].text.toLowerCase() } proposal </h1>
            }
        </Form> :
        <h1>...Loading</h1>
        )
}
