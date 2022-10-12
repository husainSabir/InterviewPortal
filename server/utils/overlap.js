const isOverlaps = (
    interviewStartTime,
    interviewEndTime,
    myStartTime,
    myEndTime
  ) => {
    return Math.max(myStartTime, interviewStartTime) <= Math.min(myEndTime, interviewEndTime)
  };
  
  module.exports = isOverlaps;