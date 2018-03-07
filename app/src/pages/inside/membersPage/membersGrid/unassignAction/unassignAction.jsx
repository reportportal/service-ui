import { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { GhostButton } from 'components/buttons/ghostButton';
import { showModalAction } from 'controllers/modal';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { canAssignUnassignInternalUser } from 'common/utils/permissions';
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  accountRoleSelector,
} from 'controllers/user';
import { showNotification } from 'controllers/notification';
import UnassignIcon from './img/unassign-inline.svg';

const messages = defineMessages({
  anassignUser: {
    id: 'AssignAction.anassignUser',
    defaultMessage: 'User has been unassigned from project!',
  },
  btnTitle: {
    id: 'AssignAction.anassignBtn',
    defaultMessage: 'Unassign',
  },
});

@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    projectRole: activeProjectRoleSelector(state),
    accountRole: accountRoleSelector(state),
  }),
  { showNotification, showModalAction },
)
export class UnassignAction extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    showModalAction: PropTypes.func.isRequired,
    userId: PropTypes.string,
    projectId: PropTypes.string,
    accountRole: PropTypes.string,
    projectRole: PropTypes.string,
    showNotification: PropTypes.func,
    fetchUserAction: PropTypes.func,
    fetchData: PropTypes.func,
  };
  static defaultProps = {
    userId: '',
    projectId: '',
    accountRole: '',
    projectRole: '',
    showNotification: () => {},
    fetchUserAction: () => {},
    fetchData: () => {},
  };

  unassignAction = () => {
    const { projectId, userId, intl } = this.props;
    fetch(URLS.userUnasign(projectId), {
      method: 'put',
      data: { userNames: [userId] },
    })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.anassignUser),
          type: 'success',
        });
        this.props.fetchData();
      })
      .catch((err) => {
        this.props.showNotification({
          message: err.msg,
          type: 'error',
        });
      });
  };
  showUnassignModal = () =>
    this.props.showModalAction({
      id: 'unassignModal',
      data: {
        unassignAction: this.unassignAction,
        user: this.props.userId,
        project: this.props.projectId,
      },
    });

  render = () => (
    <Fragment>
      <GhostButton
        icon={UnassignIcon}
        onClick={this.showUnassignModal}
        disabled={!canAssignUnassignInternalUser(this.props.accountRole, this.props.projectRole)}
      >
        {this.props.intl.formatMessage(messages.btnTitle)}
      </GhostButton>
    </Fragment>
  );
}
