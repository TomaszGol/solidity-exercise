//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Governance {
    // Voting model
    struct Voting {
        uint256 id;
        string title;
        uint256 voteCount;
        uint256 minVotes;
        uint256 rejectPercentageReq;
        uint256 settlementPercentageReq;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }

    mapping(uint256 => Voting) public votings;

    uint256 public votingCounter;

    mapping(address => bool) public voters;

    constructor() {}

    function addVoting(
        string memory _title,
        uint256 _minVotes,
        uint256 _rejectPercentageReq,
        uint256 _settlementPercentageReq,
        uint256 _startTimestamp,
        uint256 _endTimestamp
    ) public {
        votingCounter++;
        votings[votingCounter] = Voting(
            votingCounter,
            _title,
            0,
            _minVotes,
            _rejectPercentageReq,
            _settlementPercentageReq,
            _startTimestamp,
            _endTimestamp
        );
    }

    function setMinVotes(uint256 _id, uint256 _minVotes) public {
        votings[_id].minVotes = _minVotes;
    }

    function setRejectedPercReq(uint256 _id, uint256 _rejectPercentageReq)
        public
    {
        votings[_id].rejectPercentageReq = _rejectPercentageReq;
    }

    function setSettlementPercReq(uint256 _id, uint256 _settlementPercentageReq)
        public
    {
        votings[_id].settlementPercentageReq = _settlementPercentageReq;
    }

    function setStarTimestamp(uint256 _id, uint256 _startTimestamp) public {
        votings[_id].startTimestamp = _startTimestamp;
    }

    function setEndTimestamp(uint256 _id, uint256 _endTimestamp) public {
        votings[_id].endTimestamp = _endTimestamp;
    }
}
