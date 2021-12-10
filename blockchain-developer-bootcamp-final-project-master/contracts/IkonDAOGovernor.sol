// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./Constants.sol"; 

/// @title Governor module for the IkonDAO
/// @author Fernando M. Trouw
/// @notice this contract experimental 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value

/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAOGovernor is Governor, AccessControl, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl, Constants {

    // string private _name; 
    string public _version;
    uint256 private _votingDelay; 
    uint256 private _votingPeriod;
    uint256 private _owner;  

    constructor(ERC20Votes _govToken, address _timelock, uint256 _delay, uint256 _period)
        Governor("IkonDaoGovernor")
        GovernorVotes(_govToken)
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(TimelockController(payable(_timelock))) 
        
    {
        /// contract metadata 
        _votingDelay = _delay;
        _votingPeriod = _period;
        _version = "1.0.0";

        /// accesscontrol
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
    }

    function version() public view override(Governor, IGovernor) returns (string memory) {
        return _version;
    }

    function votingDelay() public view override returns (uint256) {
        return _votingDelay; // 1 block
    }

    function votingPeriod() public view override returns (uint256) {
        return _votingPeriod; // 1 minutes 
    }

    function setVotingPeriod(uint256 _period) external onlyRole(ADMIN_ROLE) {
        _setVotingPeriod(_period);
    }

    function _setVotingPeriod(uint256 _period) private {
        _votingPeriod = _period; 
    }

    function setVotingDelay(uint256 _delay) public onlyRole(ADMIN_ROLE) {
        _setVotingDelay(_delay); 
    } 

    function _setVotingDelay(uint256 _delay) private {
        _votingDelay = _delay;
    } 
    
    /// @dev see IkonDAO{castVote}
    function castVote(uint256 proposalId, address voter, uint8 support) external onlyRole(ADMIN_ROLE) returns (uint256) {
        return _castVote(proposalId, voter, support, "");
    }

    /// @dev see IkonDAO{castVote}
    function castVote(uint256 proposalId, uint8 support) public override(Governor, IGovernor) onlyRole(ADMIN_ROLE) returns(uint256) {
        return super.castVote(proposalId, support);
    }

    function queue(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public override onlyRole(ADMIN_ROLE) returns (uint256) {
        return super.queue(targets, values, calldatas, descriptionHash);
    }

    function castVoteWithReason(
        uint256 proposalId, 
        uint8 support, 
        string calldata reason) 
        public 
        override(Governor, IGovernor) 
        onlyRole(ADMIN_ROLE) returns(uint256){
        return super.castVoteWithReason(proposalId, support, reason);
    }

    function castVoteBySig(
        uint256 proposalId, 
        uint8 support, 
        uint8 v,
        bytes32 r, 
        bytes32 s) 
        public 
        override(Governor, IGovernor) 
        onlyRole(ADMIN_ROLE) returns(uint256){
        return super.castVoteBySig(proposalId, support, v, r, s);
    }

    // The following functions are overrides required by Solidity.
    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotes)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }
    
    function propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)
        public
        override(Governor, IGovernor) onlyRole(ADMIN_ROLE)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
