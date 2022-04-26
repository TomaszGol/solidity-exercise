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
    it("Should create and being writed to map", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );
      const voting = await app.votings(1);

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

    it("Should be able to change vars in voting", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );

      await app.setMinVotes(1, 20);
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

    it("Should return voting not availavle error", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        1648589500
      );

      await expect(app["vote(uint256)"](1)).to.be.revertedWith(
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

      await expect(
        app.connect(addrs[4])["vote(uint256)"](1)
      ).to.be.revertedWith("You need to be on whitelsit");
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
      await app["vote(uint256)"](1);

      let voting = await app.votings(1);

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
      await app["vote(uint256,bool)"](1, true);
      let voting = await app.votings(1);

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
      await app["vote(uint256,bool)"](1, false);
      let voting = await app.votings(1);

      expect(voting.againstVoteCount.toNumber()).to.equal(1);
    });

    it("Should return voting error", async function () {
      await app.addVoting(
        votingName,
        minVotes,
        rejectPercentageReq,
        settlementPercentageReq,
        startTimestamp,
        endTimestamp
      );
      await app["vote(uint256)"](1);

      await expect(app["vote(uint256)"](1)).to.be.revertedWith(
        "User already voted"
      );
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

      await expect(app["vote(uint256)"](99)).to.be.revertedWith(
        "Voting doesnt exist"
      );
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
      await app.addVoting("Test2", 5, 25, 75, startTimestamp, 1648589500);
      await app.forVoteCount(2, 20);
      await app.againstVoteCount(2, 2);

      await app.addVoting("Test3", 5, 25, 75, startTimestamp, 1648589500);
      await app.forVoteCount(3, 2);
      await app.againstVoteCount(3, 20);

      await app.addVoting("Test4", 5, 25, 75, startTimestamp, endTimestamp);

      await app.addVoting("Test5", 5, 25, 75, startTimestamp, 1648589500);
      await app.forVoteCount(5, 10);
      await app.againstVoteCount(5, 10);
      await app.againstVoteCount(5, 20);

      await app.result();

      let expiredVoting2 = await app.expiredVotings(2);
      let expiredVoting3 = await app.expiredVotings(3);
      let expiredVoting5 = await app.expiredVotings(5);
      expect(expiredVoting2.result).to.equal("Adopted");
      expect(expiredVoting3.result).to.equal("Rejected");
      expect(expiredVoting5.result).to.equal("Unresolved");
      // Check for '4' that wasn't expired
      let expiredVoting4 = await app.expiredVotings(4);
      expect(expiredVoting4.result).to.equal("");
    });
  });
});
