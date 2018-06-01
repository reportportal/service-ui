export const compareObjectsByKeys = (objectA, objectB, keys) => {
  const comparingCallback = (item) => {
    if (Array.isArray(objectA[item])) {
      const sortedArrayA = objectA[item].sort();
      const sortedArrayB = objectB[item].sort();
      return (
        sortedArrayA.length === sortedArrayB.length &&
        sortedArrayA.every((arrayItem, index) => arrayItem === sortedArrayB[index])
      );
    }
    if (Object.prototype.toString.call(objectA[item]) === '[object Object]') {
      return compareObjectsByKeys(objectA[item], objectB[item], Object.keys(objectA[item]));
    }
    return objectA[item] === objectB[item];
  };
  if (Object.keys(objectA).length === 0 && Object.keys(objectB).length === 0) {
    return true;
  }
  return keys && keys.length > 0 && keys.every(comparingCallback);
};
