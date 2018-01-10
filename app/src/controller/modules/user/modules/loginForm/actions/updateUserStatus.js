export default ({ controller }) => {
  const updateUserStatus = controller.getSignal('user.updateUserStatus');
  return updateUserStatus();
};
