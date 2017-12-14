export default ({ props, http, storage }) => {
  const token = props.token || 'Basic dWk6dWltYW4=';
  http.updateOptions({
    headers: {
      Authorization: token,
    },
  });
  storage.set('session_token', token);
};
