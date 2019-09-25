import { FormattedMessage } from 'react-intl';
import { ALL, LATEST } from './reservedFilterIds';

export const FILTER_TITLES = {
  [ALL]: <FormattedMessage id={'LaunchesFilter.all'} defaultMessage={'All'} />,
  [LATEST]: <FormattedMessage id={'LaunchesFilter.latest'} defaultMessage={'Latest'} />,
};
