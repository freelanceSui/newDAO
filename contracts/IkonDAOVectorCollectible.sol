// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/// @title The IkonDAO Vectore Collectible - fungible vector art produced by dao members 
/// @author Fernando M. Trouw
/// @notice this contract should be used for basic simulation purposes only 
/// @notice this contract is an experimental contract and should not be used to initiate project that will hold real value
/// @dev functions currently implemented (other then imported library) functions could contain side-effects


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Constants.sol";

/// @custom:security-contact ftrouw@protonmail.com
contract IkonDAOVectorCollectible is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, AccessControl, Constants {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Metadata {
        string image; 
        bytes32 category;
    }

    struct Category {
        bytes32 name;
    }

    mapping(uint256 => Metadata) private tokenMetadata;
    Category[] private categoryList;
    mapping(bytes32 => bool) private isCategory; 

    address _DAO;  /// maps category to list of tokens that belong to it

    event DaoAddressChanged(address newAddress);
    event VectorMinted(uint256 tokenId, address receiver);

    constructor(address DAO) ERC721("IkonDAO Vector Collectible", "IKDVC") {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(PAUSER_ROLE, _msgSender());
        _setRoleAdmin(PAUSER_ROLE, ADMIN_ROLE);
        _setupRole(MINTER_ROLE, _msgSender());
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
        _DAO = DAO;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }


    /// @dev mints nft to a receiver
    /// @param _to nft receiver
    function safeMint(address _to) private {
        _safeMint(_to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    /// @dev mints vector token for the icon dao
    /// @param _imageHash of vector      
    /// @param _category category under which the vector falls
    function safeMintVector(
        string calldata _imageHash,
        bytes32 _category
        ) external onlyRole(MINTER_ROLE) whenNotPaused {
        
        uint256 tokenId = _tokenIdCounter.current();
        if (tokenId != 0){ // only check after minting of the first token
            require(!isImageTaken(_imageHash), NFT_ALREADY_EXISTS); 
        } 
        
        /// metadata
        Metadata memory metadata = Metadata({
            category: _category,
            image: _imageHash
        });

        if (!isCategory[_category]){ 
            
            safeMint(_DAO); // mint new nft 
            Category memory category = Category({
                name: _category
            }); // create new category 

            categoryList.push(category);
            isCategory[_category] = true; // validate category
            tokenMetadata[tokenId] = metadata; // adds metadata to tokenid

        }  else {

            safeMint(_DAO);
            tokenMetadata[tokenId] = metadata;

        }

        emit VectorMinted(tokenId, _DAO);
    }

    /// @dev returns true image hash of a to-be-minted nft already exists
    /// @param imageHash ipfs hash of the image in in bytes32 format
    /// @notice this functions acts as an extra check to make sure that only unique vectors (i.e. they must have a unique image hash) can 
    function isImageTaken(string calldata imageHash) private view returns (bool exists) {
        for (uint i = 0; i < _tokenIdCounter.current(); i++){
            if (keccak256(abi.encodePacked(tokenMetadata[i].image)) == keccak256(abi.encodePacked(imageHash))){
                exists = true;
            }
        }
    }

    function getCategories() external view returns (Category[] memory) {
        return(categoryList);
    }

    function getMetadata(uint256 tokenId) public view returns (Metadata memory){
        return (tokenMetadata[tokenId]);
    }
    
    /// @dev returns dao address 
    function getDAOAddress() public view returns (address){
        return _DAO;
    }

    /// @dev see _setDaoAddress
    function setDAOAddress(address newAddress) external onlyRole(ADMIN_ROLE) whenNotPaused {
        _setDaoAddress(newAddress);
        emit DaoAddressChanged(newAddress);
    }

    /// @dev sets new dao address (address to which vectors will belong)
    /// @param _new is the new address that will own the vectors
    function _setDaoAddress(address _new) private {
        _DAO = _new;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) onlyRole(ADMIN_ROLE) whenNotPaused {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
