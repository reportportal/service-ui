export default ({ http }) => http.get('/api/v1/user')
    .then((response) => {
      console.log(response);
      return {
        userInfo: {},
      };
    })
    .catch(() => ({ userInfo: null }));
