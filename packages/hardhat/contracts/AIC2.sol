// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";


//https://youtu.be/TLsy8Hjt_JY
// Polygon Deployment = 0x8163E0022C8f4b94afBDacB16398d47aAaEF0653
// https://polygonscan.com/address/0x8163E0022C8f4b94afBDacB16398d47aAaEF0653#code   => verified
//video = https://www.youtube.com/watch?v=TLsy8Hjt_JY
/*
    // Token addresses on Polygon mainnet
    address public constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F; //ok
    address public constant USDC = 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;//ok
*/
contract AIC2 is AccessControl {

    mapping(address => uint8) public whitelist;
    bytes32 public constant SERVER_ROLE = keccak256("SERVER_ROLE");
    bytes32 public constant TREASURE_ROLE = keccak256("TREASURE_ROLE");
    uint256 public constant priceZK = 0.05 ether; // change prices
    uint256 public constant priceOP = 0.0001 ether;// change prices
    uint256 public price;
    address public server;

    address private constant UNISWAP_V2_ROUTER = 0xedf6066a2b290C185783862C7F4776A2C8077AD1;
    IUniswapV2Router02 public uniswapRouter;

    event Approved(address indexed token, address indexed spender, uint256 amount);

    constructor() {
        uniswapRouter = IUniswapV2Router02(UNISWAP_V2_ROUTER);
        if(block.chainid==324) {
            price = priceZK;
        } else {
            price = priceOP;
        }
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SERVER_ROLE, msg.sender);
        _grantRole(TREASURE_ROLE, msg.sender);
    }

    function decWhitelist() external onlyRole(SERVER_ROLE) {
        whitelist[msg.sender]--;
    }

    function withdraw() external onlyRole(TREASURE_ROLE) {
        uint256 amount = address(this).balance;
        require(amount > 0, "Insufficient MATIC balance");
        payable(msg.sender).transfer(amount);

    }

    function setServer(address _server) external onlyRole(DEFAULT_ADMIN_ROLE) {
        server = _server;
    }

    ///@notice Performs a token swap between two ERC20 tokens.
    ///@dev This function checks the balance of tokenA, approves the Uniswap router to spend it,
    ///     and executes the swap for tokenB.
    ///@param tokenA The address of the token being swapped from.
    ///@param tokenB The address of the token being swapped to.
    ///@param percent The amount of tokenA to swap.
    function _swapTokens(
        address tokenA,
        address tokenB,
        uint256 percent
    ) public onlyRole(SERVER_ROLE) {
        uint256 amountIn = IERC20(tokenA).balanceOf(address(this)) * percent / 100;
        require(amountIn > 0, "Insufficient token balance");
        require(IERC20(tokenA).approve(UNISWAP_V2_ROUTER, amountIn), "Token approval failed");

        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;

        uniswapRouter.swapExactTokensForTokens(
            amountIn,
            0,
            path,
            address(this),
            block.timestamp
        );
    }

    ///@notice Withdraws USDT or USDC from the contract
    ///@param token The address of the token to withdraw (USDT or USDC)
    ///@param amount The amount of tokens to withdraw
    function withdrawTokens(address token, uint256 amount) external onlyRole(TREASURE_ROLE) {
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient token balance");
        IERC20(token).transfer(msg.sender, amount);
    }

    /// @notice Sets the price.
    /// @param _price The new price to set.
    function setPrice(uint256 _price) external onlyRole(DEFAULT_ADMIN_ROLE) {
        price = _price;
    }

    /// @notice Sets the Uniswap router address.
    /// @param _uniswapRouter The new Uniswap router address.
    function setUniswapRouter(IUniswapV2Router02 _uniswapRouter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uniswapRouter = _uniswapRouter;
    }

    receive() external payable { 
        require(msg.value==price,"not the price");
        payable(server).transfer(7*address(this).balance/10);
        whitelist[msg.sender]++;
    }

}