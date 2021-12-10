import React, {useState, useEffect} from 'react'
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Spinner } from 'react-bootstrap';

// for creating proposals
import ProposalOptionsSystemProposals from './ProposalOptionsSystemProposals';
import { createProposalAction, } from '../../helpers/createProposal';
import { useContract } from '../../hooks/useContract';
import governorArtifact from '../../contracts/IkonDAOGovernor.json';
import daoArtifact from '../../contracts/IkonDAO.json';
import { toSha3 } from '../../utils/utils';
import { callContract } from '../../helpers/transactor';

// for storage
const slug = require('unique-slug');
import { useAppContext } from '../../AppContext';
import { initializeData, listUploads } from '../../web3-storage/ipfsStorage';

export default function SystemProposalForm() {
    const { updateProposals, setProposals, proposals, injectedProvider } = useAppContext(); 
    const navigate = useNavigate(); 
    const [isSuccessfull, setIsSuccessfull] = useState();

    const { 
        control,
        register, 
        handleSubmit, 
        watch,
        formState: { errors, isSubmitting, isSubmitted },
    } = useForm({
        defaultValues: {
            type: 'System Proposal'
        }
    });

    const watchAction = watch('action', "setVotingPeriod"); 
    // create governorInst for hashing proposal and proxy inst for calling propose
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi);
    const proxy  = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);

    const onSubmit = async (data) => {
        // create a proposalAction
        const input = data[watchAction][watchAction.replace(/(set)|(update)/, "").toUpperCase()[0] + watchAction.replace(/(set)|(update)/, "").toLowerCase().slice(1)]
        const {targets, description, calldatas, values} = createProposalAction(watchAction, input, slug() + data.description);
        
        // get proposal id from action values
        const proposalId = await governor.methods.hashProposal(targets, values, calldatas, toSha3(description)).call();
        
        // for storage of proposal 
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
        let {transactionHash} = await callContract(process.env.PROXY_CONTRACT, proposeCallData); 
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
    
    useEffect(async ()=>{
        // make sure proposals are loaded before page is loaded
        if(!proposals){
            await setProposals();
        }
    }, []);


    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <h2>System Proposals</h2>
            </Form.Group>

            <Form.Group>
                <Form.Text><h4>Select Proposal</h4></Form.Text>
                <Form.Select {...register("action")} aria-label="Select Proposal">
                    <option value="setVotingPeriod">Change DAO Voting Period</option> 
                    <option value="setVotingDelay">Change DAO Voting Delay</option>
                    <option value="setBaseReward">Change Token Rewards</option>
                    <option value="setRewardVotes">Change Reward For Votes</option>
                    <option value="updateDelay">Change Delay For The Timelocker</option>
                    <option value="updateTimelock">Change Timelocker Address</option>
                    <option value="upgradeTo">Upgrade DAO To New Implementation</option>
                </Form.Select>
            </Form.Group>
            
            {/* display inputs based on proposal value */}
            <Form.Group className="mb-2"> 
                <ProposalOptionsSystemProposals action={watchAction} register={register}/>
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
