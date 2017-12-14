const activateMessageNow = ({ state, props }) => {
  state.set('app.notification.currentMessage', props.message);
  state.set('app.notification.currentType', props.type);
  setTimeout(() => {
    const newMessage = state.get('app.notification.stack')[0];
    if (newMessage) {
      state.shift('app.notification.stack');
      activateMessageNow({ state, props: newMessage });
    } else {
      state.set('app.notification.currentMessage', '');
      state.set('app.notification.currentType', '');
    }
  }, 5000);
};

export default activateMessageNow;
