import React, {useState, useEffect} from 'react'
import { useForm } from 'react-hook-form';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
 
// for creating proposals
import ProposalOptionsDAOProposals from './ProposalOptionsDAOProposals';
import { createProposalAction, } from '../../helpers/createProposal';
import { useContract } from '../../hooks/useContract';
import governorArtifact from '../../contracts/IkonDAOGovernor.json';
import daoArtifact from '../../contracts/IkonDAO.json';
import { toSha3 } from '../../utils/utils';
import { callContract } from '../../helpers/transactor';

// for storage
const slug = require('unique-slug');
import { useAppContext } from '../../AppContext';
import { storeFiles, initializeData, listUploads } from '../../web3-storage/ipfsStorage';

export default function DAOProposalForm() {
    const { setProposals, proposals, updateProposals, updateGraphics, graphics, setGraphics, injectedProvider } = useAppContext(); 
    const navigate = useNavigate(); 
    const [isSuccessfull, setIsSuccessfull] = useState();

    const { 
        register, 
        handleSubmit, 
        watch,
        formState: { errors, isSubmitting, isSubmitted },
    } = useForm({
        defaultValues: {
            type: 'DAO Proposal'
        }
    });
    const watchAction = watch('action', "safeMintVector"); 

    // create governorInst for hashing proposal and proxy inst for calling propose
    const governor = useContract(process.env.GOVERNOR_CONTRACT, governorArtifact.abi);
    const proxy  = useContract(process.env.PROXY_CONTRACT, daoArtifact.abi);

    const onSubmit = async (data) => {
        // create a proposalAction

        let proposalData;
        let vectorData;
        if (watchAction === 'safeMintVector'){

            // creates object to store vector data  
            vectorData = {};
            proposalData = {};
            let file = data[watchAction].uploadedFiles[0];
            vectorData.status = 1;
            vectorData.type = 'freebie'; 
            vectorData.description = data[watchAction].ImageDescription 
            vectorData.image = await storeFiles([file], `${slug()}-file-${file.name}`);
            vectorData.external_url = `https://${vectorData.image}.ipfs.dweb.link`;
            vectorData.name = data[watchAction].ImageTitle
            vectorData.category = data[watchAction].ImageCategory
            vectorData.artistHandle = data[watchAction].Handle; 
        
            // create proposal information for blockchain storage 
            proposalData = createProposalAction(
                watchAction, 
                {
                    nft: {
                        category: toSha3(vectorData.category),
                        imageHash: vectorData.image, // update to accept imageHash as is instead of string type
                    }, 
                    proposer: data[watchAction].RewardsAddress
                }, 
                slug() + data.description
            );
            
            // extracts proposalId for vectorData info
            const {targets, values, calldatas, description} = proposalData;
            const proposalId = await governor.methods.hashProposal(targets, values, calldatas, toSha3(description)).call(); 
            vectorData.proposalId = proposalId;

        } else {
            const input = watchAction.replace(/(set)|(update)/, "").toUpperCase()[0] + watchAction.replace(/((T|t)okens)|((V|v)otes)/, "").toLowerCase().slice(1) + "sAddress"
            proposalData = createProposalAction(watchAction, data[watchAction][input], slug() + data.description)
        }

        // get proposal id from action values
        const {targets, description, calldatas, values} = proposalData; 
        const proposalId = await governor.methods.hashProposal(targets, values, calldatas, toSha3(description)).call();
        
        // for storage of proposal 
        const storageObject = {
            id: proposalId, 
            type: data.type,
            title: data.title, 
            description: data.description, 
            value: watchAction === 'safeMintVector' 
            ? [['RewardsAddress', data[watchAction]['RewardsAddress']], [ 'Image url', vectorData.external_url ], ['CID', vectorData.image ] ]
            : Object.entries(data[watchAction]), 
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
        let images = await listUploads('graphics');
        let proposals = await listUploads('proposals');

        // updates vector information on ipfs if action is a minting a vector
        if (watchAction === 'safeMintVector'){ 

            try { // updates graphics
                if (images.length < 1) {
                    alert("initializing ipfs storage for images");    
                    await initializeData('graphics', [vectorData]);
                } else {
                    alert("updating graphics on ipfs");    
                    await updateGraphics(vectorData);
                }
            } catch(e){
                console.log(e);
            }        
            alert("stored graphics on ipfs");
        }
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
                console.log(e); // notification goes here
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
        } catch(e){
            console.log(e); // notification goes here
        }
    }

    useEffect(async ()=>{
        // make sure graphics and proposals are loaded before page is loaded
        if(!graphics || !proposals){
            await setGraphics();
            await setProposals();
        }
    }, []);

    return (
        graphics || proposals ?  
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <h2>DAO Proposal</h2>
            </Form.Group>

            <Form.Group>
                <Form.Text><h4>Select Proposal</h4></Form.Text>
                <Form.Select {...register("action")} aria-label="Select Proposal">
                    <option value="safeMintVector">Mint a vector</option> 
                    <option value="rewardVotes">Reward votes to someone</option>
                    <option value="rewardTokens">Reward tokens to someone</option>
                </Form.Select>
            </Form.Group>
            
            {/* display inputs based on proposal value */}
            <Form.Group className="mb-2"> 
                <ProposalOptionsDAOProposals action={watchAction} register={register}/>
            </Form.Group> 
            {!isSubmitted && !isSubmitting && <Button className="callout-button" type="submit">Propose</Button> }
            { 
                isSubmitting && !isSuccessfull
                ? <Button className="callout-button" disabled> 
                    <Spinner as="span" animation="grow" size="lg" role="status" aria-hidden="true"/>{' '} Loading... 
                </Button> 
                : isSubmitted ? <Button className="callout-button" type="submit" disabled>Success</Button> : null 
            } 
        </Form> : <h1>...fetching data from ipfs</h1>
    )
}
