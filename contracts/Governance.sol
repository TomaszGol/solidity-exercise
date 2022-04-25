//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Governance {
    // Voting model
    struct Voting {
        uint256 id;
        string title;
        uint256 forVoteCount;
        uint256 againstVoteCount;
        uint256 abstainVoteCount;
        uint256 minVotes;
        uint256 rejectPercentageReq;
        uint256 settlementPercentageReq;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }

    struct expiredVoting {
        uint256 id;
        string title;
        uint256 forVoteCount;
        uint256 againstVoteCount;
        uint256 abstainVoteCount;
        uint256 percentageResult;
    }

    address private owner;

    mapping(uint256 => Voting) public votings;

    uint256 public votingCounter;

    mapping(address => bool) public voters;

    mapping(address => bool) whitelist;

    modifier onlyOwner() {
        require(msg.sender == owner, "User is not a owner");
        _;
    }

    modifier isOnWhitelist(address _address) {
        require(whitelist[_address], "You need to be on whitelsit");
        _;
    }

    constructor() {
        owner = msg.sender;
        whitelist[0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266] = true;
        whitelist[0x70997970C51812dc3A010C7d01b50e0d17dc79C8] = true;
        whitelist[0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC] = true;
    }

    function addVoting(
        string memory _title,
        uint256 _minVotes,
        uint256 _rejectPercentageReq,
        uint256 _settlementPercentageReq,
        uint256 _startTimestamp,
        uint256 _endTimestamp
    ) public onlyOwner {
        votingCounter++;
        votings[votingCounter] = Voting(
            votingCounter,
            _title,
            0,
            0,
            0,
            _minVotes,
            _rejectPercentageReq,
            _settlementPercentageReq,
            _startTimestamp,
            _endTimestamp
        );
    }

    function setMinVotes(uint256 _id, uint256 _minVotes) public onlyOwner {
        votings[_id].minVotes = _minVotes;
    }

    function setRejectedPercReq(uint256 _id, uint256 _rejectPercentageReq)
        public
        onlyOwner
    {
        votings[_id].rejectPercentageReq = _rejectPercentageReq;
    }

    function setSettlementPercReq(uint256 _id, uint256 _settlementPercentageReq)
        public
        onlyOwner
    {
        votings[_id].settlementPercentageReq = _settlementPercentageReq;
    }

    function setStarTimestamp(uint256 _id, uint256 _startTimestamp)
        public
        onlyOwner
    {
        votings[_id].startTimestamp = _startTimestamp;
    }

    function setEndTimestamp(uint256 _id, uint256 _endTimestamp)
        public
        onlyOwner
    {
        votings[_id].endTimestamp = _endTimestamp;
    }

    function addUser(address _addressToWhitelist) public onlyOwner {
        whitelist[_addressToWhitelist] = true;
    }

    function vote(uint256 _id) public isOnWhitelist(msg.sender) {
        require(!voters[msg.sender], "User already voted");
        require(_id > 0 && _id <= votingCounter, "Voting doesnt exist");
        require(
            votings[_id].startTimestamp < block.timestamp &&
                votings[_id].endTimestamp > block.timestamp,
            "Voting is not available"
        );
        voters[msg.sender] = true;
        votings[_id].abstainVoteCount++;
    }

    function vote(uint256 _id, bool forOrAgainst)
        public
        isOnWhitelist(msg.sender)
    {
        require(!voters[msg.sender], "User already voted");
        require(_id > 0 && _id <= votingCounter, "Voting doesnt exist");
        require(
            votings[_id].startTimestamp < block.timestamp &&
                votings[_id].endTimestamp > block.timestamp,
            "Voting is not available"
        );
        voters[msg.sender] = true;
        if (forOrAgainst) {
            votings[_id].forVoteCount++;
        } else if (!forOrAgainst) {
            votings[_id].againstVoteCount++;
        }
    }

    function countResult(uint256 _id) public view returns (uint256) {
        uint256 sumOfVotes = votings[_id].forVoteCount +
            votings[_id].againstVoteCount +
            votings[_id].abstainVoteCount;
        return (votings[_id].forVoteCount / sumOfVotes) * 100;
    }

    function summary(uint256 _id) public view returns (bool) {
        console.log("Summary");

        for (uint256 i = 1; i <= votingCounter; i++) {
            if (votings[i].endTimestamp < block.timestamp) {
                // console.log(
                //     votings[i].title + "(xxx) \n votes for: " + votings[i].forVoteCount + "against: " + votings[i].againstVoteCount + "abstain " + votings[i].abstainVoteCount,
                // );
                console.log("${votins[i].title}");
            } else {
                return false;
            }
        }
    }
}
