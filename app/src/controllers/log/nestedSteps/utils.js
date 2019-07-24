import { isEmptyObject } from 'common/utils';

export const isLoadMoreButtonVisible = (step) => {
  if (!step || isEmptyObject(step.page)) {
    return false;
  }
  const {
    page: { totalElements, size },
  } = step;
  return totalElements > size;
};
