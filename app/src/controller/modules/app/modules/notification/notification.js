import showMessage from './signals/showMessage';

export default {
  state: {
    currentMessage: '',
    currentType: '',
    stack: [],
  },
  signals: {
    showMessage,
  },
};
