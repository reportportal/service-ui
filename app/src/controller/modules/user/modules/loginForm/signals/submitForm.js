import { sequence } from 'cerebral';
import { httpPost } from '@cerebral/http/operators';
import { state, string } from 'cerebral/tags';
import { set } from 'cerebral/operators';
import { isValidForm, resetForm } from '@cerebral/forms/operators';

import { checkAuthUrl, updateUserInfo, setUserToken } from 'controller/globalActions';


export default sequence('Log in', [
  isValidForm(state`user.loginForm`), {
    true: [
      set(state`user.loginForm.isLoad`, true),
      httpPost(string`/uat/sso/oauth/token?grant_type=password&username=${state`user.loginForm.login.value`}&password=${state`user.loginForm.password.value`}`, {}),
      {
        success: [
          resetForm(state`user.loginForm`),
          ({ props }) => {
            const result = props.response.result;
            return { token: `${result.token_type} ${result.access_token}` };
          },
          setUserToken,
          updateUserInfo,
          checkAuthUrl,
        ],
        error: [],
        abort: [],
      },
      set(state`user.loginForm.isLoad`, false),
    ],
    false: [
      set(state`user.loginForm.showErrors`, true),
    ],
  },
]);
