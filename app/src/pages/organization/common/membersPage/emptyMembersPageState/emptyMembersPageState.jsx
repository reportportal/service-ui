import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { BubblesLoader } from '@reportportal/ui-kit';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import { messages as invitationsMessages } from 'common/constants/localization/invitationsLocalization';
import { EmptyPageState } from 'pages/common/emptyPageState';
import { messages } from '../../../messages';
import EmptyIcon from './img/empty-members-icon-inline.svg';
import styles from './emptyMembersPageState.scss';

const cx = classNames.bind(styles);

export const EmptyMembersPageState = ({ isLoading, hasPermission, showInviteUserModal }) => {
  const { formatMessage } = useIntl();
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);
  const buttonTitle = formatMessage(
    ssoUsersOnly ? invitationsMessages.assignUser : invitationsMessages.inviteUser,
  );

  return isLoading ? (
    <div className={cx('loader')}>
      <BubblesLoader />
    </div>
  ) : (
    <EmptyPageState
      hasPermission={hasPermission}
      emptyIcon={EmptyIcon}
      label={formatMessage(messages.noUsers)}
      description={formatMessage(messages.description)}
      buttonTitle={buttonTitle}
      onClick={showInviteUserModal}
    />
  );
};

EmptyMembersPageState.propTypes = {
  isLoading: PropTypes.bool,
  hasPermission: PropTypes.bool,
  showInviteUserModal: PropTypes.func,
};

EmptyMembersPageState.defaultProps = {
  isLoading: false,
  hasPermission: false,
  showInviteUserModal: () => {},
};
