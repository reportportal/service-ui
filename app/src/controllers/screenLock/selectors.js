const screenLockSelector = (state) => state.screenLock || {};
export const screenLockVisibilitySelector = (state) => screenLockSelector(state).visible;
