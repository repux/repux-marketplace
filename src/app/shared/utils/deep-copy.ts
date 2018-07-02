export const deepCopy = (object) => {
  return JSON.parse(JSON.stringify(object));
};
