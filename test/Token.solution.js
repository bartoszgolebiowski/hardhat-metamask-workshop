// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We import hardhat to uses ether.js and hardhat helpers fuctions here.
const { ethers } = require("hardhat");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.

/**
 * @typedef {Object} Token
 * ECR20 from https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#ERC20
 * @property {() => Promise<string>} name
 * Returns the name of the token.
 * @property {() => Promise<string>} symbol
 * Returns the symbol of the token, usually a shorter version of the name.
 * @property {() => Promise<number>} decimals
 * Returns the number of decimals used to get its user representation. For example, if decimals equals 2, a balance of 505 tokens should be displayed to a user as 5,05 (505 / 10 ** 2).
 * Tokens usually opt for a value of 18, imitating the relationship between Ether and Wei. This is the value ERC20 uses, unless _setupDecimals is called.
 * @property {() => Promise<number>} totalSupply
 * Returns the amount of tokens in existence.
 * @property {(address: string) => Promise<number>} balanceOf
 * Returns the amount of tokens owned by account.
 * @property {(recipient: string, amount: number)=> Promise<void>} transfer
 * Moves amount tokens from the caller’s account to recipient.
 * Returns a boolean value indicating whether the operation succeeded.
 * Emits a **Transfer** event.
 * @property {(sender:string, recipient: string, amount: number)=> Promise<void>} transferFrom
 * Emits an **Approval** event indicating the updated allowance. This is not required by the EIP. See the note at the beginning of ERC20.
 * Requirements:
 * - sender and recipient cannot be the zero address.
 * - sender must have a balance of at least amount.
 * - the caller must have allowance for sender's tokens of at least amount.
 * @property {(spender: string, amount: number) => Promise<boolean>} approve
 * Sets amount as the allowance of spender over the caller’s tokens.
 * Returns a boolean value indicating whether the operation succeeded.
 * Emits an **Approval** event.
 * @property {(owner: string, spender: string) => Promise<number>} allowance
 * Returns the remaining number of tokens that spender will be allowed to spend on behalf of owner through transferFrom. This is zero by default.
 * This value changes when approve or transferFrom are called.
 * @property {(spender: string, addedValue: number) => Promise<boolean>} increaseAllowance
 * Atomically increases the allowance granted to spender by the caller.
 * This is an alternative to approve that can be used as a mitigation for problems described in IERC20.approve.
 * Emits an **Approval** event indicating the updated allowance.
 * Requirements:
 * - spender cannot be the zero address.
 * @property {(spender: string, subtractedValue: number) => Promise<boolean>} decreaseAllowance
 * Atomically decreases the allowance granted to spender by the caller.
 * This is an alternative to approve that can be used as a mitigation for problems described in IERC20.approve.
 * Emits an **Approval** event indicating the updated allowance.
 * Requirements:
 * - spender cannot be the zero address.
 * - spender must have allowance for the caller of at least subtractedValue.
 * Additional functions
 * @property {() => Promise<string>} owner
 * Returns the address of the current owner.
 * @property {() => Promise<void>} deployed
 * When resolved the contract is deployed.
 * @property {(address: string) => Token} connect
 * Connects a signer to the contract.
 */

describe("Token contract", function () {
  async function deployTokenFixture() {
    // Get the ContractFactory and Signers here.
    const Token = await ethers.getContractFactory("Token");
    const [owner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed()
    /**
     * @type {Token & Awaited<ReturnType<typeof Token.deploy>>}
     *
     */
    const hardhatToken = await Token.deploy(100_000_000_000_000);

    await hardhatToken.deployed();

    // Fixtures can return anything you consider useful for your tests
    return { Token, hardhatToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      // We use loadFixture to setup our environment, and then assert that
      // things went well
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

      // Expect receives a value and wraps it in an assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be
      // equal to our Signer's owner.
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      // Transfer 50 tokens from owner to addr1
      await expect(
        hardhatToken.transfer(addr1.address, 50)
      ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(
        hardhatToken.connect(addr1).transfer(addr2.address, 50)
      ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
    });

    it("should emit Transfer events", async function () {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 50 tokens from owner to addr1
      await expect(hardhatToken.transfer(addr1.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, addr1.address, 50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(addr1.address, addr2.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { hardhatToken, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});
