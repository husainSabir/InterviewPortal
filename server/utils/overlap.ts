const isOverlaps = (
  interviewStartTime: Date,
  interviewEndTime: Date,
  myStartTime: Date,
  myEndTime: Date
): boolean => {
  return (
    Math.max(myStartTime.getTime(), interviewStartTime.getTime()) <=
    Math.min(myEndTime.getTime(), interviewEndTime.getTime())
  );
};

export default isOverlaps;


