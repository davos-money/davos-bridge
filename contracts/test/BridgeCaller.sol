// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../interfaces/IDavosBridge.sol";
import "../interfaces/IERC20_TEST.sol";


contract BridgeCaller {
    IDavosBridge private bridgeDeposit;
    IDavosBridge private bridgeWithdraw;

    constructor(address _bridgeDeposit, address _bridgeWithdraw) {
        require(_bridgeDeposit != address(0), "Invalid contract address");
        bridgeDeposit = IDavosBridge(_bridgeDeposit);
        bridgeWithdraw = IDavosBridge(_bridgeWithdraw);
    }

    function bridgeTokens(address fromToken, uint256 toChain, address[] calldata toAddress, uint256[] calldata amounts) external {
        require(toAddress.length == amounts.length, "toAddress and amounts length mismatch");

        uint256 totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        IERC20_TEST token = IERC20_TEST(fromToken);
        require(token.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");
        require(token.increaseAllowance(address(bridgeDeposit), totalAmount), "Allowance increase failed");

        for (uint256 i = 0; i < toAddress.length; i++) {
            bridgeDeposit.depositToken(fromToken, toChain, toAddress[i], amounts[i]);
        }
    }

    function withdrawTokens(bytes[] calldata encodedProofs, bytes[] calldata rawReceipts, bytes[] memory proofSignatures) external {
        require(encodedProofs.length == rawReceipts.length && rawReceipts.length == proofSignatures.length, "Array lengths must be equal");

        for (uint i = 0; i < encodedProofs.length; i++) {
            bridgeWithdraw.withdraw(encodedProofs[i], rawReceipts[i], proofSignatures[i]);
        }
    }

}
