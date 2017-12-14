export default ({ http, storage }) => {
  http.updateOptions({
    headers: {
      Authorization: storage.get('session_token'),
    },
  });
};
