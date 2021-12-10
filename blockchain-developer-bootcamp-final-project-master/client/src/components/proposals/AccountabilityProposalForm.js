import React, {useState, useEffect} from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Form, Button, Spinner } from 'react-bootstrap';
 
// for creating proposals
import ProposalOptionsAccountabilityProposals from './ProposalOptionsAccountabilityProposals';
import { createProposalAction, } from '../../helpers/createProposal';
import { useContract } from '../../hooks/useContract';
import governorArtifact from '../../contracts/IkonDAOGovernor.json';
import daoArtifact from '../../contracts/IkonDAO.json';
import { toSha3 } from '../../utils/utils';
import { callContract } from '../../helpers/transactor';

// for storage
const slug = require('unique-slug');
import { initializeData, listUploads } from '../../web3-storage/ipfsStorage';
import { useAppContext } from '../../AppContext';

export default function AccountabilityProposalForm() {
    const { updateProposals, setProposals, proposals, injectedProvider } = useAppContext(); 
    const navigate = useNavigate(); 
    const [isSuccessfull, setIsSuccessfull] = useState();

    const { 
        register, 
        handleSubmit, 
        watch,  
        formState: { errors, isSubmitting, isSubmitted },
    } = useForm({
        defaultValues: {
            type: 'Accountability Proposal'
        }
    });
    // start selected option with at slashVotes
    const watchAction = watch('action', "slashVotes"); 

    // create governorInst for hashing proposal and proxy inst for calling propose
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi);
    const proxy  = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);

    const onSubmit = async (data) => {
        let proposalData;
        if (watchAction === 'slashVotes'){
            const inputs = {
                target: data[watchAction].Member,
                value: data[watchAction].Votes
            };
            proposalData = createProposalAction(watchAction, inputs, slug() + data.description);
        } else {
            proposalData = createProposalAction(watchAction, data[watchAction].Member, slug() + data.description)
        }
        const {targets, description, calldatas, values} = proposalData; 
        
        // get proposal id from action values
        const proposalId = await governor.methods.hashProposal(targets, values, calldatas, toSha3(description)).call();

        // // for storage of proposal 
        const storageObject = {
            id: proposalId, 
            type: data.type,
            title: data.title, 
            description: data.description, 
            value: Object.entries(data[watchAction]), 
            proposor: injectedProvider.selectedAddress,
            call: {
                targets: targets, 
                calldatas: calldatas, 
                values: values, 
                descriptionHash: toSha3(description)
            }
        }

        // propose workflow 
        let proposeCallData = proxy.methods.propose(targets, values, calldatas, description).encodeABI();
        let { transactionHash } = await callContract(process.env.PROXY_CONTRACT, proposeCallData);
        let proposals = await listUploads('proposals');

        if (proposals.length > 0){
            try {
                alert("updating proposal information on ipfs");
                await updateProposals(storageObject);
                setIsSuccessfull(true);
                alert(`proposal created sucessfully transaction hash: ${transactionHash}`);
                return setTimeout(() => {
                    navigate("/proposals");
                }, 500);
            } catch(e){
                console.log(e) // notification goes here
            }   
        }

        try { // initializes the data on web3storage if data wasn't initialized yet
            alert("initializing ipfs storage for proposals");    
            await initializeData('proposals', [storageObject]);
            setIsSuccessfull(true);
            alert(`proposal created sucessfully transaction hash: ${transactionHash}`);
            return setTimeout(() => {
                navigate("/proposals");
            }, 500);
        } catch (e){
            console.log(e); // notification goes here
        }
    }

    useEffect(async () => {
        // make sure proposals are loaded before page is loaded
        if(!proposals){
            await setProposals();
        }
    }, []);

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <h2>Accountability Proposals</h2>
            </Form.Group>

            <Form.Group>
                <Form.Text><h4>Select Proposal</h4></Form.Text>
                <Form.Select {...register("action")} aria-label="Select Proposal">
                    <option value="slashVotes">Slash a user's votes</option> 
                    <option value="banMember">Ban a member</option>
                </Form.Select>
            </Form.Group>
            
            {/* display inputs based on proposal value */}
            <Form.Group className="mb-2"> 
                <ProposalOptionsAccountabilityProposals action={watchAction} register={register}/>
            </Form.Group> 
            
            {!isSubmitted && !isSubmitting && <Button className="callout-button" type="submit">Propose</Button> }
            { 
                isSubmitting && !isSuccessfull
                ? <Button className="callout-button" disabled> 
                    <Spinner as="span" animation="grow" size="lg" role="status" aria-hidden="true"/>{' '} Loading... 
                </Button> 
                : isSubmitted ? <Button className="callout-button" type="submit" disabled>Success</Button> : null 
            } 

        </Form>    
    )
}
