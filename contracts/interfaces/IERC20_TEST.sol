// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20_TEST {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool);
}