import { isValidForm, resetForm } from '@cerebral/forms/operators';
import { state } from 'cerebral/tags';
import getToken from '../modules/loginForm/actions/getToken';


export default [
  isValidForm(state`user.loginForm`), {
    true: [
      getToken,
      {
        true: [],
      },
    ],
    false: [

    ],
  },
];
