import { defineMessages } from 'react-intl';
import { SEARCH_MODES } from './../../../constants';

export const messages = defineMessages({
  changeSimilarItems: {
    id: 'EditDefectModal.changeSimilarItems',
    defaultMessage: 'Change Similar Items',
  },
  currentLaunchMode: {
    id: 'EditDefectModal.currentLaunchMode',
    defaultMessage: 'For the current launch ',
  },
  sameLaunchNameMode: {
    id: 'EditDefectModal.sameLaunchNameMode',
    defaultMessage: 'Launches with the same name',
  },
  filterMode: {
    id: 'EditDefectModal.filterMode',
    defaultMessage: 'For the current applied filter',
  },
  [`${SEARCH_MODES.CURRENT_LAUNCH}Tooltip`]: {
    id: 'EditDefectModal.currentLaunchTooltip',
    defaultMessage: 'Test items with similar failure reason in launch <b>{launch}</b>',
  },
  [`${SEARCH_MODES.FILTER}Tooltip`]: {
    id: 'EditDefectModal.filterTooltip',
    defaultMessage:
      'Test items with similar failure reason in last 10 launches of filter <b>{filter}</b>',
  },
  [`${SEARCH_MODES.LAUNCH_NAME}Tooltip`]: {
    id: 'EditDefectModal.launchNameTooltip',
    defaultMessage:
      'Test items with similar failure reason in last 10 launches of launch <b>{launch}</b>',
  },
});
