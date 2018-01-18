export default ({ module, props }) => {
  module.push('stack', {
    message: props.message,
    messageId: props.messageId,
    type: props.type,
  });
};
