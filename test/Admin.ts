import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Admin", function () {
  const TOKEN_IN = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'
  const TOKEN_OUT = '0x1010101010c209966c08e90e1928a69A9810ebFE'

  async function deployContractsFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const MockSwapExactInputSingle = await ethers.getContractFactory("MockSwapExactInputSingle");
    const mockSwap = await MockSwapExactInputSingle.deploy();
    const Admin = await ethers.getContractFactory("Admin");
    const admin = await Admin.deploy();

    return { owner, otherAccount, mockSwap, admin };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { owner, admin } = await loadFixture(deployContractsFixture);
      expect(await admin.owner()).to.equal(owner.address);
    });
  });

  describe("Bot management", function () {
    it("Should allow owner to add and remove a bot", async function () {
      const { owner, admin, otherAccount } = await loadFixture(deployContractsFixture);

      await admin.connect(owner).addBot(otherAccount.address);
      expect(await admin.bots(otherAccount.address)).to.equal(true);

      await admin.connect(owner).removeBot(otherAccount.address);
      expect(await admin.bots(otherAccount.address)).to.equal(false);
    });

    it("Should not allow non-owner to add or remove a bot", async function () {
      const { admin, otherAccount } = await loadFixture(deployContractsFixture);

      await expect(admin.connect(otherAccount).addBot(otherAccount.address)).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(admin.connect(otherAccount).removeBot(otherAccount.address)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to add and remove multiple bots", async function () {
      const { owner, admin } = await loadFixture(deployContractsFixture);
      const [bot1, bot2, bot3, bot4, bot5] = await ethers.getSigners();  // Obtaining 5 unique addresses from signers

      const botAddresses = [bot1, bot2, bot3, bot4, bot5].map(signer => signer.address);

      await admin.connect(owner).addBots(botAddresses);
      for (const address of botAddresses) {
        expect(await admin.bots(address)).to.equal(true);
      }

      await admin.connect(owner).removeBots(botAddresses);
      for (const address of botAddresses) {
        expect(await admin.bots(address)).to.equal(false);
      }
    });

    it("Should not allow non-owner to add or remove multiple bots", async function () {
      const { admin, otherAccount } = await loadFixture(deployContractsFixture);
      const [bot1, bot2, bot3, bot4, bot5] = await ethers.getSigners();

      const botAddresses = [bot1, bot2, bot3, bot4, bot5].map(signer => signer.address);

      await expect(admin.connect(otherAccount).addBots(botAddresses)).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(admin.connect(otherAccount).removeBots(botAddresses)).to.be.revertedWith("Ownable: caller is not the owner");
    });

  });

  describe("Batch Swap", function () {
    it("Should call swapExactInputSingle with correct arguments on multiple contracts", async function () {
      const { admin, owner } = await loadFixture(deployContractsFixture);

      const [botAccount] = await ethers.getSigners();
      await admin.connect(owner).addBot(botAccount.address);

      const MockSwap = await ethers.getContractFactory("MockSwapExactInputSingle");
      const mockSwap1 = await MockSwap.deploy();
      const mockSwap2 = await MockSwap.deploy();

      const swapsInfo = [
        {
          swapContract: await mockSwap1.getAddress(),
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          amountIn: BigInt(1000),
          gasFee: BigInt(10),
          beepFee: BigInt(10),
        },
        {
          swapContract: await mockSwap2.getAddress(),
          tokenIn: TOKEN_IN,
          tokenOut: TOKEN_OUT,
          amountIn: BigInt(2000),
          gasFee: BigInt(20),
          beepFee: BigInt(20),
        },
      ];

      await admin.connect(botAccount).batchSwap(swapsInfo);

      const swapArguments1 = await mockSwap1.swapArgumentsArray(0);
      const swapArguments2 = await mockSwap2.swapArgumentsArray(0);

      expect(swapArguments1.amountIn).to.equal(swapsInfo[0].amountIn);
      expect(swapArguments2.amountIn).to.equal(swapsInfo[1].amountIn);
    });
  });

  describe("Swap", function () {
    it("Should call swapExactInputSingle with correct arguments", async function () {
      const { mockSwap, admin,owner } = await loadFixture(deployContractsFixture);

      const [botAccount] = await ethers.getSigners();
      await admin.connect(owner).addBot(botAccount.address);

      const swapInfo = {
        swapContract: await mockSwap.getAddress(),
        tokenIn: TOKEN_IN,
        tokenOut: TOKEN_OUT,
        amountIn: BigInt(1000),
        gasFee: BigInt(10),
        beepFee: BigInt(10),
      };

      await admin.swap(
          swapInfo.swapContract,
          swapInfo.tokenIn,
          swapInfo.tokenOut,
          swapInfo.amountIn,
          swapInfo.gasFee,
          swapInfo.beepFee
      );

      const swapArguments = await mockSwap.swapArgumentsArray(0);

      expect(swapArguments.tokenIn).to.equal(swapInfo.tokenIn);
      expect(swapArguments.tokenOut).to.equal(swapInfo.tokenOut);
      expect(swapArguments.amountIn).to.equal(swapInfo.amountIn);
      expect(swapArguments.gasFee).to.equal(swapInfo.gasFee);
      expect(swapArguments.beepFee).to.equal(swapInfo.beepFee);
    });
  });
});
