import { expect } from "chai";
//import { assert } from "console";
import { ethers } from "hardhat";

describe("Token contract", function () {
  let Governance;
  let app;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Governance = await ethers.getContractFactory("Governance");

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    app = await Governance.deploy();
  });

  describe("Governance", function () {
    it("Should create and being writed to map", async function () {
      await app.addVoting("Test1", 10, 30, 70, 1648569500, 1648589500);
      const voting = await app.votings(1);

      expect(voting.title).to.equal("Test1");
      expect(voting.forVoteCount).to.equal(0);
      expect(voting.againstVoteCount).to.equal(0);
      expect(voting.abstainVoteCount).to.equal(0);
      expect(voting.minVotes.toNumber()).to.equal(10);
      expect(voting.rejectPercentageReq.toNumber()).to.equal(30);
      expect(voting.settlementPercentageReq.toNumber()).to.equal(70);
      expect(voting.startTimestamp.toNumber()).to.equal(1648569500);
      expect(voting.endTimestamp.toNumber()).to.equal(1648589500);
    });

    it("Should return access error", async function () {
      await expect(
        app
          .connect(addr1)
          .addVoting("Test1", 10, 30, 70, 1648569500, 1648589500)
      ).to.be.revertedWith("User is not a owner");
    });

    it("Should be able to change vars in voting", async function () {
      await app.addVoting("Test1", 10, 30, 70, 1648569500, 1648589500);

      const changeMinVotes = await app.setMinVotes(1, 20);
      let voting = await app.votings(1);
      expect(voting.minVotes.toNumber()).to.equal(20);

      await app.setRejectedPercReq(1, 20);
      voting = await app.votings(1);
      expect(voting.rejectPercentageReq.toNumber()).to.equal(20);

      await app.setSettlementPercReq(1, 65);
      voting = await app.votings(1);
      expect(voting.settlementPercentageReq.toNumber()).to.equal(65);

      await app.setStarTimestamp(1, 1648569600);
      voting = await app.votings(1);
      expect(voting.startTimestamp.toNumber()).to.equal(1648569600);

      await app.setEndTimestamp(1, 1648589900);
      voting = await app.votings(1);
      expect(voting.endTimestamp.toNumber()).to.equal(1648589900);
    });

    it("Should add vote", async function () {
      await app.addVoting("Test1", 10, 30, 70, 1648569500, 1648589500);
      await app.vote(1);
      let voting = await app.votings(1);

      expect(voting.forVoteCount.toNumber()).to.equal(1);
    });

    it("Should return voting error", async function () {
      await app.addVoting("Test1", 10, 30, 70, 1648569500, 1648589500);
      await app.vote(1);

      await expect(app.vote(1)).to.be.revertedWith("User already voted");
    });

    it("Should return error with wrong id", async function () {
      await app.addVoting("Test1", 10, 30, 70, 1648569500, 1648589500);

      await expect(app.vote(99)).to.be.revertedWith("Voting doesnt exist");
    });
  });
});
