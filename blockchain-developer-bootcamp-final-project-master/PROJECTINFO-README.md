# IKONDAO - ERC20 (IKD) - contribution token (IKG, IKC) 
A distributed collective for icons, vector graphics, animated svg's etc.  

## A platform where users can create and curate icons and vector art (like) (what ?)
A platform that enables cooperative contributions from digital art creatives and fascilitates the (automatic) administration of the rewards attributed to their contributions.

## Why ?
For millinia the hierarchic economic model of extraction, production and mainatnes the commons and its stakeholders, has been dominated by a centralized hierarchical models of control. The system supposedly rewards meritorious behavior based on hard work, preserverence and integrity. However, it instead ends up favoring nepotism, excessive control, corruptive and amoral behaviour, and the unqual distribution of value. 

IDAO (icon-dao) collective provides an alternative (digitalized and open) model to the organizational zeitgeist of digital creative art. It provides a system, where collaboration is honoured, where merit is rewarded and where accountability and inclusion through democratic governance form an integral part of decision making within the organization. 

## how does it work ?
Digital art creators (can be anyone) create digital art (according to community set guidelines) and publish them through the platform dashboard as a request to create nft's out of the art. The community votes on the proposed request. If the vote passes, the art will be automatically 'nftified' and appear as premium (to pay for) art on the platform. If the vote does not pass, the art becomes available as a freemium on the platform. 

Users (consumers) can visit the website and obtain the premium 'nftified' products and buy them peer to peer with cryptos. The freemium art will be available for free however, users need to acreditize the creators for using the art.

Note that becoming a creator is open to anyone, however creator status can be revoked through community proposals. The reason for having this functionality is to allow users to hold eachother accountable for their behaviour. Also, creators status can be reinvoked through community proposals, thus control will remain in the hands of the value creators of the platform (distributed - decentralized control).

### what is a 'nftify art' request 
This is a transaction that contains adjustable parameters which will be executed automatically (by a smart contract) once a community vote on it passes. 

Note, art can also be uploaded as free to download art on through the platform, however, this can only be done by contributors to the platform. Some parameters transaction parameters include: 

+ Uniqueness of the nft
    + basically the number of nft contracts that should be created
+ Price 
    + how is an nft valued ? are there any methods for valueing digital art ?
+ Discounted price 
+ some other variable ? 

#### how does the nft process work
a creator will submit a request (proposal) for creating an nft out of his digital art. The community will vote on the request. If the votes on the request fails to pass three times, the submitted files will be compressed and made available for free to users. However, if the the proposal passes the request will be transformed into a transaction that will be invoked by a smartcontract (which represents the community). The smart contract will check if has enough cash (crypto) in its reserves and and then pay for the process. Once the nft is created it will then appear in the marketplace of the platform so that users can buy it.

the creator will be rewarded if the proposal passes or fails. see tokenomics

### what is premium art
Premium art are nft's available for purchase on the platform. Will be created after a succesfull vote on a 'create-nft-request' request. Users can pay for digital art in the unit of their choice that is avaiable for the platform. 

### what is freemium art
Freemium art are avaiable for free on the platform. However users have to give credit to their creators.

## tokenomics
Platform behaviour is guided through the use of tokens. There are two tokens, a governance token and a utility token. 

### governance (reward tokens)
Governance tokens can only be required through contributions (creation of digital art) to the platform. furthermore they can only be rewarded once per proposal given a span of time (say 72 hours), with an upper-monhly limit (so that users refrain from gaming the system, plus governance tokens can always be taken away from a user through a vote).  

The governance token represents a creators contribution to the platform. creators can use their governance token to vote on proposals. next to that they also need the governance tokens for staking the utility token of the platform. 

Note: one user can never obtain more governance points than the total of 51% of the creators of the token. This is to mitigate disproportional voting power between creators. 

### utility token
The utility token can be used as a form of payment (for the nft's) so users would need to buy it on the open market if they choose to pay with it to buy the nft's. The utility token allows users to buy premium art at a discount (set by the community at the request approval process). 

#### Staking
The utility can also be staked on the platform, however, creators can only stake the utility token if they have governance tokens as well i.e. creators will have to contribute at least once in order for them to be able to stake their tokens. Next to that, the amount of utility tokens that are staked can never be more then amount of governance tokens earned. Also, a creator's stake can never be more then 0.5% (changed by through community vote) of the total tokens staked (to ensure some sort of equal distribution of value. Note: this will also limit the amount of contributors to the platform - is it a good idea to keep the creator community small?).

Stakers will be rewarded a passive income on a bi-weekly basis which will be proporational to their staked tokens. Also, stakers will be provided a portion of the fees accrued from nft trades that happen on the platform.  

#### rewards
Approved nft's requests lead to the creators of those requests being rewarded with a the utility token. The value that can be rewarded is fixed and can be set by the community.

### the smart contract
the smart contract(s) will handle the adminstrative tasks of the platform which include: 

+ voting
    + nft requests
    + accountability
    + system update - this include changing some of the variables that allow the system to function
        + governance token limit - maximum amount of governance tokens that a creator can have in relation to the total voting power of the community
        + governance rewards - amount of governance tokens to be rewarded to:
            + successfull nft requests
            + unsuccesfull nft requests
        + utility token rewards 
        + stake percentage limit - maximum stake a creator can have in relation to total tokens staked 
        + contribution limit - number of contributions a creator can have in a given timeline
        + contribution limit timeline 
        + limit for proposal experiation - if proposed request reach a certain timelimit and if people have not voted, then the votes will be tallied based on the amount of people that have voted (responsiblity in this system should be encouraged, after all creators are the owners of the platform)
        
+ distribution of rewards
    + distribute governance tokens to creators
    + distribute utility tokes to creators
    + distribute income (based on percentage of staked tokens)

+ wallet 
    + represents the token reserves of the organization 
        + utility tokens
        + other currencies that are not native to the platform

    + represents the administration reserves
        + stores the native currency of the blockchain on which the dapp is built for paying for transactions of the network. (i think matic or another layer 2 solution should work for this)

    + types of transactions
        + voting 
        + nft creations
        + trading on the platform 


## who ? 
The icon collective is defined by the creators of tokenized digital art (nft's) and the users of said art.

### creators
creators in the collective are digital graphic artists that create animated svg's, icons and vector graphics.
    
* creators can:
    +  create digital art (vector graphics, icons, animated svgs, diffs etc.)
    +  vote on proposals to 'nftify' a project
    +  earn power in the organization in the form of govrernance tokens through their contributions
    +  earn the utility token which can either be traded on the open market or used for staking on the platform   

### users
users are the costumers that will make use of the products avaiable on the platform
    
* users can:
    +  become contributors in the collective (see creator roles)
    +  can trade premium digital art 



## workflows
Some workflows that describe (as much as i can for now) what the ux would feel like

### creators
* Creating an account (register):
    + creator surfs to the platform
    + creator logs in with metamask or other service
    + creator creates platform identity
        + profile photo
        + some links associtated to portofolio
        + userName

* creator login: 
    + creators clicks on login with metamask or other service 
    + app checks wheter creator account belongs isMember or isBanned 
    + if creator isBanned then dissalow login; 
    + if creator isBanned is not true and isMember is not true then.
        + display ui with become member button
    + if creator isBanned is not true and isMember is true then.
        + display ui (proposals page)


* Making an 'create nft request' (before creating a request, a creator should discuss with other creator on the discord channel about the request, this way he can increase the chances that his propsal will pass and also fix issues, if there are, and also discuss variables - price, discount price etc.)
    + creator clicks on proposals on nav
    + on the proposal page creator clicks on create proposal
    + creator can select (from a selection box what kind of proposal to create)
        + system proposal
        + create nft proposal
        + accountability proposal
    + creator clicks on the create nft proposal, a modal pops up/creator is director to page for 'create nft request'
    + creator then proceeds to upload files and fill in the variable data
    + creator then clicks on create proposal
    + a transaction is created and waiting to be executed on vote pass
    + proposal then appears on the proposal page (nft requests section)
    + other creators have to respond before voting time expires
    + if proposal passes then create nft premium and publish on the website art else then create art and published on the website
        + also distribute governance and utility tokens to the transaction creator

* Staking (how exactly does staking work) - will work on this once i understand a bit more about staking -
    + 

* Making a system update request
    + creator clicks on proposals on nav 
    + on the proposal page creator clicks on create proposal
    + creator can select (from a selection box what kind of proposal to create)
        + system proposal
        + create nft proposal 
        + accountability proposal
    + creator selects system update
    + a modal pops up/creator is director to page for 'system update'
    + creator fills in variables
    + proposal appears on proposal page under section system updates
    + creators vote on proposal
    + if propsal passeses, updates are passed to a variables contract with which the main contract interacts
        + note that only the main contract can interact with the system variables contract, so updates can only be executed by a main smart contract instead of directly buy creator accounts

* Making an accountability proposal
    + creator clicks on proposals on nav 
    + on the proposal page creator clicks on create proposal
    + creator can select (from a selection box what kind of proposal to create)
        + system proposal
        + create nft proposal 
        + accountability proposal
    + creator selects accountability proposal 
    + a modal pops up/creator is director to page for 'accountability proposal'
    + creator fills in variables
        + target account (who will be held accountable)
        + amount of governance tokens to slash 
        + amount utility tokens to slash 
    + proposal appears on proposal page under section accountability proposals
    + creators vote on proposal
    + if propsal passeses, target account is then added to the blacklist (don't know if this should be a contract or not?) and the main contract revokes (takes away) the amount of governance tokens, and cp tokens staked by the creator account
        + governance tokens should not be held by individual wallets, instead the smart contract should keep a registry of the accounts that have or don't have governance tokens


### users
* follow creator login process
* Buying premium nft's
    + user clicks on shop (exchange)
    + a list page is presented to user with sort and search options
    + user clicks on art 
    + user the log's in with metamask or other service 
    + user selects unit for payment 
    + user submits payment
    + exchange contract then sends contract to nft to user wallet
    + exchange contract then sends portion of proceeds to administration reserve, rewards reserve
    + exchange store collected fee's in fees reserve

* Downloading free art
    + user clicks on freemiums
    + a list page is presented to user with sort and search options
    + user clicks on art for download
    + user selects format
    + user downloads art
    