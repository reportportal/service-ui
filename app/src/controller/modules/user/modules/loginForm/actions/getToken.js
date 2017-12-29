export default ({ state, forms, http, path }) => {
  if (forms.get('user.loginForm').isValid) {
    state.set('user.loginForm.isLoad', true);
    return http.post(`/uat/sso/oauth/token?grant_type=password&username=${state.get('user.loginForm.login.value')}&password=${state.get('user.loginForm.password.value')}`)
      .then((response) => {
        const result = response.result;
        const token = `${result.token_type} ${result.access_token}`;
        state.set('user.loginForm.isLoad', false);
        if (path && path.true) {
          return path.true({ token });
        }
        return { token };
      })
      .catch(error => {
        state.set('user.loginForm.isLoad', false);
        if (path && path.false) {
          return path.false({error});
        }
        return {error}
      })
  } else {
    if (path && path.false) {
      return path.false({error: 'Not Valid'});
    }
    return {error: 'Not Valid'}
  }
};
