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

  const votingName = "Test1";
  const minVotes = 10;
  const rejectPercentageReq = 30;
  const settlementPercentageReq = 70;
  const startTimestamp = 1648569500;
  const endTimestamp = 1653238800;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Governance = await ethers.getContractFactory("Governance");

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    app = await Governance.deploy();
  });

  describe("Governance", function () {
    it("Should create and be writed to map", async function () {
      const beforeAddCounter = await app.votingCounter();

      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );
      const afterAddCounter = await app.votingCounter();

      const voting = await app.votings(0);

      expect(beforeAddCounter.toNumber() + 1).to.equal(
        afterAddCounter.toNumber()
      );
      expect(voting.title).to.equal("Test1");
      expect(voting.forVoteCount).to.equal(0);
      expect(voting.againstVoteCount).to.equal(0);
      expect(voting.abstainVoteCount).to.equal(0);
      expect(voting.minVotes.toNumber()).to.equal(10);
      expect(voting.rejectPercentageReq.toNumber()).to.equal(30);
      expect(voting.settlementPercentageReq.toNumber()).to.equal(70);
      expect(voting.startTimestamp.toNumber()).to.equal(1648569500);
      expect(voting.endTimestamp.toNumber()).to.equal(1653238800);
    });

    it("Should return access error", async function () {
      await expect(
        app
          .connect(addr1)
          .addVoting(
            votingName,
            minVotes,
            rejectPercentageReq,
            settlementPercentageReq,
            startTimestamp,
            endTimestamp
          )
      ).to.be.revertedWith("User is not a owner");
    });

    it("Should set minVotes", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.setMinVotes(0, 20);
      let voting = await app.votings(0);
      expect(voting.minVotes.toNumber()).to.equal(20);
    });

    it("Should set setRejectedPercReq", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.setRejectedPercReq(0, 20);
      let voting = await app.votings(0);
      expect(voting.rejectPercentageReq.toNumber()).to.equal(20);
    });

    it("Should set settlementPercentageReq", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.setSettlementPercReq(0, 65);
      let voting = await app.votings(0);
      expect(voting.settlementPercentageReq.toNumber()).to.equal(65);
    });

    it("Should set startTimestamp", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.setStarTimestamp(0, 1648569600);
      let voting = await app.votings(0);
      expect(voting.startTimestamp.toNumber()).to.equal(1648569600);
    });

    it("Should set endTimestamp", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.setEndTimestamp(0, 1648589900);
      let voting = await app.votings(0);
      expect(voting.endTimestamp.toNumber()).to.equal(1648589900);
    });

    it("Should return voting not available error", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        1648589500
      );

      await expect(app.vote(0, 0)).to.be.revertedWith(
        "Voting is not available"
      );
    });

    it("Should return not whitelisted error", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await expect(app.connect(addrs[4]).vote(1, 0)).to.be.revertedWith(
        "You need to be on whitelsit"
      );
    });

    it("Should add abstain vote", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );
      await app.vote(0, 2);
      let voting = await app.votings(0);

      expect(voting.abstainVoteCount.toNumber()).to.equal(1);
    });

    it("Should add for vote", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );
      await app.vote(0, 0);
      let voting = await app.votings(0);

      expect(voting.forVoteCount.toNumber()).to.equal(1);
    });

    it("Should add against vote", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );
      await app.vote(0, 1);
      let voting = await app.votings(0);

      expect(voting.againstVoteCount.toNumber()).to.equal(1);
    });

    it("Should return user already voted", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );
      await app.vote(0, 2);

      await expect(app.vote(0, 1)).to.be.revertedWith("User already voted");
    });

    it("Should return error with wrong id", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await expect(app.vote(99, 0)).to.be.revertedWith("Voting doesnt exist");
    });

    it("Should return result of accepted voting", async function () {
      await app.addVoting(
        votingName,
        1,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.vote(0, 0);
      await app.setEndTimestamp(0, 1648589500);
      await app.getResultById(0);

      let expiredVoting = await app.expiredVotings(0);

      expect(expiredVoting.result).to.equal("Accepted");
    });

    it("Should return result of rejected voting", async function () {
      await app.addVoting(
        votingName,
        1,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.vote(0, 1);
      await app.setEndTimestamp(0, 1648589500);
      await app.getResultById(0);

      let expiredVoting = await app.expiredVotings(0);

      expect(expiredVoting.result).to.equal("Rejected");
    });

    it("Should return result of unresolved voting", async function () {
      await app.addVoting(
        votingName,
        1,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.vote(0, 1);
      await app.connect(addr1).vote(0, 0);
      await app.setEndTimestamp(0, 1648589500);
      await app.getResultById(0);

      let expiredVoting = await app.expiredVotings(0);

      expect(expiredVoting.result).to.equal("Unresolved");
    });

    it("Should add expired votings to summary list", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );
      await app.addVoting("Test2", 1, 25, 75, startTimestamp, endTimestamp);

      await app.vote(1, 0);
      await app.setEndTimestamp(1, 1648589500);

      await app.addVoting("Test3", 1, 25, 75, startTimestamp, endTimestamp);
      await app.vote(2, 1);
      await app.setEndTimestamp(2, 1648589500);

      await app.addVoting("Test4", 1, 25, 75, startTimestamp, endTimestamp);

      await app.addVoting("Test5", 1, 25, 75, startTimestamp, endTimestamp);
      await app.vote(4, 1);
      await app.connect(addr1).vote(4, 0);
      await app.connect(addr2).vote(4, 2);
      await app.setEndTimestamp(4, 1648589500);

      await app.getResult();

      let expiredVoting2 = await app.expiredVotings(1);
      let expiredVoting3 = await app.expiredVotings(2);
      let expiredVoting5 = await app.expiredVotings(4);
      expect(expiredVoting2.result).to.equal("Accepted");
      expect(expiredVoting3.result).to.equal("Rejected");
      expect(expiredVoting5.result).to.equal("Unresolved");
      // Check for '4' that wasn't expired
      let expiredVoting4 = await app.expiredVotings(3);
      expect(expiredVoting4.result).to.equal("");
    });
  });
});
