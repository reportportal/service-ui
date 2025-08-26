import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { activeProjectSelector } from 'controllers/user';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { canCreateManualLaunch } from 'common/utils/permissions/permissions';
import { PROJECT_TEST_PLANS_PAGE, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages/constants';
import { userRolesSelector } from 'controllers/pages';
import { messages } from '../messages';
import styles from './manualLaunchesEmptyState.scss';

const cx = classNames.bind(styles);

export const ManualLaunchesEmptyState = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(activeProjectSelector);
  const userRoles = useSelector(userRolesSelector);

  const payload = { organizationSlug, projectSlug };

  const descriptionMessage = canCreateManualLaunch(userRoles)
    ? formatMessage(messages.noLaunchesDescription)
    : '';

  const buttons = canCreateManualLaunch(userRoles)
    ? [
        {
          name: formatMessage(messages.testPlansLink),
          type: PROJECT_TEST_PLANS_PAGE,
        },
        {
          name: formatMessage(messages.testLibraryLink),
          type: TEST_CASE_LIBRARY_PAGE,
        },
      ]
    : [];

  return (
    <div className={cx('manual-launches-empty-state')}>
      <EmptyStatePage
        imageType="play"
        title={formatMessage(messages.noLaunches)}
        description={descriptionMessage}
        buttons={buttons.map(({ name, type }) => ({
          name,
          variant: 'text',
          handleButton: () => dispatch({ type, payload }),
        }))}
      />
    </div>
  );
};
