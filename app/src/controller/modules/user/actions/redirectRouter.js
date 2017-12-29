export default ({ router }) => {
  console.log(router);
  router.redirectToSignal('route.checkAuthURL')
}
