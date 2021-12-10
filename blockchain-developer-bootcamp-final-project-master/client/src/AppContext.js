import React, { createContext, useReducer } from 'react';
import { updateIpfsData, repetitivelyGetIpfsData } from './web3-storage/ipfsStorage';

const initialContext = {
  proposals: undefined,
  setProposals: async () => {},
  updateProposals: async () => {},
  graphics: undefined,
  setGraphics: async () => {},
  updateGraphics: async () => {},
  injectedProvider: undefined, 
  setInjectedProvider: () => {} 
  // nfts: undefined,
  // updateNfts: async () => {},
  // vectors: undefined,
  // updateVectors: async () => {},
};


const appReducer = (state, { type, payload }) => {
  switch (type) {
    case "UPDATE_PROPOSALS": 
      return {
        ...state,
        proposals: new Map([...state.proposals]).set(payload.id, payload)
      }
    case "UPDATE_GRAPHICS":
      return {
        ...state,
        graphics: new Map([...state.graphics]).set(payload.image, payload)
      }
    case "SET_PROPOSALS": 
      return {
        ...state,
        proposals: new Map([...payload])
      }
    case "SET_GRAPHICS": 
      return {
        ...state,
        graphics: new Map([...payload])
      }
    case "SET_INJECTED_PROVIDER": 
      return {
        ...state,
        injectedProvider: payload
      }
    default:
      return state;
  }
};

const AppContext = createContext(initialContext);
export const useAppContext = () => React.useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  
  // initialize  
  // getIpfsData('proposals').then(data => initialContext.proposals = data);
  // getIpfsData('graphics').then(data => initialContext.graphics = data);

  const [store, dispatch] = useReducer(appReducer, initialContext);
  
  const contextValue = {
    proposals: store.proposals,
    setProposals: async () => {
      let data = await repetitivelyGetIpfsData('proposals');
      dispatch({type: 'SET_PROPOSALS', payload: data});
    },
    updateProposals: async newProposal => {
      await updateIpfsData('proposals', newProposal); // updates proposal on ipfs
      dispatch({type: 'UPDATE_PROPOSALS', payload: newProposal }); // update appcontext
    },
    graphics: store.graphics,
    setGraphics: async () => {
      let data = await repetitivelyGetIpfsData('graphics');
      dispatch({type: 'SET_GRAPHICS', payload: data});
    },
    updateGraphics: async newGraphic => {
      await updateIpfsData('graphics', newGraphic); // updates graphic on ipfs
      dispatch({type: 'UPDATE_GRAPHICS', payload: newGraphic }); // update appcontext
    },
    injectedProvider: store.injectedProvider,
    setInjectedProvider: provider => {
      dispatch({type: 'SET_INJECTED_PROVIDER', payload: provider })
    }

  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};


