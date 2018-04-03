import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { getProjectRolesOptions } from 'common/utils';
import {
  activeProjectSelector,
  getRoleForCurrentProjectSelector,
  isAdminSelector,
  hasPermissionsSelector,
} from 'controllers/user';
import { FieldProvider } from 'components/fields/fieldProvider';
import { ModalField } from 'components/main/modal';
import { InputUserSearch } from 'components/inputs/inputUserSearch';
import { InputDropdown } from 'components/inputs/inputDropdown';
import classNames from 'classnames/bind';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import styles from './inviteUserForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
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

@injectIntl
@connect((state) => ({
  activeProject: activeProjectSelector(state),
  currentRole: getRoleForCurrentProjectSelector(state),
  isAdmin: isAdminSelector(state),
  hasPermissions: hasPermissionsSelector(state, getRoleForCurrentProjectSelector(state)),
}))
export class InviteUserForm extends Component {
  static propTypes = {
    intl: intlShape,
    activeProject: PropTypes.string,
    currentRole: PropTypes.string,
    isAdmin: PropTypes.bool,
    hasPermissions: PropTypes.bool,
    formatUser: PropTypes.func,
  };
  static defaultProps = {
    intl: {},
    activeProject: '',
    currentRole: '',
    isAdmin: false,
    hasPermissions: false,
    formatUser: () => {},
  };
  formatUser = (user) => (user && { value: user.userLogin, label: user.userLogin }) || null;
  render() {
    const { intl, currentRole, isAdmin, hasPermissions, activeProject } = this.props;
    return (
      <form className={cx('invite-form')}>
        <ModalField
          label={intl.formatMessage(messages.emailLabel)}
          labelWidth="120"
          inputWidth="350"
        >
          <FieldProvider name="user" format={this.formatUser}>
            <FieldErrorHint>
              <InputUserSearch
                projectId={activeProject}
                isAdmin={isAdmin}
                placeholder={intl.formatMessage(messages.inputPlaceholder)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
        <ModalField label={intl.formatMessage(messages.role)} labelWidth="120" inputWidth="350">
          <FieldProvider name="role">
            <InputDropdown
              options={getProjectRolesOptions(currentRole, isAdmin, hasPermissions)}
              onChange={this.selectRole}
            />
          </FieldProvider>
        </ModalField>
      </form>
    );
  }
}
