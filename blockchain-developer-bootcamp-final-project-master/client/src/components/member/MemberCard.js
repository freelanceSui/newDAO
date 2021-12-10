import React, {useState, useEffect} from 'react';
import { NavLink } from 'react-router-dom'; 
import { Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { shortenAddress } from '../../utils/shortenAddress';
// import Blockie from './Blockie';

// for using contract information
import { useContract } from '../../hooks/useContract';
import tokenArtifact from '../../contracts/IkonDAOToken.json';
import govTokenArtifact from '../../contracts/IkonDAOToken.json';
import proxyArtifact from '../../contracts/IkonDAO.json';

// utilities for conversion
import { toUnit } from '../../utils/utils';

// constants
import { MEMBER_ROLE } from '../../contstants';


export default function MemberCard() {
    const [address, setAddress] = useState();
    const [tokenBalance, setTokenBalance] = useState();
    const [votingPower, setVotingPower] = useState();
    const [isMember, setIsMember] = useState();

    const token = useContract(process.env.UTILITY_TOKEN_CONTRACT, tokenArtifact.abi);
    const votes = useContract(process.env.GOV_TOKEN_CONTRACT, govTokenArtifact.abi);
    const proxy = useContract(process.env.PROXY_CONTRACT, proxyArtifact.abi);

    const handleTokenBalance = async () => setTokenBalance(await token.methods.balanceOf(window.ethereum.selectedAddress).call()); 
    const handleVotingPower = async () => setVotingPower(await votes.methods.balanceOf(window.ethereum.selectedAddress).call());

    useEffect(()=>{
        if(window.ethereum.selectedAddress){
    
            // on window load 
            proxy.methods.hasRole(MEMBER_ROLE, window.ethereum.selectedAddress).call().then(res => setIsMember(res)); 
            setAddress(window.ethereum.selectedAddress); 
            (async ()=> await handleTokenBalance())();
            (async ()=> await handleVotingPower())();
    
            // update on accounts changed
            window.ethereum.on("accountsChanged", () => {
                proxy.methods.hasRole(MEMBER_ROLE, window.ethereum.selectedAddress).call().then(res => setIsMember(res)); 
                setAddress(window.ethereum.selectedAddress);
                (async ()=> await handleTokenBalance())();
                (async ()=> await handleVotingPower())();
            });
        }
    }, []);

    return (
        <>
        {
            address ?
            <Card className="align-items-center" style={{position: 'fixed', top: '12rem', padding: "2rem 1rem"}}>
                {/* <div style={{borderRadius: "100%", height: "7.5rem", width: "7.5rem", backgroundImage: `url(https://via.placeholder.com/150)`}}>
                </div> */}
                {/* <Blockie seed={address} size={10} scale={3} /> */}
                <Card.Body style={{padding: "1rem, 0rem"}}>
                    <Card.Title>{shortenAddress(address)}</Card.Title>
                </Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroupItem style={{padding: "1rem, 0rem"}}>IKD: {toUnit(tokenBalance)}</ListGroupItem>
                    <ListGroupItem style={{padding: "1rem, 0rem"}}>IKDG: {toUnit(votingPower)}</ListGroupItem>
                </ListGroup>
                {
                    isMember 
                    ? <NavLink className="btn callout-button" to={"/proposals/create"}>Create a proposal</NavLink> 
                    : <NavLink className="btn callout-button" to={"/"}>Register Here</NavLink> 
                }
            </Card> : null

        }
        </>
    )
}
