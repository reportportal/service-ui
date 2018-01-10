export default ({ state, router }) => {
  if (state.get('route.currentPage') === 'login' && state.get('user.auth')) {
    router.redirectToSignal('route.appRouted');
  } else if (state.get('route.currentPage') !== 'login' && !state.get('user.auth')) {
    router.redirectToSignal('route.loginRouted');
  }
};
