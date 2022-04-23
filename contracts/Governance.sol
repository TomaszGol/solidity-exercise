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

    address private owner;

    mapping(uint256 => Voting) public votings;

    uint256 public votingCounter;

    mapping(address => bool) public voters;

    modifier onlyOwner() {
        require(msg.sender == owner, "User is not a owner");
        _;
    }

    constructor() {
        owner = msg.sender;
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

    function vote(uint256 _id) public {
        require(!voters[msg.sender], "User already voted");
        // require(
        //     votings[_id].startTimestamp < block.timestamp &&
        //         votings[_id].endTimestamp > block.timestamp,
        //     "Voting is not available"
        // );
        require(_id > 0 && _id <= votingCounter, "Voting doesnt exist");
        voters[msg.sender] = true;
        if (true) {
            votings[_id].forVoteCount++;
        } else if (false) {
            votings[_id].againstVoteCount++;
        } else {
            votings[_id].abstainVoteCount++;
        }
    }

    function countResult(uint256 _id) public view returns (uint256) {
        uint256 sumOfVotes = votings[_id].forVoteCount +
            votings[_id].againstVoteCount +
            votings[_id].abstainVoteCount;
        return (votings[_id].forVoteCount / sumOfVotes) * 100;
    }
}
