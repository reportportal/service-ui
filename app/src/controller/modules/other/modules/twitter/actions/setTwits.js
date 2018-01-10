export default ({ state, props }) => {
  state.set('other.twitter.twits', props.twits);
  state.set('other.twitter.twitById', props.twitById);
};
