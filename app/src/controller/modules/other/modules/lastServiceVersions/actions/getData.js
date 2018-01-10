import fetchJsonp from 'fetch-jsonp';

export default ({ state }) => {
  state.set('other.lastServiceVersions.isLoad', true);
  return fetchJsonp('//status.reportportal.io/versions', { jsonpCallback: 'jsonp' })
    .then(response => response.json())
    .then((data) => {
      state.set('other.lastServiceVersions.isLoad', false);
      return {
        data,
      };
    })
    .catch((error) => {
      state.set('other.lastServiceVersions.isLoad', false);
      return { error };
    });
};
