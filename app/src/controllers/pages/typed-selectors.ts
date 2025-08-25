import { isString } from 'lodash';

type LocationInfo = {
  payload: {
    testCasePageRoute: string | string[];
  };
};

type State = {
  location: LocationInfo;
};

export const locationSelector = (state: State) => state.location;

export const payloadSelector = (state: State) => locationSelector(state).payload;

export const urlTestCaseSlugSelector = (state: State): string => {
  const testCasePageRoute = payloadSelector(state).testCasePageRoute;
  let testCaseId: string | undefined;

  if (testCasePageRoute && isString(testCasePageRoute)) {
    testCaseId = testCasePageRoute.split('/')[3];
  } else if (Array.isArray(testCasePageRoute)) {
    testCaseId = testCasePageRoute?.[3];
  }

  return isString(testCaseId) ? testCaseId : '';
};

export const urlFolderIdSelector = (state: State): string => {
  const testCasePageRoute = payloadSelector(state).testCasePageRoute || '';

  if (testCasePageRoute && typeof testCasePageRoute === 'string') {
    return testCasePageRoute.split('/')[1];
  } else if (Array.isArray(testCasePageRoute)) {
    return testCasePageRoute?.[1];
  }

  return '';
};
