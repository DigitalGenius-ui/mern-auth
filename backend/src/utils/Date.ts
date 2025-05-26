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
export const ON_DAY_MS = () => 24 * 60 * 60 * 1000;
export const fiveMinutesAgo = () => new Date(now.getTime() - 5 * 60 * 1000);
export const oneHoureFromNow = () => new Date(now.getTime() + 60 * 60 * 1000);
