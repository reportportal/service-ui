function redirectFactory(signal) {
  function redirect({ controller }) {
    controller.getSignal(`route.${signal}`)();
  }

  return redirect;
}

export default redirectFactory;
