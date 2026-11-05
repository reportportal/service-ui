import { useIntl } from 'react-intl';

import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { createClassnames } from 'common/utils';

import { messages } from '../messages';
import { useManualLaunchesEmptyStateButtons } from './hooks/useManualLaunchesEmptyStateButtons';

import styles from './manualLaunchesEmptyState.scss';

const cx = createClassnames(styles);

export const ManualLaunchesEmptyState = () => {
  const { formatMessage } = useIntl();

  const buttons = useManualLaunchesEmptyStateButtons();

  return (
    <div className={cx('manual-launches-empty-state')}>
      <EmptyStatePage
        imageType="loop"
        title={formatMessage(messages.noLaunches)}
        description={formatMessage(messages.noLaunchesDescription)}
        buttons={buttons}
      />
    </div>
  );
};
