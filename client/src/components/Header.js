import React, {useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; 
import { Container, Navbar, Nav, Button} from 'react-bootstrap';
import logo from '../../public/static/logos/logo-1.png';

// for wallet connect workflow
// import { useWallet } from '@gimmixorg/use-wallet';
import Web3 from 'web3';
import { createWeb3Modal } from './wallet/createWeb3Modal';
import { useAppContext } from '../AppContext';

const web3Modal = createWeb3Modal();


export default function Header() {
    const { injectedProvider, setInjectedProvider } = useAppContext(); 
    const [connected, setConnected] = useState();
    // const [switchNetwork, setSwitchNetwork] = useState(); 
    
    const login = useCallback(async () => {
        var injected;
        try {
            
            let provider = await web3Modal.connect();
            injected = new Web3(provider).currentProvider;
            if(injected && Number(injected.chainId) !== 4) await handleWrongChain(injected); // if wrong chain then switch chains

            injected.on('connect', info => {
                console.log(info);
            });

            injected.on('accountsChanged', account => {
                console.log(account);
            });

            injected.on('chainChanged', chainId => {
                console.log(`switched chains ${chainId}`);
                if(window.ethereum.chainId !== 4) handleWrongChain(window.ethereum, logout);
                setInjectedProvider(new Web3(window.ethereum).currentProvider);
            });
            setInjectedProvider(injected);
            setConnected(true);

            
        } catch (e){ 
            console.log(e);
        }

    }, [injectedProvider]);
    
    useEffect(()=>{
        if (web3Modal.cachedProvider) {
            login();
        }
        if(injectedProvider && Number(injectedProvider.chainId) !== 4)handleWrongChain(injectedProvider, logout);
    }, [injectedProvider, login])


    const logout = async () => {
        await web3Modal.clearCachedProvider();
        if (injectedProvider && typeof injectedProvider.disconnect == "function") {
          await injectedProvider.disconnect();
        }
        setConnected(false);
        setInjectedProvider(undefined);
        setTimeout(() => {
            window.location.reload();
        }, 1);
    }
    
    return (
        <Navbar expand='lg' fixed="top" bg="teal" variant="light">
            <Container id="ikondaoNav">
                <Navbar.Brand style={{fontSize: "2.5rem"}}>
                    <img 
                    style={{verticalAlign: 'bottom'}}
                    src={logo}
                    width={'60rem'}
                    />{" "}
                    <Link to="/">IkonDAO</Link>
                </Navbar.Brand>
                <Navbar.Toggle style={{width: "5rem", height: "3.5rem"}} aria-controls="ikondao-responsive-nabar" />
                <Navbar.Collapse  id="ikondao-responsive-nabar" className="justify-content-end">
                    <Nav as="ul">
                        <Nav.Link as="li">
                            <Link  to="/proposals">Proposals</Link>
                        </Nav.Link>
                        <Nav.Link as="li">
                            <Link to="/nfts">Nfts</Link>
                        </Nav.Link>
                        <Nav.Link as="li">
                            <Link to="/vectors">Vectors</Link>
                        </Nav.Link>
                        <Nav.Link as="li">
                            {
                            !connected 
                            ? <Button onClick={login}size="lg" className="callout-button">connect</Button> 
                            : <Button onClick={logout}size="lg" className="callout-button">Disconnect</Button>
                            }
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>        
        </Navbar>
    )
}

function handleWrongChain (provider, logout){
    console.log(new Error("wrong chainId switch to rinkeby network"));
    provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4' }],
    }).then(r => console.log("switched chains sucessfully"))
    .catch(e => {
        // setConnected(false);
        console.log(e);
        logout();
    });
} 