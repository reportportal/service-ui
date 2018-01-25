import { Module } from 'cerebral';

export default Module({
  state: {
    login: {
      value: '',
      defaultValue: '',
      isRequired: true,
      forceInvalid: false,
      validationRules: [
        /^[0-9a-zA-Z-_.]{1,128}$/,
        'minLength:1',
        'maxLength:128',
      ],
      errorMessageId: 'loginHint',
    },
    password: {
      value: '',
      defaultValue: '',
      isRequired: true,
      forceInvalid: false,
      validationRules: [
        /^(.){4,25}$/,
        'minLength:4',
        'maxLength:25',
      ],
      errorMessageId: 'passwordHint',
    },
    isLoad: false,
    isValid: true,
  },
  signals: {
  },
});
