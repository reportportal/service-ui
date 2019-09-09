import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { commonValidators } from 'common/utils';
import { reduxForm, formValueSelector } from 'redux-form';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { DEFAULT_PROJECT_ROLE, ROLES_MAP } from 'common/constants/projectRoles';
import { URLS } from 'common/urls';
import { projectIdSelector } from 'controllers/pages';
import { isAdminSelector } from 'controllers/user';
import { withModal, ModalLayout, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { showModalAction } from 'controllers/modal';
import { InputUserSearch } from 'components/inputs/inputUserSearch';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { MEMBERS_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './inviteUserModal.scss';

const cx = classNames.bind(styles);
const LABEL_WIDTH = 105;
const messages = defineMessages({
  headerInviteUserModal: {
    id: 'InviteUserModal.headerInviteUserModal',
    defaultMessage: 'Invite user',
  },
  description: {
    id: 'InviteUserModal.description',
    defaultMessage: 'Invite user to the project',
  },
  emailLabel: {
    id: 'InviteUserModal.emailLabel',
    defaultMessage: 'Login or email',
  },
  role: {
    id: 'InviteUserModal.role',
    defaultMessage: 'Project role',
  },
  inputPlaceholder: {
    id: 'InviteUserModal.inputPlaceholder',
    defaultMessage: 'Enter login or email',
  },
});

const inviteFormSelector = formValueSelector('inviteUserForm');

@withModal('inviteUserModal')
@injectIntl
@connect(
  (state, ownProps) => ({
    selectedProject: ownProps.data.isProjectSelector
      ? inviteFormSelector(state, 'project')
      : projectIdSelector(state),
    selectedUser: inviteFormSelector(state, 'user'),
    isAdmin: isAdminSelector(state),
    initialValues: {
      role: DEFAULT_PROJECT_ROLE,
      project: projectIdSelector(state),
    },
  }),
  { showModalAction },
)
@reduxForm({
  form: 'inviteUserForm',
  validate: ({ user, project }) => ({
    user: commonValidators.requiredField(user),
    project: commonValidators.requiredField(project),
  }),
  enableReinitialize: true,
})
@track()
export class InviteUserModal extends Component {
  static propTypes = {
    intl: intlShape,
    data: PropTypes.shape({
      onInvite: PropTypes.func,
      isProjectSelector: PropTypes.bool,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    selectedProject: PropTypes.string,
    selectedUser: PropTypes.object,
    isAdmin: PropTypes.bool,
    dirty: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    intl: {},
    showModalAction: () => {},
    selectedProject: '',
    selectedUser: {},
    isAdmin: false,
    dirty: false,
  };

  constructor(props) {
    super(props);
    this.projectSearchUrl = URLS.projectNameSearch();
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  inviteUserAndCloseModal = (closeModal) => (data) => {
    this.props.data.onInvite(data).then((res) => {
      closeModal();
      if (res && res.errorOccurred) return;
      if (data.user.externalUser) {
        this.props.showModalAction({
          id: 'externalUserInvitationModal',
          data: { email: res.email, link: res.backLink },
        });
      }
    });
  };
  formatUser = (user) => (user && { value: user.userLogin, label: user.userLogin }) || null;

  formatValueProject = (value) => (value ? { value, label: value } : null);

  parseValueProject = (value) => {
    if (value === null) return null;
    if (value && value.value) return value.value;

    return undefined;
  };

  formatValue = (values) => values.map((value) => ({ value, label: value }));

  filterProject = ({ value }) =>
    !(
      value &&
      this.props.selectedUser &&
      this.props.selectedUser.assignedProjects &&
      this.props.selectedUser.assignedProjects[value]
    );

  render() {
    const { intl, handleSubmit, selectedProject, isAdmin, tracking, data } = this.props;

    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.INVITE),
      onClick: (closeModal) => {
        tracking.trackEvent(MEMBERS_PAGE_EVENTS.INVITE_BTN_INVITE_USER_MODAL);
        handleSubmit(this.inviteUserAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: MEMBERS_PAGE_EVENTS.CANCEL_BTN_INVITE_USER_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.headerInviteUserModal)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={MEMBERS_PAGE_EVENTS.CLOSE_ICON_INVITE_USER_MODAL}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <p className={cx('modal-description')}>{intl.formatMessage(messages.description)}</p>
        <form className={cx('invite-form')}>
          <ModalField label={intl.formatMessage(messages.emailLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="user" format={this.formatUser}>
              <FieldErrorHint>
                <InputUserSearch
                  projectId={selectedProject}
                  isAdmin={isAdmin}
                  placeholder={intl.formatMessage(messages.inputPlaceholder)}
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          {data.isProjectSelector && (
            <ModalField label="Project" name="project" labelWidth={LABEL_WIDTH}>
              <FieldProvider
                name="project"
                format={this.formatValueProject}
                parse={this.parseValueProject}
              >
                <InputTagsSearch
                  minLength={1}
                  async
                  uri={this.projectSearchUrl}
                  makeOptions={this.formatValue}
                  filterOption={this.filterProject}
                />
              </FieldProvider>
            </ModalField>
          )}
          <ModalField label={intl.formatMessage(messages.role)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="role">
              <InputDropdown options={ROLES_MAP} />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
