// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

// deployed in sepolia optimism at = 0xb396b402AD30e794e35E05A08960Af07B7D18334
contract AIC is AccessControl{
    
    mapping(address => uint8) public whitelist;
    bytes32 public constant SERVER_ROLE = keccak256("SERVER_ROLE");
    bytes32 public constant TREASURE_ROLE = keccak256("TREASURE_ROLE");
    uint256 public constant priceZK = 0.05 ether; //3
    uint256 public constant priceOP = 0.0001 ether;// 3000
    uint256 public price;
    address public server;

    constructor() {
        if(block.chainid==324) {
            price = priceZK;
        } else {
            price = priceOP;
        }
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SERVER_ROLE, msg.sender);
        _grantRole(TREASURE_ROLE, msg.sender);
    }

    receive() external payable { 
        require(msg.value==price,"not the price");
        payable(msg.sender).transfer(7*address(this).balance/10);
        whitelist[msg.sender]++;
    }

    function decWhitelist() external onlyRole(SERVER_ROLE) {
        whitelist[msg.sender]--;
    }

    function withdraw() external onlyRole(TREASURE_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }

    function setServer(address _server) external onlyRole(DEFAULT_ADMIN_ROLE) {
        server = _server;
    }

}