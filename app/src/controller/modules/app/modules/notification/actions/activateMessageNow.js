const activateMessageNow = ({ module, props }) => {
  module.set('currentMessage', props.message || '');
  module.set('currentType', props.type || '');
  module.set('currentMessageId', props.messageId || '');
  setTimeout(() => {
    const newMessage = module.get('stack')[0];
    if (newMessage) {
      module.shift('stack');
      activateMessageNow({ module, props: newMessage });
    } else {
      module.set('currentMessage', '');
      module.set('currentType', '');
      module.set('currentMessageId', '');
    }
  }, 5000);
};

export default activateMessageNow;
