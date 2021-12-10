import React, { useState } from 'react'; 
import { InputGroup, FormControl } from 'react-bootstrap'; 

export default function ProposalOptionsAccountabilityProposals({action, register}) { // creates a form box for inputs that users can choose
    const getType = action => {
        // will add validation rules later
        switch(action){
            case 'slashVotes':
                return [
                    {type: 'text', placeholder: "Member Address", label: 'Member'},
                    {type: 'number', placeholder: "Number of votes to take away", label: 'Votes'}
                ];
            default: 
                return [{type: 'text', placeholder: "Address to ban", label: "Member"}];
        }
    }


    return (
            action ? 
            <>
                <InputGroup className="mt-2">
                    <InputGroup.Text>Type</InputGroup.Text>
                    <FormControl type={'textarea'} aria-label={'Type'} placeholder="Accountabillity Proposal" value="Accountabillity Proposal" disabled/>
                </InputGroup>

                <InputGroup className="mt-2">
                    <InputGroup.Text>Title</InputGroup.Text>
                    <FormControl type={'textarea'} aria-label={'Title'} placeholder={'set a short title'} {...register('title')} />
                </InputGroup>

                <InputGroup className="mt-2">
                    <InputGroup.Text>Description</InputGroup.Text>
                    <FormControl type={'textarea'} aria-label={'Description'} placeholder={'describe your proposal'} {...register('description')} />
                </InputGroup>
                
                {
                    [...getType(action).map((item, i) => (
                        <InputGroup key={i} className="mt-2">
                            <InputGroup.Text>
                                {item.label}
                            </InputGroup.Text>
                                <FormControl 
                                    type={item.type} 
                                    aria-label={item.label} 
                                    placeholder={item.placeholder} 
                                    {...register(`${String(action)+"."+String(item.label)}`)} 
                                />
                        </InputGroup>
                    ))]
                }
                
            </>
            :
            null
    )
}
