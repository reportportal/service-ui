import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { canInviteInternalUser } from 'common/utils/permissions';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputSearch } from 'components/inputs/inputSearch';
import { MEMBERS_PAGE_EVENTS } from 'components/main/analytics/events';
import PermissionMapIcon from 'common/img/permission-inline.svg';
import InviteUserIcon from 'common/img/invite-inline.svg';
import styles from './membersPageToolbar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  permissionMap: {
    id: 'MembersPageToolbar.permissionMap',
    defaultMessage: 'Permission map',
  },
  inviteUser: {
    id: 'MembersPageToolbar.inviteUser',
    defaultMessage: 'Invite user',
  },
  searchInputPlaceholder: {
    id: 'MembersPageToolbar.searchByName',
    defaultMessage: 'Search by name',
  },
});
@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    accountRole: userAccountRoleSelector(state),
  }),
  {
    showModalAction,
  },
)
@reduxForm({
  form: 'filterSearch',
  enableReinitialize: true,
})
@injectIntl
@track()
export class MembersPageToolbar extends React.Component {
  static propTypes = {
    intl: intlShape,
    showModalAction: PropTypes.func.isRequired,
    onInvite: PropTypes.func,
    projectRole: PropTypes.string,
    accountRole: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    intl: {},
    onInvite: () => {},
    projectRole: '',
    accountRole: '',
  };

  showInviteUserModal = () => {
    this.props.tracking.trackEvent(MEMBERS_PAGE_EVENTS.INVITE_USER_CLICK);
    this.props.showModalAction({ id: 'inviteUserModal', data: { onInvite: this.props.onInvite } });
  };

  showPermissionMapModal = () => {
    this.props.tracking.trackEvent(MEMBERS_PAGE_EVENTS.PERMISSION_MAP_CLICK);
    this.props.showModalAction({ id: 'permissionMapModal' });
  };

  render() {
    return (
      <div className={cx('members-page-toolbar')}>
        <div className={cx('search-input')}>
          <FieldProvider name="filter">
            <InputSearch
              placeholder={this.props.intl.formatMessage(messages.searchInputPlaceholder)}
            />
          </FieldProvider>
        </div>
        <div className={cx('members-page-controls')}>
          <GhostButton icon={PermissionMapIcon} onClick={this.showPermissionMapModal}>
            {this.props.intl.formatMessage(messages.permissionMap)}
          </GhostButton>
          <GhostButton
            icon={InviteUserIcon}
            onClick={this.showInviteUserModal}
            disabled={!canInviteInternalUser(this.props.accountRole, this.props.projectRole)}
          >
            {this.props.intl.formatMessage(messages.inviteUser)}
          </GhostButton>
        </div>
      </div>
    );
  }
}
