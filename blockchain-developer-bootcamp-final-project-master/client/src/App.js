// modules
import React, { useEffect } from 'react'; 
import { Routes, Route, BrowserRouter as Router} from 'react-router-dom';

// pages 
import Header from'./components/Header';
import Home from './pages/home/index';
import ProposalsIndex from './pages/proposals/index';
import ProposalSingleIndex from './pages/proposals/ProposalSingleIndex';
import ProposalCreateIndex from './pages/proposals/ProposalCreateIndex';
import NFTSIndex from './pages/nfts/index';
import VectorsIndex from './pages/vectors/index';

import { useAppContext } from './AppContext';// provider options

// for wallet connect workflow

export default function App() {

    const { setProposals, setGraphics, proposals, graphics } = useAppContext();
    useEffect(()=>{
        if(!proposals){
            setProposals(location); // loads proposals from ipfs and sets them
        }
        if(!graphics){
            setGraphics(); // loads graphics from ipfs and sets them
        }
    }, []);

    return (
        <Router>
            <Header /> 
            <Routes>
                <Route path='/' element={<Home />}></Route>
                <Route path='/proposals'  >
                    <Route index element={<ProposalsIndex />}/>
                    <Route path=":proposalId" element={<ProposalSingleIndex />}/>
                    <Route path="create" element={<ProposalCreateIndex />}/>
                </Route>
                {/* <Route path="/proposals/create" element={<ProposalCreateIndex />}/> */}
                <Route path='/nfts' element={<NFTSIndex />}></Route>
                <Route path='/vectors' element={<VectorsIndex />}></Route>
                <Route path="/*" element={<h1 style={{marginTop: '10rem'}}>Oops! page does not exist</h1>} />
            </Routes>
        </Router>
    )
}
