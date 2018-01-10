import fetchJsonp from 'fetch-jsonp';

export default ({ state }) => {
  state.set('other.twitter.isLoad', true);
  return fetchJsonp('//status.reportportal.io/twitter', { jsonpCallback: 'jsonp' })
    .then(response => response.json())
    .then((data) => {
      const twits = [];
      const twitById = {};
      data.forEach((twit) => {
        twits.push(twit.id);
        twitById[twit.id] = twit;
      });
      state.set('other.twitter.isLoad', false);
      return {
        twits,
        twitById,
      };
    })
    .catch((error) => {
      state.set('other.twitter.isLoad', false);
      return { error };
    });
};
