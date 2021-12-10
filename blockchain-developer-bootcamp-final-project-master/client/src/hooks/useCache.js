import React, {useState, useEffect} from 'react'; 
import {useLocation} from 'react-router-dom'; 

export default function useCache(toCache) {
    // get data that needs to be cached
    // check if data is already cached 
    // if data is already cached && new data is not changed
    // then cache data and return newly cached dataob
    // else if data is already cached and data has not changed 
    // then return cached data
    // if data is not cached 
    // then cache data and after return cached data

    const { pathname } = useLocation(); 
    const [cached, setCached] = useState(window.localStorage.getItem( pathname ));
    useEffect(()=> {
        if(!cached){
            window.localStorage.setItem();
        }
    })
    return (
        <div>
            
        </div>
    )
}
