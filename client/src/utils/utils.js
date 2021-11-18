export const convertDateToISOString = (date) => {
  if (date === null || !Date.parse(date)) return null;
  return new Date(date).toISOString().replace(/T/, " ").replace(/\..+/, "");
};
