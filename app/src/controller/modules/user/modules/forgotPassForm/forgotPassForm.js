export default {
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
};
