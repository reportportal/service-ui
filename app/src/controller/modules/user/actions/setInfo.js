export default ({ state, props }) => {
  let userData = props.userInfo;
  if (!userData) {
    userData = {};
  }
  state.set('user.data', userData);
};
