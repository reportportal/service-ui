import { Module } from 'cerebral';

export default Module({
  state: {
    login: {
      value: '',
      defaultValue: '',
      isRequired: true,
      validationRules: ['minLength:3'],
      errorMessage: 'must contain at least 3 characters',
    },
    password: {
      value: '',
      defaultValue: '',
      isRequired: true,
      validationRules: ['minLength:3'],
      errorMessage: 'must contain at least 3 characters',
    },
    isLoad: false,
    isValid: true,
  },
  signals: {
  },
});
