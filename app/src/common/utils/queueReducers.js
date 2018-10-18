export const queueReducers = (...reducers) => (state, action) =>
  reducers.reduce((s, reducer) => reducer(s, action), state);
