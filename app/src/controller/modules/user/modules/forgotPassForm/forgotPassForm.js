import { Module } from 'cerebral';

export default Module({
  state: {
    email: {
      value: '',
      defaultValue: '',
      isRequired: true,
      validationRules: ['isEmail'],
      errorMessage: 'enter valid email',
    },
    isLoad: false,
    isValid: true,
  },
  signals: {
  },
});
