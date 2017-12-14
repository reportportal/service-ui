import submitForm from './signals/submitForm';

export default {
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
    submitForm,
  },
};
