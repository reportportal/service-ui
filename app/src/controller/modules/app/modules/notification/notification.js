import { Module } from 'cerebral';
import showMessage from './signals/showMessage';

export default Module({
  state: {
    currentMessage: '',
    currentType: '',
    stack: [],
  },
  signals: {
    showMessage,
  },
});
