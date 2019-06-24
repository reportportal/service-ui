import { FormattedMessage } from 'react-intl';
import {
  ALL_GROUP_TYPE,
  BTS_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  ANALYZER_GROUP_TYPE,
} from './pluginsGroupTypes';

const PLUGINS_FILTER_LIST = [
  {
    value: ALL_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.all'} defaultMessage={'All'} />,
  },
  {
    value: ANALYZER_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.analyzer'} defaultMessage={'Analyzer'} />,
  },
  {
    value: AUTHORIZATION_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.auth'} defaultMessage={'Authorization'} />,
  },
  {
    value: NOTIFICATION_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.notifications'} defaultMessage={'Notifications'} />,
  },
  {
    value: BTS_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.bts'} defaultMessage={'Bug Tracking Systems'} />,
  },
];

export const getPluginsFilter = (values = []) =>
  PLUGINS_FILTER_LIST.filter((item) => values.includes(item.value))
    .concat(PLUGINS_FILTER_LIST[0])
    .reverse();
