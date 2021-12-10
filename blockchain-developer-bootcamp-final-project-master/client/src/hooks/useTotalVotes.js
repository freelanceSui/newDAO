import React, { useState, useEffect } from 'react';
import { useContract } from "./useContract";
import govTokenArtifact from "../contracts/IkonDAOGovernanceToken.json";
import { toUnit } from "../utils/utils"; 

// retireves all information related to a proposal;
export function useTotalVotes(){
    const govToken = useContract(process.env.GOV_TOKEN_CONTRACT, govTokenArtifact.abi);
    const [totalVotes, setTotalVotes] = useState();

    useEffect(()=> {
        govToken.methods.totalSupply().call()
        .then(total => setTotalVotes(toUnit(total)));
    }, []);

    return totalVotes;
}