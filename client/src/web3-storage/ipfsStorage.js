import { Web3Storage } from 'web3.storage';
import { create } from 'ipfs-http-client';

const axios = require('axios');
const url = 'https://dweb.link/api/v0';


function getAccessToken() {
    return process.env.WEB3STORAGE;
}

function makeStorageClient() {
    return new Web3Storage({ token: getAccessToken() })
}

async function checkStatus(cid) {
    const client = makeStorageClient();
    const status = await client.status(cid);
    if (status) {
        console.log(status);
    }
    return status;
}


// @dev lists all uploaded 
// @param folder api token to web3.account
export async function listUploads(folder) {
    const client = makeStorageClient();
    const uploads = [];
    for await (const upload of client.list()) {
        if (upload.name.includes(folder)) {
            uploads.push({ name: upload.name, cid: upload.cid, timestamp: upload.created });
        }
    }
    return uploads;
}

async function getLatestFileLink(folder) {
    let links = await listUploads(folder);
    let latestFile = links[0]
    let latest = new Date(links[0].timestamp);
    for (const link of links) {
        if (new Date(link.timestamp) > latest) {
            latest = new Date(link);
            latestFile = link;
        }
    }
    return latestFile
}

async function getLinks(ipfsPath) {
    const ipfs = create({ url });
    const links = [];
    for await (const link of ipfs.ls(ipfsPath)) {
        console.log(link);
        links.push(link)
    }
    return links;
}


async function retrieve(cid) {
    const client = makeStorageClient();
    const res = await client.get(cid);
    if (!res.ok) {
        throw new Error(`failed to get ${cid}`)
    }
    return res;
}

async function getLatestData(folder) {
    let latestLink = await getLatestFileLink(folder); // retrieves latest link
    let latestFile = await retrieve(latestLink.cid); // retrieves latest file 
    let files = await latestFile.files(); // retrieves latest 
    let res = await axios.get(web3StorageUrl(files[0].cid));
    return res.data;
}

function web3StorageUrl(cid) {
    return 'https://' + cid + ".ipfs.dweb.link";
}

function makeUploadFile(obj) {
    const jsonObj = JSON.stringify(obj);
    const blob = new Blob([jsonObj], { type: "application/json" });
    return blob;
}

async function storeWithProgress(files, name) {
    // show the root cid as soon as it's ready  
    const onRootCidReady = cid => {
        console.log('uploading files with cid:', cid);
    }
    // when each chunk is stored, update the percentage complete and display  
    const totalSize = files.map(f => f.size).reduce((a, b) => a + b, 0);
    let uploaded = 0;
    const onStoredChunk = size => {
        uploaded += size;
        const pct = totalSize / uploaded
        console.log(`Uploading... ${pct.toFixed(2)}% complete`)
    }
    const client = makeStorageClient()
    return client.put(files, { onRootCidReady, onStoredChunk, name: name })
}

export async function storeFiles(files, name) {
    const client = makeStorageClient();
    const cid = await client.put(files, { name: name, wrapWithDirectory: false });
    console.log('stored files with cid: ', cid);
    return cid;
}

async function updateData(folder, payload) {
    // retrieve latest db data
    let oldData = await getLatestData(folder);
    let newData = [...oldData, payload];
    let jsonBlob = makeUploadFile(newData);
    let uploads = await listUploads(folder);
    let err;
    try {
        await storeFiles([jsonBlob], `${folder}-version-${uploads.length}.json`);
    } catch (e) {
        console.log(e);
        err = e;
    }
    if (err) return oldData; // if eror just return the old data
    return newData; // returns list of inputs
}

export async function mergeIpfsData(folder, imageHash, payload) {
    // retrieve latest db data
    let oldData = await getLatestData(folder);
    let newData;
    if(oldData.filter(obj => obj.image !== imageHash).length === 0)newData = [payload]
    else newData = [...oldData.filter(obj => obj.image !== imageHash), payload];
    let jsonBlob = makeUploadFile(newData);
    let uploads = await listUploads(folder);
    let err;
    try {
        await storeFiles([jsonBlob], `${folder}-version-${uploads.length}.json`);
    } catch (e) {
        console.log(e);
        err = e;
    }
    if (err) return oldData; // if eror just return the old data
    return newData; // returns list of inputs
}


// workflow for storing proposals
// initiate first with empty data json object
// create proposal on front end 
// retrieve the most recent dataobj
// append the created proposal to dataobj (new data obj)
// updateData

// proposals 
export async function getIpfsData(folder) {

    let latestData = await getLatestData(folder);

    // list data as mapping
    let map = new Map();
    if (folder === 'proposals') latestData.forEach(obj => map.set(obj.id, obj));
    if (folder === 'graphics') latestData.forEach(obj => map.set(obj.image, obj));
    return folder === 'proposals' || folder === 'graphics' ? map : latestData;
}
export async function updateIpfsData(folder, proposal) {
    // find most recent data from folder
    let latestData = await updateData(folder, proposal);
    return latestData;
}
// export async function updateSingleEntry(folder, key, value){

// }

// initializes database
export async function initializeData(folder, data) {
    let jsonBlob = makeUploadFile(data);
    let cid = await storeFiles([jsonBlob], `${folder}-version-0.json`);
    console.log(`data stored succesfully at ${cid}`)
}

export async function repetitivelyGetIpfsData(folder) {
    let data;
    let Err = true;
    while (Err) {
        try {
            data = await getIpfsData(folder);
            Err = false;
        } catch (e) {
            console.log("...retrieving data");
            Err = true;
        }
    }
    return data;
}

