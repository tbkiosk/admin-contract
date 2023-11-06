// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract MockSwapExactInputSingle {
    struct SwapArguments {
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 gasFee;
        uint256 beepFee;
    }

    SwapArguments[] public swapArgumentsArray;

    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 gasFee,
        uint256 beepFee
    ) external returns (uint256 amountOut) {
        SwapArguments memory newSwapArgs = SwapArguments({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            gasFee: gasFee,
            beepFee: beepFee
        });
        swapArgumentsArray.push(newSwapArgs);
        return amountIn;
    }

    function getSwapArgumentsArrayLength() external view returns (uint256) {
        return swapArgumentsArray.length;
    }

    function getSwapArguments(uint256 index) external view returns (SwapArguments memory) {
        require(index < swapArgumentsArray.length, "Index out of bounds");
        return swapArgumentsArray[index];
    }
}
