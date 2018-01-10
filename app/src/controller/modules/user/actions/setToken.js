export default ({ state, http, storage, props }) => {
  const token = props.token;
  state.set('user.token', token);
  storage.set('session_token', token);
  http.updateOptions({
    headers: {
      Authorization: token,
    },
  });
};
