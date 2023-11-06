// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";

interface ISwapExactInputSingle {
    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 gasFee,
        uint256 beepFee
    ) external returns (uint256 amountOut);
}

contract Admin is Ownable {
    mapping(address => bool) public bots;

    modifier onlyBots() {
        require(bots[msg.sender], "Not a registered bot");
        _;
    }

    struct SwapInfo {
        address swapContract;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 gasFee;
        uint256 beepFee;
    }

    function addBot(address botAddress) external onlyOwner {
        bots[botAddress] = true;
    }

    function addBots(address[] calldata botAddresses) external onlyOwner {
        for (uint i = 0; i < botAddresses.length; i++) {
            bots[botAddresses[i]] = true;
        }
    }

    function removeBot(address botAddress) external onlyOwner {
        bots[botAddress] = false;
    }

    function removeBots(address[] calldata botAddresses) external onlyOwner {
        for (uint i = 0; i < botAddresses.length; i++) {
            bots[botAddresses[i]] = false;
        }
    }

    function batchSwap(SwapInfo[] memory swaps) external onlyBots {
        for (uint i = 0; i < swaps.length; i++) {
            ISwapExactInputSingle(swaps[i].swapContract).swapExactInputSingle(
                swaps[i].tokenIn,
                swaps[i].tokenOut,
                swaps[i].amountIn,
                swaps[i].gasFee,
                swaps[i].beepFee
            );
        }
    }

    function swap(
        address swapContract,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 gasFee,
        uint256 beepFee
    ) external onlyBots returns (uint256 amountOut) {
        return
            ISwapExactInputSingle(swapContract).swapExactInputSingle(
                tokenIn,
                tokenOut,
                amountIn,
                gasFee,
                beepFee
            );
    }
}
