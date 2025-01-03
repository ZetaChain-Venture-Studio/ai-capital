// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface Iizumi {
    struct SwapAmountParams {
        bytes path;
        address recipient;
        uint128 amount;
        uint256 minAcquired;
        uint256 deadline;
    }

    function swapAmount(SwapAmountParams calldata params)
        external
        payable
        returns (uint256 cost, uint256 acquire);
}

//https://youtu.be/TLsy8Hjt_JY
// Zetachain Deployment = 0xbe95807Bc4923664DdDE3a8bC653F8bc9D37F441
/*
    // Token addresses on Polygon mainnet
    address public constant USDC = 0x020B5D3da45c46F0b38B2B43DE7B552771385f8F;//ok
    address public constant USDT = 0xe3b5f5ac71e00252118BB76Ef67996F62c98AB5d; //ok

    setFee => 10000
*/
contract AIC is AccessControl {
    mapping(address => uint8) public whitelist;
    bytes32 public constant SERVER_ROLE = keccak256("SERVER_ROLE");
    bytes32 public constant TREASURE_ROLE = keccak256("TREASURE_ROLE");
    uint256 public constant priceZ = 1 ether; // change prices
    uint256 public price;
    address payable public protocol;
    address payable public bounty;
    IERC20 public  usdcToken;
    address public constant _usdtToken = address(0xe3b5f5ac71e00252118BB76Ef67996F62c98AB5d);
    mapping(address => mapping(address => bytes3)) public fee;

    address private constant IZUMI_ROUTER = 0x34bc1b87f60e0a30c0e24FD7Abada70436c71406;
    Iizumi public izumiRouter;

    event Approved(address indexed token, address indexed spender, uint256 amount);

    // Evento para registrar el cambio de tarifas
    event FeeSet(address indexed tokenA, address indexed tokenB, bytes3 feeAmount);

    event newPlayer(address indexed player, uint256 amount);

    constructor() {
        address _usdcToken = address(0x020B5D3da45c46F0b38B2B43DE7B552771385f8F);
        usdcToken = IERC20(_usdcToken);
        izumiRouter = Iizumi(IZUMI_ROUTER);
        price = priceZ;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SERVER_ROLE, msg.sender);
        _grantRole(TREASURE_ROLE, msg.sender);

        fee[_usdcToken][_usdtToken] = 0x002710;
        emit FeeSet(_usdcToken, _usdtToken, 0x002710);

        fee[_usdtToken][_usdcToken] = 0x002710;
        emit FeeSet(_usdtToken, _usdcToken, 0x002710);

        protocol = payable(address(0xd02fB5E4CF58c409311900dfA72A2B156688Abcf));
        bounty = payable(address(0x3AbB661a42360f6f0A6132e68B4aC2C1415078b2));
    }

    function deWhitelist(address _user) external onlyRole(SERVER_ROLE) {
        whitelist[_user]--;
    }

    function withdraw() external onlyRole(TREASURE_ROLE) {
        uint256 amount = address(this).balance;
        require(amount > 0, "Insufficient MATIC balance");
        payable(msg.sender).transfer(amount);
    }

    function setProtocol(address payable _protocol) external onlyRole(DEFAULT_ADMIN_ROLE) {
        protocol = _protocol;
    }

    function setBounty(address payable _bounty) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bounty = _bounty;
    }

    ///@notice Performs a token swap between two ERC20 tokens.
    ///@dev This function checks the balance of tokenA, approves the izumi router to spend it,
    ///     and executes the swap for tokenB.
    ///@param tokenA The address of the token being swapped from.
    ///@param tokenB The address of the token being swapped to.
    ///@param percent The amount of tokenA to swap.
    function _swapTokens(address _user, address tokenA, address tokenB, uint256 percent) public onlyRole(SERVER_ROLE) {
        require(whitelist[_user] > 0, "_user not in whitelist");
        whitelist[_user]--;
        uint256 amountIn = calculateAmountIn(tokenA, percent);
        require(amountIn > 0, "Insufficient token balance");
        approveToken(tokenA, IZUMI_ROUTER, amountIn);

        bytes memory path = getPath(tokenA, tokenB);
        if(getFeeLength(tokenA, tokenB) > 2) {
            performSwap(path, uint128(amountIn), 0, (block.timestamp + 2 hours), false);            
        } else {
            performSwap(path, uint128(amountIn), 0, (block.timestamp + 2 hours), true);  
        }
    }

    function getBalances(address[] memory tokens) public view returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            balances[i] = IERC20(tokens[i]).balanceOf(address(this));
        }

        return balances;
    }

    function getPath(address tokenA, address tokenB) public view returns (bytes memory) {
        return encodePath(tokenA, fee[tokenA][tokenB], tokenB);
    }

    function calculateAmountIn(address tokenA, uint256 percent) public view returns (uint256) {
        require(percent <= 100, "Percent must be between 0 and 100");

        uint256 balance = IERC20(tokenA).balanceOf(address(this));
        uint256 amountIn = (balance * percent) / 100;

        return amountIn;
    }

    // Función para obtener la longitud de bytes en fee[tokenA][tokenB]
    function getFeeLength(address tokenA, address tokenB) public view returns (uint256) {
        return fee[tokenA][tokenB].length;
    }

    function encodePath(address tokenA, bytes3 _fee, address tokenB) public pure returns (bytes memory) {
        // Codifica el path en formato ABI
        return abi.encodePacked(tokenA, _fee, tokenB);
    }

    function performSwap(bytes memory path, uint128 amount, uint256 minAcquired, uint256 deadline, bool pathOrNotToPath) public returns(uint256 cost, uint256 acquire) {
        if(pathOrNotToPath) {
            path = hex"020b5d3da45c46f0b38b2b43de7b552771385f8f002710e3b5f5ac71e00252118bb76ef67996f62c98ab5d";
        }

        Iizumi.SwapAmountParams memory params = Iizumi.SwapAmountParams({
            path: path,
            recipient: address(this),
            amount: amount,
            minAcquired: minAcquired,
            deadline: deadline
        });
        return (izumiRouter.swapAmount(params));
    }    

    function approveToken(address token, address spender, uint256 amount) public onlyRole(SERVER_ROLE) {
        IERC20(token).approve(spender, amount);
        emit Approved(token, spender, amount);
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

    /// @notice Sets the izumi router address.
    /// @param _izumiRouter The new izumi router address.
    function setizumiRouter(Iizumi _izumiRouter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        izumiRouter = _izumiRouter;
    }

    // Función para establecer la tarifa entre dos tokens
    function setFee(address tokenA, address tokenB, bytes3 feeAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(tokenA != address(0), "tokenA address cannot be zero");
        require(tokenB != address(0), "tokenB address cannot be zero");

        fee[tokenA][tokenB] = feeAmount;

        emit FeeSet(tokenA, tokenB, feeAmount);
    }

    // Setter para actualizar la dirección del token USDC
    function setUsdcToken(address _usdcToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_usdcToken != address(0), "Invalid address");
        usdcToken = IERC20(_usdcToken);
    }


    function payGame() external {
        uint256 _price = price;

        require(bounty!=address(0x0),"no Bounty set");
        require(protocol!=address(0x0),"no Protocol set");

        // Verifica que el jugador tenga suficiente saldo
        require(usdcToken.balanceOf(msg.sender) >= _price, "Insufficient USDC balance");

        // Verifica que el jugador haya aprobado el gasto de USDC
        require(usdcToken.allowance(msg.sender, address(this)) >= _price, "USDC allowance insufficient");

        // Realiza el transferFrom
        bool success = usdcToken.transferFrom(msg.sender, address(this), _price);
        require(success, "Transfer failed");
        success = usdcToken.transfer(protocol, (_price<<1)/10); // 20% for devs
        require(success, "Transfer failed");
        success = usdcToken.transfer(bounty, (_price*75)/100); // 75% for users / 5% to increase treasure
        require(success, "Transfer failed");

        whitelist[msg.sender]++;

        // Emitir un evento de pago
        emit newPlayer(msg.sender, _price);
        price = (_price * 105) /100;
    }
}