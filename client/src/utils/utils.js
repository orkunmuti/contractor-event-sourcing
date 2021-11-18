export const convertDateToISOString = (date) => {
  if (date === null) return null;
  return new Date(date).toISOString().replace(/T/, " ").replace(/\..+/, "");
};
