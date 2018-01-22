export default ({ props, state }) => {
  state.set('user.loginForm.login.value', props.login);
  state.set('user.loginForm.password.value', props.password);
  return {};
};
