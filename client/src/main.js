import "core-js/stable";
import "regenerator-runtime/runtime";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AppContextProvider } from './AppContext';
import { HelmetProvider } from "react-helmet-async";


// css imports 
import './styles/styles.css';
ReactDOM.render(
    <React.StrictMode>
        <AppContextProvider>
            <HelmetProvider >
                <App />
            </HelmetProvider>
        </AppContextProvider>
    </React.StrictMode>,
document.getElementById('root'));