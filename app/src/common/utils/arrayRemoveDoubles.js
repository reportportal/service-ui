export const arrayRemoveDoubles = (arr) =>
  arr.filter((elem, index, self) => index === self.indexOf(elem));
