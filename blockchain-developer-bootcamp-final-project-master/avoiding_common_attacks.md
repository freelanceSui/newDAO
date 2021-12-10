# #1 proper use modifiers
The modifiers utilized in my contract mostly inherit from openzeppelin's AccessControl library. And as far as i'm aware of these modifiers are only used for validating the roles set. Thus i'm assured that the modifiers applied in my contract only validate that the callers of the core contract methods have the required roles (in the constants abstract contracts i have defined what these roles are).

# 2# Pull over push
Users typically cannot make any contract calls associated with functionalities like minting tokens and nft's, i tried to minimize the amount of direct call to core contracts (NFT, GOVERNOR, TOKEN, GOVERNANCE and TImelocker) to 0. all calls have to go through proposals which are executed by a timelocker. users can start the exectution of porposal by calling the inhereted execute function through the proxy contract, but the execution itself is carried out by the timelocker.

# 3# Checks effects interactions
State changes are applied before execution of the safemint, mint, and rewards functions on the nft, token and governance token contracts respectively. thus reducing the chances of re-entrency. However, while im aware of proper re-entrency gaurds i have not implemented them given the scope of the bootcamp. However I will implement in the future. 
