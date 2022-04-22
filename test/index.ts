import { expect } from "chai";
//import { assert } from "console";
import { ethers } from "hardhat";

describe("Governance", function () {
  it("Voting should create and being writed to map", async function () {
    const Governance = await ethers.getContractFactory("Governance");
    const app = await Governance.deploy();
    await app.addVoting("Test1", 10, 30, 70, 1648569500, 1648589500);
    // console.log(app.votings[1]);
    const voting = await app.votings(1);
    expect(voting.title).to.equal("Test1");
    expect(voting.minVotes.toNumber()).to.equal(10);
    expect(voting.rejectPercentageReq.toNumber()).to.equal(30);
    expect(voting.settlementPercentageReq.toNumber()).to.equal(70);
    expect(voting.startTimestamp.toNumber()).to.equal(1648569500);
    expect(voting.endTimestamp.toNumber()).to.equal(1648589500);
  });
});
