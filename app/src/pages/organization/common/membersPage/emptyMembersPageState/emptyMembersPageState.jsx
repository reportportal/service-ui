import { useIntl } from 'react-intl';
import { BubblesLoader } from '@reportportal/ui-kit';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { EmptyPageState } from 'pages/common/emptyPageState';
import { messages } from '../membersPageHeader/messages';
import EmptyIcon from './img/empty-members-icon-inline.svg';
import styles from './emptyMembersPageState.scss';

const cx = classNames.bind(styles);

export const EmptyMembersPageState = ({ isLoading, hasPermission, showInviteUserModal }) => {
  const { formatMessage } = useIntl();
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
      buttonTitle={formatMessage(messages.inviteUser)}
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
