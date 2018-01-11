import { when } from 'cerebral/operators';
import { state } from 'cerebral/tags';
import updateLastServiceVersions from '../../other/modules/lastServiceVersions/signals/update';
import loadTwitterInfo from '../../other/modules/twitter/signals/updateInfo';

export default function loginPageDataLoad(continueSequence) {
  return [
    when(state`route.currentPage`, page => page === 'login'),
    {
      true: continueSequence,
      false: [
        continueSequence,
        updateLastServiceVersions,
        loadTwitterInfo,
      ],
    },
  ];
}
