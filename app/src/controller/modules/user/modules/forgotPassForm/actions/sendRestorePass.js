export default ({ state, forms, http, path }) => {
  if (forms.get('user.forgotPassForm').isValid) {
    state.set('user.forgotPassForm.isLoad', true);
    return http.post('/api/v1/user/password/restore', {
      email: state.get('user.forgotPassForm.email.value'),
    })
      .then((response) => {
        state.set('user.forgotPassForm.isLoad', false);
        if (path && path.true) {
          return path.true({ message: response.result.msg });
        }
        return {};
      })
      .catch((error) => {
        state.set('user.forgotPassForm.isLoad', false);
        if (path && path.false) {
          return path.false({ error });
        }
        return { error };
      });
  }
  if (path && path.false) {
    return path.false({ error: 'Not Valid' });
  }
  return { error: 'Not Valid' };
};
