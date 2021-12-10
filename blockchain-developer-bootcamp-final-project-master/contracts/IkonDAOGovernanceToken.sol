// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IkonDAOGovernance Token - extension of the icond 
/// @author Fernando M. Trouw
/// @notice this contract should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Constants.sol";

/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAOGovernanceToken is ERC20Burnable, ERC20Snapshot, AccessControl, Pausable, ERC20Permit, ERC20Votes, Constants {

    /// @notice represents the maximum amount of votes a user can own 
    /// @notice represented with decimals
    /// @notice converted to - with decimals from the front end 
    uint private _weightLimitFraction; 
    uint private _baseRewardVotes;

    using SafeMath for uint256;

    event VotingPowerIncreased(address _receiver, uint256 _amount, string message);
    event VotingPowerSlashed(address _receiver, uint256 _amount, string message);

    constructor(uint256 _fraction, address[] memory _initialUsers, uint256 _initialVotes, uint256 _baseReward)
        ERC20("IkonDAOGovernanceToken", "IKDG")
        ERC20Permit("IkonDAOGovernanceToken")
    {

        _weightLimitFraction = _fraction;
        _baseRewardVotes = _baseReward;
        // _mint(msg.sender, 10000000 * 10 ** decimals());
        
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(SNAPSHOT_ROLE, msg.sender);
        _setRoleAdmin(SNAPSHOT_ROLE, ADMIN_ROLE);

        for (uint i = 0; i < _initialUsers.length; i++){
            _mint(_initialUsers[i], _initialVotes);
            selfDelegate(_initialUsers[i]);
            // _govRewardVotes(_initialUsers[i], _initialVotes);
        }
        pause();
    }
    
    /// @dev sets vote weight limit
    /// @param _fraction fraction to which the weight limit should be set  
    // function setWeightLimitFraction(uint256 _fraction) external onlyOwner {
    //     _weightLimitFraction = _fraction;   
    // }

    /// @dev returns weight limit of governance token
    function getWeightLimit() public view returns (uint256) {
        return totalSupply().mul(_weightLimitFraction).div(100);
    } 

    /// @dev exposes baseReward
    function getRewardVotes() public view returns(uint256) {
        return _baseRewardVotes; 
    }
    
    /// @dev sets _baseVotingReward
    /// @param newBase is the amount to set rewards to 
    function setRewardVotes(uint256 newBase) external onlyRole(ADMIN_ROLE) {
        _baseRewardVotes = newBase;
    }

    /// @dev checks wheter limit is reached it is it returns rest that should be sent
    /// @param _receiver address of the contributor
    function weightLimitReached(address _receiver) private view returns (bool _reached, uint256) {
        uint256 limit = getWeightLimit();
        uint256 votes = getVotes(_receiver);
        return votes >= limit ? (_reached = true, 0) : (_reached = false, calculateRewards(votes, limit));
    }

    /// @dev calculates reward contribution
    /// @param votes voteWeight of account
    /// @param limit voteWeight limit  
    function calculateRewards(uint256 votes, uint256 limit) private view returns (uint256){
        return votes.add(_baseRewardVotes) <= limit ? _baseRewardVotes : limit - votes;
    }
    
    /// @notice see _rewardvotes 
    function rewardVotes(address to) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "not a valid address");
        unpause(); // unpause the contract
        _rewardVotes(to);
        pause();
    }

    /// @dev mints reward tokens to contributors
    /// @param _to contributors address
    /// @notice checks first if weightlimit (maximumVotes) is breached
    /// @notice also checks if reward + account balance
    /// @notice use in constructor  
    function _rewardVotes(address _to) private whenNotPaused {

        /// @notice check if user balance is 0
        if (getVotes(_to) != 0){
            /// @notice if its not then proceed with actions below
            /// @notice weight exceeds limit ?
            (bool limitReached, uint256 reward) = weightLimitReached(_to);
            if (limitReached){
            
                emit VotingPowerIncreased(_to, reward, "Can't level up for now, try helping others");
            
            } else {
                mint(_to, reward);
                selfDelegate(_to);
                emit VotingPowerIncreased(_to, reward, "Level up");
            }
 
        } else {
            mint(_to, _baseRewardVotes);
            selfDelegate(_to);
            emit VotingPowerIncreased(_to, _baseRewardVotes, "Level up");
        }
    }


    /// @dev see _slashVotes
    function slashVotes (address account, uint256 amount) external onlyRole(ADMIN_ROLE) {    
        require(amount <= getVotes(account), "amount exceeds user votes");
        _unpause();
        _slashVotes(account, amount);
        pause();
    }

    /// @dev removes votes from account (accountability)
    /// @param _account account whose votes will removed 
    function _slashVotes(address _account, uint256 _amount) private whenNotPaused {
        _burn(_account, _amount);
    } 

    /// @dev dao "self" delegates votes to user  
    /// @param delegatee user who will receive votes
    function selfDelegate(address delegatee) private whenNotPaused {
        return _delegate(delegatee, delegatee);
    }

    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function snapShot() external onlyRole(ADMIN_ROLE) {
        _unpause();
        _snapshot();
        _pause();
    }

    function mint(address to, uint256 amount) private onlyRole(ADMIN_ROLE) whenNotPaused {
        super._mint(to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override(ERC20, ERC20Snapshot)
    {   
        super._beforeTokenTransfer(from, to, amount);
    }

    // The following functions are overrides required by Solidity.
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes) whenNotPaused
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes) whenNotPaused
    {
        super._burn(account, amount);
    }
    
    /// @notice public delegate functions are overriden as dao does not allow delegateion of votes
    function delegate (address delgatee) public pure override {
        revert("delegating votes not allowed");
    }
    function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) public pure override {
        revert("delegating votes not allowed");
    }
    
}
