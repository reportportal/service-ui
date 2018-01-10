export default ({ state, http, storage, props }) => {
  const token = props.token || 'Basic dWk6dWltYW4=';
  state.set('user.token', token);
  storage.set('session_token', token);
  http.updateOptions({
    headers: {
      Authorization: token,
    },
  });
};
