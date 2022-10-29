const { expect } = require("chai");

require("@nomicfoundation/hardhat-chai-matchers");

describe.skip('hardhat-chai-matchers")', () => {
  describe("Events", () => {
    it("should emit SAMPLE event without argument", async () => {
      expect(contract.call()).to.emit(contract, "SAMPLE");
    });

    it("should emit SAMPLE event with argument", async () => {
      expect(contract.call()).to.emit(contract, "SAMPLE").withArgs("arg");
    });
  });

  describe("Reverts", () => {
    it("should revert", async () => {
      expect(contract.call()).to.be.reverted;
    });

    it("should revert with message", async () => {
      expect(contract.call()).to.be.revertedWith("message");
    });
  });

  describe("Balances", () => {
    it("should send transaction", async () => {
      await expect(() =>
        sender.sendTransaction({ to: someAddress, value: 200 })
      ).to.changeEtherBalance(sender, "-200");

      await expect(token.transfer(account, 1)).to.changeTokenBalance(
        token,
        account,
        1
      );
    });

    it("should send transaction extended", async () => {
      await expect(() =>
        sender.sendTransaction({ to: receiver, value: 200 })
      ).to.changeEtherBalances([sender, receiver], [-200, 200]);

      await expect(
        token.transferFrom(sender, receiver, 1)
      ).to.changeTokenBalances(token, [sender, receiver], [-1, 1]);
    });
  });
});

// Docs https://hardhat.org/hardhat-chai-matchers/docs/overview
