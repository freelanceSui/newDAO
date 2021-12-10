import {useState, useEffect} from 'react';
import { useAppContext } from '../AppContext';

export function useProposals(loaded, setLoaded) {
    const { setProposals, proposals } = useAppContext();
    
    useEffect(()=> {
        if (!proposals){
            setProposals();
            setLoaded(true);
        }
        if(proposals){
            setLoaded(true);
        }
    }, [proposals, setLoaded]);
    return proposals; 
}
