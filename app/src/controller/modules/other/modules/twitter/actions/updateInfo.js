import fetchJsonp from 'fetch-jsonp';

export default ({ state }) => fetchJsonp('//status.reportportal.io/twitter', { jsonpCallback: 'jsonp' })
    .then(response => response.json()).then((data) => {
      const twits = [];
      const twitById = {};
      data.forEach((twit) => {
        twits.push(twit.id);
        twitById[twit.id] = twit;
      });
      state.set('other.twitter.twits', twits);
      state.set('other.twitter.twitById', twitById);
    }).catch(() => {

    });
