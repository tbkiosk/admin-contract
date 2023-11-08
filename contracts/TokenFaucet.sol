// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFaucet is Ownable {
    IERC20 public activeToken;
    uint256 public amount;

    constructor() {}

    function setActiveToken(address tokenAddress) external onlyOwner {
        require(tokenAddress != address(0), "Token address cannot be the zero address.");
        activeToken = IERC20(tokenAddress);
    }

    function setAmount(uint256 newAmount) external onlyOwner {
        require(newAmount > 0, "Amount must be greater than 0.");
        amount = newAmount;
    }

    function withdraw() external {
        require(address(activeToken) != address(0), "Active token has not been set.");
        require(amount > 0, "Withdraw amount has not been set.");
        require(activeToken.balanceOf(address(this)) >= amount, "Insufficient token balance in faucet.");

        activeToken.transfer(msg.sender, amount);
    }
}
