import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("TokenFaucet", function () {
    async function deployContractsFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const usdcFactory = await ethers.getContractFactory("USDC");
        const usdc = await usdcFactory.deploy();
        const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
        const tokenFaucet = await TokenFaucet.deploy();

        const tokenFaucetAddress = await tokenFaucet.getAddress();
        const usdcAddress = await usdc.getAddress();
        await usdc.transfer(tokenFaucetAddress, 1_000_000);

        return { owner, otherAccount, usdc, tokenFaucet, usdcAddress };
    }

    it('should set active token', async () => {
        const { owner, otherAccount, usdc, tokenFaucet, usdcAddress } = await loadFixture(deployContractsFixture);
        await tokenFaucet.connect(owner).setActiveToken(usdcAddress);
        expect(await tokenFaucet.activeToken()).to.equal(usdcAddress);
    })

    it('should set token amount', async () => {
        const { owner, otherAccount, usdc, tokenFaucet, usdcAddress } = await loadFixture(deployContractsFixture);
        await tokenFaucet.connect(owner).setAmount(500);
        expect(await tokenFaucet.amount()).to.equal(500);
    })

    it('should withdraw', async () => {
        const { owner, otherAccount, usdc, tokenFaucet, usdcAddress } = await loadFixture(deployContractsFixture);
        await tokenFaucet.connect(owner).setActiveToken(usdcAddress);
        await tokenFaucet.connect(owner).setAmount(500);

        const originalBalance = await usdc.balanceOf(otherAccount.address);
        await tokenFaucet.connect(otherAccount).withdraw();
        const newBalance = await usdc.balanceOf(otherAccount.address);

        expect(newBalance).to.equal(originalBalance + BigInt(500));
    })
});
