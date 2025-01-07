// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bounty is Ownable {
    
    event TokenWithdrawn(address indexed token, address indexed to, uint amount);
    event EtherWithdrawn(address indexed to, uint amount);

    // Constructor
    constructor() Ownable(msg.sender) {
        // Aquí puedes agregar cualquier inicialización adicional si es necesario
    }

    // Función para retirar cualquier token ERC20
    function withdrawToken(IERC20 token, address to) external onlyOwner {
        uint256 amount = token.balanceOf(address(this));
        require(amount > 0, "Amount must be greater than 0");

        // Transferir el token a la dirección especificada
        token.transfer(to, amount);

        // Emitir el evento correspondiente
        emit TokenWithdrawn(address(token), to, amount);
    }

    // Función para retirar Ether
    function withdrawEther(address payable to, uint amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= amount, "Insufficient Ether balance");

        // Transferir Ether a la dirección especificada
        to.transfer(amount);

        // Emitir el evento correspondiente
        emit EtherWithdrawn(to, amount);
    }

    // Recibir Ether
    receive() external payable {}
}