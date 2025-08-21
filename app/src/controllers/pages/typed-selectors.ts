type LocationInfo = {
  payload: {
    testCasePageRoute: string | string[];
  };
};

type State = {
  location: LocationInfo;
};

export const locationSelector = (state: State): LocationInfo => state.location;

export const payloadSelector = (state: State): LocationInfo['payload'] =>
  locationSelector(state).payload;

export const urlTestCaseSlugSelector = (state: State): string => {
  const testCasePageRoute = payloadSelector(state).testCasePageRoute;

  if (testCasePageRoute && typeof testCasePageRoute === 'string') {
    return testCasePageRoute.split('/')[3];
  } else if (Array.isArray(testCasePageRoute)) {
    return testCasePageRoute?.[3];
  }

  return '';
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
