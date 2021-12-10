// wallet connector providers
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Authereum from "authereum";
import WalletLink from "walletlink";
import WalletConnectProvider from "@walletconnect/web3-provider";

import Web3Modal from 'web3modal';

// keys @ethersproject/contracts
const INFURA_ID = process.env.INFURA_RINKEBY_ID;
const PORTIS_ID = process.env.PORTIS_ID;
const FORTMATIC_KEY = process.env.FORTMATIC_KEY; 


// Coinbase walletLink init
const walletLink = new WalletLink({
    appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://rinkeby.infura.io/v3/${INFURA_ID}`, 1);

export const createWeb3Modal = () => new Web3Modal({ 
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
          4: `https://rinkeby.infura.io/v3/${INFURA_ID}`
        },
      },

    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: PORTIS_ID,
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: FORTMATIC_KEY, // required
      },
    },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, _options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  }
})

