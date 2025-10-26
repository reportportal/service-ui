import { useIntl } from 'react-intl';
import { useUserPermissions } from 'hooks/useUserPermissions';

import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { createClassnames } from 'common/utils';

import { messages } from '../messages';
import { useManualLaunchesEmptyStateButtons } from './hooks/useManualLaunchesEmptyStateButtons';

import styles from './manualLaunchesEmptyState.scss';

const cx = createClassnames(styles);

export const ManualLaunchesEmptyState = () => {
  const { formatMessage } = useIntl();
  const { canCreateManualLaunch } = useUserPermissions();

  const descriptionMessage = canCreateManualLaunch
    ? formatMessage(messages.noLaunchesDescription)
    : '';

  const buttons = useManualLaunchesEmptyStateButtons();

  return (
    <div className={cx('manual-launches-empty-state')}>
      <EmptyStatePage
        imageType="play"
        title={formatMessage(messages.noLaunches)}
        description={descriptionMessage}
        buttons={buttons}
      />
    </div>
  );
};
