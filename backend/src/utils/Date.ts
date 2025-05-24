const now = new Date();

export const oneYearFromNow = () => {
  return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
};
export const thirtyDaysFromNow = () => {
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
};
export const fifteenMinutesFromNow = () => {
  return new Date(now.getTime() + 15 * 60 * 1000);
};
