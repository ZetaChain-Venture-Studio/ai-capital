# Deployed Contracts on ZetaChain Testnet

- **USDC Contract**: `0x0d4E00eba0FC6435E0301E35b03845bAdf2921b4`
- **Pepe Contract**: `0xf63fC04B0e424787d2e66867B869E649b5Aa9308`
- **AIC Contract**: `0x2dEcadD1A99cDf1daD617F18c41e9c4690F9F920`
- **Bounty Contract**: `0x8F067fa5DCC632816ae557EA7590A100Ca986d28`

> **Note**: You can interact with these contracts via BlockScout.

---

# Usage Instructions

## Frontend

1. Call the following method on the **USDC Contract**:
   `approve(aic_contract, amount);`

2. Then, invoke the following method:  
   `payGame(address _player);`

   - **_player**: The address of the user participating in the game.  

     > Note: This value is currently ignored; we will implement a function overload to eliminate the need to pass parameters.

   ### This function performs the following actions:
   - Increases the whitelist count for the user to enable them to play.
   - Charges the price in USDC.
   - Transfers 75% of the USDC to the **Bounty Contract** and 25% to a wallet known as "protocol".
   - Increases the price by 5% for the next purchase.

3. Sends the prompt and user data along with the swap information to the backend.
(address _user, address tokenA, address tokenB, prompt)


## Backend

1. Call `whitelist(address user)` to check if the user is whitelisted.
2. Process the prompt and determine whether the user has won or lost.
3. If the user **wins**, call:  
   `swapTokens(address _user, address tokenA, address tokenB);`  

   - **_user**: The winning user.  
   - **tokenA**: USDC Contract.  
   - **tokenB**: Pepe Contract.

   ### This function will:
   - Execute a swap using Uniswap V2 deployed on ZetaChain.
   - Decrease the whitelist count for the user.
   - Emit the event:  
     `winner(_user, tokenA, tokenB, amountIn, amounts[path.length - 1], block.timestamp);`  

     - **_user**: Serves as a topic for searches if needed.
   - Distribute the bounty.

4. If the user **loses**, call:  
   `deWhitelist(address _user);`  

   - **_user**: The address of the user who lost.

---

# Additional Notes

### Function Overloading in `swapTokens()`
The overloaded version of `swapTokens()` includes a boolean parameter designed for routing from **tokenA** to **tokenB** through **WZeta**. This manual routing is necessary due to the absence of automatic routing. Observing that all tokens interact with Zeta in Eddy Finance, this method was implemented to streamline the routing process, avoiding the need to handle it in the backend or frontend.

### Function Overloading in `payGame()`
The purpose of overloading `payGame()` is to separate the user from the payer. Currently, this is set up only for the backend and is intended for scenarios such as gasless payments for users (though requiring prior approval for USDC transfers). With account abstraction, we could provide initial Zeta for covering the approval function and subsequently use USDC calling it from the backend.

### Bounty Wallet
The **Bounty Wallet** is generated from the smart contract (AIC.sol) and is beyond manual control, as the contract manages it. This design ensures legitimacy, guaranteeing that the bounty will not be retained by any individual. The wallet is created by the AIC contract itself.

### Eddy Finance
Upon reviewing the contract, I discovered that they are simply using Uniswap deployed on ZetaChain. However, prior to that, they are wrapping it and charging fees. For now, I can avoid those fees. If we decide to implement cross-chain functionality with their swap, we may need to use them later, but if we are using the gateway ourselves, there is no need to pay them for gas.