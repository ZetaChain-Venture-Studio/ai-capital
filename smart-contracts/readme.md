# AIC Smart Contract Documentation

## Overview

The AIC contract facilitates token swaps between USDC and USDT using the Izumi router. Players can participate in games by paying a specified price in USDC. The contract manages user whitelisting, fee settings, and token balances.

## Contract Addresses

- **AIC Contract:** `0xbe95807Bc4923664DdDE3a8bC653F8bc9D37F441`
- **USDC Contract:** `0x020B5D3da45c46F0b38B2B43DE7B552771385f8F`
- **USDT Contract:** `0xe3b5f5ac71e00252118BB76Ef67996F62c98AB5d`
- **Izumi Router Contract:** `0x34bc1b87f60e0a30c0e24FD7Abada70436c71406`

## Frontend Interaction

1. **Get Current Price:**
   - Call `price()` from the AIC contract.

2. **Participate in the Game:**
   - a. Approve the contract to spend USDC:
     ```solidity
     approve(AIC_contract, price);
     ```
   - b. Call `payGame()` to whitelist the user.
   - c. Send a request to the backend to process the game move.
   - d. Provide the following information to the backend:
     - `address _user` (the player)
     - `address tokenA` (the token to sell)
     - `address tokenB` (the token to buy)
     - `uint256 percent` (percentage of tokenA to sell)

## Backend Processing

1. **Check Whitelisted Status:**
   - Call `whitelist(user)` to determine if the user is whitelisted.

2. **Process Game Move:**
   - If the user loses, call:
     ```solidity
     deWhitelist(address _user);
     ```
   - If the user wins, call:
     ```solidity
     _swapTokens(address _user, address tokenA, address tokenB, uint256 percent);
     ```
   - **Parameters:**
     - `user`: The whitelisted player.
     - `tokenA`: The token to sell (must be in the contract).
     - `tokenB`: The token to buy (must be in the whitelist).
     - `percent`: A value between 0 and 100 indicating the percentage of tokenA to sell.

## Token Distribution

- **75%** goes to the bounty.
- **20%** goes to developers (protocol).
- **5%** is allocated for increasing the treasure.

## Important Notes

- Both tokens (USDC and USDT) support minting. You can mint tokens directly on BlockScout by connecting your wallet, specifying the mint address and amount.
- The token pair is configured within the Izumi swap contract. You can add liquidity or test swaps directly from Izumi.
- The contract currently does not distribute the pool.

## Event Emission

- **FeeSet**: Emits events when the fee between two tokens is set.
- **newPlayer**: Emits events when a new player participates in the game.

## Roles

- **SERVER_ROLE**: Allows server operations.
- **TREASURE_ROLE**: Allows treasury-related actions.
- **DEFAULT_ADMIN_ROLE**: Grants administrative privileges.