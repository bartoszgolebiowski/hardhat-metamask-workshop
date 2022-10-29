//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    // An address type variable is used to store ethereum accounts.
    address public owner;

    constructor(uint256 initialSupply) public ERC20("TTPSC", "TT") {
        _mint(msg.sender, initialSupply);
        owner = msg.sender;
    }
}
