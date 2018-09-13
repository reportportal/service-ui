export const omit = (object = {}, keys = []) =>
  Object.keys(object).reduce(
    (acc, key) => (keys.indexOf(key) === -1 ? { ...acc, [key]: object[key] } : acc),
    {},
  );
