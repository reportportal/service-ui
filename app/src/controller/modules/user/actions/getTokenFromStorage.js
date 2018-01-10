export default ({ storage }) => ({
  token: storage.get('session_token'),
});
