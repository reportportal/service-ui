export default ({ state, forms, http, path }) => http.post(`/uat/sso/oauth/token?grant_type=password&username=${state.get('user.loginForm.login.value')}&password=${state.get('user.loginForm.password.value')}`)
    .then((response) => {
      const result = response.result;
      const token = `${result.token_type} ${result.access_token}`;
      if (path.true) {
        path.true({ token });
      } else {
        return { token };
      }
    });
