import { isEmptyObject } from 'common/utils';

export const isLoadMoreButton = (step) => {
  if (!step || isEmptyObject(step.page)) {
    return false;
  }
  const {
    page: { totalElements, size },
  } = step;
  return totalElements > size;
};
