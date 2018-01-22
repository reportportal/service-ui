export default ({ state, forms, http, path }) => {
  if (forms.get('user.changePassForm').isValid) {
    return (
      http.post('/api/v1/user/password/reset', {
        password: state.get('user.changePassForm.newPassword.value'),
        uuid: state.get('route.pageParams.reset'),
      })
        .then((response) => {
          state.set('user.changePassForm.isLoad', false);
          if (path && path.true) {
            return path.true({ message: response.result.msg });
          }
          return {};
        })
        .catch((error) => {
          state.set('user.changePassForm.isLoad', false);
          if (path && path.false) {
            return path.false({ error });
          }
          return { error };
        })
    );
  }
  return path.false();
};
