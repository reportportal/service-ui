import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { activeProjectSelector } from 'controllers/user';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { PROJECT_TEST_PLANS_PAGE, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages/constants';
import { messages } from '../messages';
import styles from './manualLaunchesEmptyState.scss';

const cx = classNames.bind(styles);

export const ManualLaunchesEmptyState = () => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(activeProjectSelector);

  const payload = { organizationSlug, projectSlug };
  const links = [
    {
      title: formatMessage(messages.testPlansLink),
      to: PROJECT_TEST_PLANS_PAGE,
      payload,
    },
    {
      title: formatMessage(messages.testLibraryLink),
      to: TEST_CASE_LIBRARY_PAGE,
      payload,
    },
  ];

  return (
    <div className={cx('manual-launches-empty-state')}>
      <EmptyStatePage
        imageType="play"
        label={formatMessage(messages.noLaunches)}
        description={formatMessage(messages.noLaunchesDescription)}
        links={links}
      />
    </div>
  );
};
