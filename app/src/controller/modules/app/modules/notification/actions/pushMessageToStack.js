export default ({ state, props }) => {
  state.push('app.notification.stack', {
    message: props.message,
    type: props.type,
  });
};
