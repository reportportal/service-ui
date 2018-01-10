export default ({ http }) => http.get('/api/v1/user')
    .then(response => ({
      userInfo: response.result,
    }))
    .catch(() => ({ userInfo: null }));
