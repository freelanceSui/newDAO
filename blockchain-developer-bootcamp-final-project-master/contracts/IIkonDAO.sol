// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The Iterface for the IkonDAO - interfaces between dao and its components  
/// @author Fernando M. Trouw
/// @notice this contract should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects
interface IIkonDAO {

    struct Metadata {
        bytes32 name;
        string description;
        bytes32 externalLink;
        bytes32 image; 
        bytes32 category;
        bytes32 artistHandle;
    }

    struct Category {
        bytes32 name;
    }

    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

    /// @notice governor methods
    function version() external returns (string memory);
    function votingDelay() external returns (uint256); 
    function votingPeriod() external returns (uint256);
    function setVotingPeriod(uint256 _period) external;
    function setVotingDelay(uint256 _delay) external;
    
    function propose(
        address[] memory targets, 
        uint256[] memory values, 
        bytes[] memory calldatas, 
        string memory description
    ) external returns (uint256);
    
    function queue(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external returns (uint256);
    
    function execute(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) external returns (uint256);

    function proposalEta(uint256 proposalId) external returns (uint256); 
    function timelock() external returns (address);
    function state(uint256 proposalId) external returns (ProposalState);
    function proposalDeadline(uint256 proposalId) external returns (uint256);
    function castVote(uint256 proposalId, address voter, uint8 support) external returns (uint256);

    /// @notice token methods
    function rewardTokens(address to) external;
    function getBaseReward() external returns(uint256);
    function setBaseReward(uint256 newBase) external;
    function snapshot() external;
    function mint(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external; 
    function decimals() external returns (uint256); 

    /// @notice govtoken methods
    function getWeightLimit() external returns (uint256);
    function getRewardVotes() external returns (uint256);
    function setRewardVotes(uint256 newBase) external;
    function rewardVotes(address to) external;
    function slashVotes (address account, uint256 amount) external; 

    /// @notice non-fungible token methods
    function safeMintVector(
        bytes32 _name, 
        string memory _description, 
        bytes32 _externalLink, 
        bytes32 _imageHash,
        bytes32 _category, 
        bytes32 _handle ) external;
    
    function getCategories() external;
    function getMetadata(uint256 tokenId) external returns(Metadata memory);
    function getDAOAddress() external;
    function setDAOAddress(address newAddress) external;


    /// @notice timelockController methods
    function cancel() external;
    function grantRole(bytes32 role, address account) external;

    /// @notice generic functions used accross all smart contracts
    function pause() external;
    function unpause() external; 
}