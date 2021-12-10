// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IKONDAO - a distributed collective for icon, vector graphics, animated svg's creators and creative artists
/// @author Fernando M. Trouw
/// @notice this contract experimental 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value

import "@openzeppelin/contracts/governance/IGovernor.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol"; 
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";

import "./IkonDAOGovernor.sol";
import "./IkonDAOGovernanceToken.sol";
import "./IkonDAOToken.sol";
import "./Constants.sol";
import "./IIkonDAO.sol";

// import "./Helpers.sol"; 

contract IkonDAO is Constants, AccessControlEnumerableUpgradeable, ERC721HolderUpgradeable, UUPSUpgradeable {
    
    IIkonDAO private governor;
    address private timelocker;    
    IIkonDAO private token; 
    
    event MemberCreated(address indexed _member); 
    event MemberBanned(address indexed _member); 
    event Log(uint256 id, uint8 support);

    /// @notice unsafe allow     
    constructor (){} 

    /// @notice initializes ikonDAO
    function __IkonDAO_init(address govAddress, address timelockerAddress, address tokenAddress) external initializer(){

        /// @notice instantiate dao interface
        governor = IIkonDAO(govAddress);
        timelocker = timelockerAddress;
        token = IIkonDAO(tokenAddress);
                
        /// @notice setRoles
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MEMBER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(BANNED_ROLE, ADMIN_ROLE);
        __AccessControlEnumerable_init();
        __ERC721Holder_init(); // give nft holding capacity of erc721 token
    }

    /// @dev creates new dao proposal
    /// @param targets contract from calldatas should be executed
    /// @param values values thaat will be sent to the targets
    /// @param datas datas that will be called by the targets
    /// @param description description of the proposal
    function propose (
        address[] calldata targets, 
        uint256[] calldata values, 
        bytes[] memory datas,
        string calldata description
    ) public onlyRole(MEMBER_ROLE) returns (uint256 _proposalId) {
        _proposalId = governor.propose(targets, values, datas, description);
    }

    function castVote(uint256 proposalId, uint8 support) external onlyRole(MEMBER_ROLE) returns (uint256) {
        emit Log(proposalId, support);
        return governor.castVote(proposalId, _msgSender(), support); 
    }   

    /// @dev executes proposal through dao governor
    /// @param targets contract from calldatas should be executed
    /// @param values values thaat will be sent to the targets
    /// @param datas datas that will be called by the targets
    /// @param descriptionHash description of the proposal
    function execute(
        address[] calldata targets, 
        uint256[] calldata values, 
        bytes[] memory datas,
        bytes32 descriptionHash
    ) public onlyRole(MEMBER_ROLE) returns (uint256) {
        return governor.execute(targets, values, datas, descriptionHash);
    }

    /// @dev queues a succeeded proposal to the timelock
    /// @param targets contract from calldatas should be executed
    /// @param values values thaat will be sent to the targets
    /// @param datas datas that will be called by the targets
    /// @param descriptionHash description of the proposal
    function queue(
        address[] calldata targets, 
        uint256[] calldata values, 
        bytes[] memory datas,
        bytes32 descriptionHash
    ) public onlyRole(MEMBER_ROLE) returns (uint256) {
        return governor.queue(targets, values, datas, descriptionHash); 
    }

    /// @dev makes a member of the caller of this function
    function createMember() external {
        require(!hasRole(MEMBER_ROLE, _msgSender()), REQUIRE_CREATEMEMBER_ALREADY_CREATED);
        require(!hasRole(BANNED_ROLE, _msgSender()), REQUIRE_CREATEMEMBER_USER_BANNED);
        _setupRole(MEMBER_ROLE, _msgSender());
        emit MemberCreated(_msgSender());
    }
   
    /// @dev bans member
    /// @param _account target account to be banned
    function banMember(address _account) external onlyRole(ADMIN_ROLE) {
        require(!hasRole(BANNED_ROLE, _account), REQUIRE_BANMEMBER_ALREADY_BANNED);
        require(hasRole(MEMBER_ROLE, _account), REQUIRE_BANMEMBER_ONLY_MEMBERS);
        revokeRole(MEMBER_ROLE, _account);
        _setupRole(BANNED_ROLE, _account);
        emit MemberBanned(_account);
    } 

    /// @dev transfers utility tokens for user rewards
    function transferTokensToTimelocker() external onlyRole(ADMIN_ROLE) {
        uint256 baseReward = token.getBaseReward(); 
        token.transfer(address(timelocker), baseReward);
    } 

    /// @dev mints tokens to the proxy address
    /// @param amount amount of tokens that will be minted to proxy address
    function mintUtilityTokens(uint256 amount, address to) external onlyRole(ADMIN_ROLE) {
        token.mint(to, amount * 10 ** token.decimals());
    }

    /// @dev authorizes upgrades to this contract
    /// @param newImplementation address to wich to upgrade
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // /// @dev upgrades the implemenation contract
    // /// @param newImplementation address to wich to upgrade
    // function upgradeTo(address newImplementation) external override onlyRole(ADMIN_ROLE) {
    //     super.upgradeTo(newImplementation);
    // }


}