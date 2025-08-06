import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { EmptyPageState } from 'pages/common';
import { activeProjectSelector } from 'controllers/user';
import EmptyIcon from '../img/empty-manual-launches-icon-inline.svg';
import { messages } from '../messages';
import { LinkComponent } from '../../common/LinkComponent';
import { REDIRECT_LINKS } from '../constants';
import styles from './manualLaunchesEmptyState.scss';

const cx = classNames.bind(styles);

export const ManualLaunchesEmptyState = () => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(activeProjectSelector);

  return (
    <div className={cx('manual-launches-empty-state')}>
      <EmptyPageState
        emptyIcon={EmptyIcon}
        label={formatMessage(messages.noLaunches)}
        description={formatMessage(messages.noLaunchesDescription)}
      />
      <div className={cx('redirect-links')}>
        {REDIRECT_LINKS?.map(({ link, title }) => (
          <LinkComponent
            key={link}
            to={{
              type: link,
              payload: {
                organizationSlug,
                projectSlug,
              },
            }}
            target="_self"
          >
            {formatMessage(title)}
          </LinkComponent>
        ))}
      </div>
    </div>
  );
};
