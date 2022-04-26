//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Governance {
    enum VoteOptions {
        FOR,
        AGAINST,
        ABSTAIN
    }

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
        mapping(address => bool) voters;
    }

    struct ExpiredVoting {
        uint256 id;
        string title;
        uint256 forVoteCount;
        uint256 againstVoteCount;
        uint256 abstainVoteCount;
        uint256 percentageResult;
        string result;
    }

    address private owner;

    mapping(uint256 => Voting) public votings;

    mapping(uint256 => ExpiredVoting) public expiredVotings;

    uint256 public votingCounter;

    mapping(address => bool) private whitelist;

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
        seed();
    }

    function seed() private {
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
        Voting storage vot = votings[votingCounter];
        vot.id = votingCounter;
        vot.title = _title;
        vot.forVoteCount = 0;
        vot.againstVoteCount = 0;
        vot.abstainVoteCount = 0;
        vot.minVotes = _minVotes;
        vot.rejectPercentageReq = _rejectPercentageReq;
        vot.settlementPercentageReq = _settlementPercentageReq;
        vot.startTimestamp = _startTimestamp;
        vot.endTimestamp = _endTimestamp;
        votingCounter++;
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

    function vote(uint256 _id, VoteOptions option)
        public
        isOnWhitelist(msg.sender)
    {
        require(!votings[_id].voters[msg.sender], "User already voted");
        require(_id >= 0 && _id < votingCounter, "Voting doesnt exist");
        require(
            votings[_id].startTimestamp < block.timestamp &&
                votings[_id].endTimestamp > block.timestamp,
            "Voting is not available"
        );
        votings[_id].voters[msg.sender] = true;
        if (option == VoteOptions.FOR) {
            increaseForVote(_id);
        } else if (option == VoteOptions.AGAINST) {
            increaseAgainstVote(_id);
        } else {
            increaseAbstainVote(_id);
        }
    }

    function increaseForVote(uint256 _id) private {
        votings[_id].forVoteCount++;
    }

    function increaseAgainstVote(uint256 _id) private {
        votings[_id].againstVoteCount++;
    }

    function increaseAbstainVote(uint256 _id) private {
        votings[_id].abstainVoteCount++;
    }

    function getSumOfVotes(uint256 _id) private view returns (uint256) {
        uint256 sum = votings[_id].forVoteCount +
            votings[_id].againstVoteCount +
            votings[_id].abstainVoteCount;
        return sum;
    }

    function countResult(uint256 _id) private view returns (uint256) {
        uint256 sumOfVotes = getSumOfVotes(_id);
        return ((votings[_id].forVoteCount * 100) / sumOfVotes);
    }

    function getResult() public {
        for (uint256 _id = 0; _id < votingCounter; _id++) {
            getResultById(_id);
        }
    }

    function getResultById(uint256 _id) public {
        if (votings[_id].endTimestamp < block.timestamp) {
            if (votings[_id].minVotes <= getSumOfVotes(_id)) {
                uint256 votingResult = countResult(_id);
                string memory result;
                if (votingResult > votings[_id].settlementPercentageReq) {
                    result = "Accepted";
                } else if (votingResult < votings[_id].rejectPercentageReq) {
                    result = "Rejected";
                } else {
                    result = "Unresolved";
                }
                expiredVotings[_id] = ExpiredVoting(
                    _id,
                    votings[_id].title,
                    votings[_id].forVoteCount,
                    votings[_id].againstVoteCount,
                    votings[_id].abstainVoteCount,
                    votingResult,
                    result
                );
            }
        }
    }
}
