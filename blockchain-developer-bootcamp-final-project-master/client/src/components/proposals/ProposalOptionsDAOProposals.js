import React, { useState } from 'react'; 
import { InputGroup, FormControl } from 'react-bootstrap'; 
const slug = require('unique-slug');

export default function ProposalOptionsDAOProposals({action, register}) { // creates a form box for inputs that users can choose
    const getType = action => {
        switch(action){ 
            case 'safeMintVector':
                return [
                    {type: 'text', placeholder: "The title of the image", label: 'ImageTitle'},
                    {type: 'text', placeholder: "Description of the image", label: 'ImageDescription'},
                    {type: 'text', placeholder: "Category of the image", label: 'ImageCategory'},
                    {type: 'text', placeholder: "Artist Handle", label: 'Handle'},
                    {type: 'text', placeholder: "Address to whom to send Vote and token rewards", label: 'RewardsAddress'}
                ]
            default: 
                return [
                    {
                        type: 'text', 
                        placeholder: action.replace(/(set)|(update)/, "").toUpperCase()[0] + action.replace(/((T|t)okens)|((V|v)otes)/, "").toLowerCase().slice(1) + "sAddress" 
                        , 
                        label: action.replace(/(set)|(update)/, "").toUpperCase()[0] + action.replace(/((T|t)okens)|((V|v)otes)/, "").toLowerCase().slice(1) + "sAddress" 
                    }
                ];
        }
    }


    return (
            action ? 
            <>
                <InputGroup className="mt-2">
                    <InputGroup.Text>Type</InputGroup.Text>
                    <FormControl type={'textarea'} aria-label={'Type'} placeholder="DAO Proposal" value="DAO Proposal" disabled/>
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
                    getType(action).map((item, i) => (
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
                    </InputGroup>))
                }
                {
                    action === 'safeMintVector' 
                    && <InputGroup key={slug()} className="mt-2">
                        <FormControl 
                        type="file" 
                        ref={React.createRef()} 
                        {...register(`${String(action)+"."+"uploadedFiles"}`)} />
                    </InputGroup>
                }

            </>
            :
            null
    )
}
