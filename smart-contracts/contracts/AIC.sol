// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "./Bounty.sol";

//testnet
// USDC = 0x0d4E00eba0FC6435E0301E35b03845bAdf2921b4
// Pepe = 0xf63fC04B0e424787d2e66867B869E649b5Aa9308
// AIC = 0x6d2fbd23E8Ab975EBbd66026f8E435149a2a552f
// Bounty = 0xBC673f77e2cC394b866Af8a66869f538861aB054
// newBounty = 0x8F067fa5DCC632816ae557EA7590A100Ca986d28
// newAic = 0x2dEcadD1A99cDf1daD617F18c41e9c4690F9F920
contract AIC is AccessControl {
    mapping(address => uint8) public whitelist;
    bytes32 public constant SERVER_ROLE = keccak256("SERVER_ROLE");
    bytes32 public constant TREASURE_ROLE = keccak256("TREASURE_ROLE");
    uint256 public constant priceZ = 1 * 1000000; // change prices
    uint256 public price;
    address payable public protocol;
    Bounty public bounty;
    IERC20 public  usdcToken;

    uint16 internal constant MAX_DEADLINE = 3600;
    address public constant WZETA = 0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf;
    address public constant UniswapRouter = 0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe;

    event Approved(address indexed token, address indexed spender, uint256 amount);

    // Evento para registrar el cambio de tarifas
    event FeeSet(address indexed tokenA, address indexed tokenB, bytes3 feeAmount);

    event newPlayer(address indexed player, uint256 amount);
    
    event winner(address indexed user, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 timestamp);


    constructor() {
        address _usdcToken = address(0x0d4E00eba0FC6435E0301E35b03845bAdf2921b4);
        usdcToken = IERC20(_usdcToken);
        price = priceZ;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SERVER_ROLE, msg.sender);
        _grantRole(TREASURE_ROLE, msg.sender);
        _grantRole(SERVER_ROLE, address(0x3DCE981b7E79Eb0e1A8a810345c3F21A94A410e2)); // Sever testing
        protocol = payable(address(0xd02fB5E4CF58c409311900dfA72A2B156688Abcf));
        //bounty = payable(address(0x3AbB661a42360f6f0A6132e68B4aC2C1415078b2));
        bounty = new Bounty();
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

    function setBounty(Bounty _bounty) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bounty = _bounty;
    }


   /// @notice Swap tokens for tokens
    ///@param tokenA The address of the token being swapped from.
    ///@param tokenB The address of the token being swapped to.
    /// @return amounts The amount of token received
    function swapTokens(address _user, address tokenA, address tokenB) external payable onlyRole(SERVER_ROLE) returns(uint[] memory amounts) {
        uint amountIn = 100000000; // precio fijo para el swap

        require(whitelist[_user] > 0, "_user not in whitelist");
        whitelist[_user]--;

        //address[2] memory path;
        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;

        // Give approval to uniswap
        IERC20(tokenA).approve(address(UniswapRouter), amountIn);
        amounts = IUniswapV2Router01(
                    UniswapRouter
                ).swapExactTokensForTokens(
                    amountIn,
                    0,
                    path,
                    address(this), //address(this)
                    block.timestamp + MAX_DEADLINE
                );

        bounty.withdrawToken(usdcToken, _user);

        emit winner(
            _user, 
            tokenA, 
            tokenB, 
            amountIn, 
            amounts[path.length - 1], 
            block.timestamp
        );

    }

   /// @notice Swap tokens for tokens with zeta in the middle
    ///@param tokenA The address of the token being swapped from.
    ///@param tokenB The address of the token being swapped to.
    /// @return amounts The amount of token received
    function swapTokens(address _user, address tokenA, address tokenB, bool /*_zeta*/) external payable onlyRole(SERVER_ROLE) returns(uint[] memory amounts) {
        uint amountIn = 100000000; // precio fijo para el swap

        require(whitelist[_user] > 0, "_user not in whitelist");
        whitelist[_user]--;

        //address[2] memory path;
        address[] memory path = new address[](3);
        path[0] = tokenA;
        path[1] = WZETA;
        path[2] = tokenB;

        // Give approval to uniswap
        IERC20(tokenA).approve(address(UniswapRouter), amountIn);
        amounts = IUniswapV2Router01(
                    UniswapRouter
                ).swapExactTokensForTokens(
                    amountIn,
                    0,
                    path,
                    address(this), //address(this)
                    block.timestamp + MAX_DEADLINE
                );

        bounty.withdrawToken(usdcToken, _user);

        emit winner(
            _user, 
            tokenA, 
            tokenB, 
            amountIn, 
            amounts[path.length - 1], 
            block.timestamp
        );

    }




    function getBalances(address[] memory tokens) public view returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            balances[i] = IERC20(tokens[i]).balanceOf(address(this));
        }

        return balances;
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

    // Setter para actualizar la dirección del token USDC
    function setUsdcToken(address _usdcToken) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_usdcToken != address(0), "Invalid address");
        usdcToken = IERC20(_usdcToken);
    }


    function payGame(address _player) external {
        uint256 _price = price;

        require(address(bounty)!=address(0x0),"no Bounty set");
        require(protocol!=address(0x0),"no Protocol set");

        // Verifica que el jugador tenga suficiente saldo
        require(usdcToken.balanceOf(msg.sender) >= _price, "Insufficient USDC balance");

        // Verifica que el jugador haya aprobado el gasto de USDC
        require(usdcToken.allowance(msg.sender, address(this)) >= _price, "USDC allowance insufficient");

        // Realiza el transferFrom
        bool success = usdcToken.transferFrom(msg.sender, address(this), _price);
        require(success, "Transfer failed");
        success = usdcToken.transfer(protocol, (_price*25)/100); // 20% for devs
        require(success, "Transfer failed");
        success = usdcToken.transfer(address(bounty), (_price*75)/100); // 75% for users / 5% to increase treasure
        require(success, "Transfer failed");

        if(hasRole(SERVER_ROLE, msg.sender) && _player != address(0x0)) {
            // allows server to whitelist another user
            whitelist[_player]++;
            emit newPlayer(_player, _price);
        } else {
            whitelist[msg.sender]++;
            emit newPlayer(msg.sender, _price);            
        }

        price = (_price * 105) /100;
    }





    /// @notice Sorts the tokens
    /// @param tokenA The first token
    /// @param tokenB The second token
    /// @return token0 The first token
    /// @return token1 The second token
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        if (tokenA == tokenB) revert();
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        if (token0 == address(0)) revert();
    }

    /// @notice Get the pair address
    /// @param tokenA The first token
    /// @param tokenB The second token
    /// @return pair The pair address
    function uniswapv2PairFor(address tokenA, address tokenB) public pure returns (address pair) {
        address factory = address(0x9fd96203f7b22bCF72d9DCb40ff98302376cE09c);
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex"ff",
                            factory,
                            keccak256(abi.encodePacked(token0, token1)),
                            hex"96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f" // init code hash
                        )
                    )
                )
            )
        );
    }

}