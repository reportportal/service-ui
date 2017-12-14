import updateInfo from './signals/updateInfo';

export default {
  state: {
    isLoad: false,
    twits: [],
    twitById: {},
  },
  signals: {
    updateInfo,
  },
};
