export default ({ http }) => http.get('/api/v1/user')
    .then((response) => {
      return {
        userInfo: response.result,
      };
    })
    .catch(() => ({ userInfo: null }));
