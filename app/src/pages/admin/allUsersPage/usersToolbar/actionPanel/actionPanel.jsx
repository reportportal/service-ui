import React, { Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import ExportIcon from 'common/img/export-inline.svg';
import InviteUserIcon from 'common/img/invite-inline.svg';
import AddUserIcon from 'common/img/add-user-inline.svg';
import { URLS } from 'common/urls';
import { EXPORT, INVITE_USER, ADD_USER } from './constants';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [EXPORT]: {
    id: 'AllUsersPage.export',
    defaultMessage: 'Export',
  },
  [INVITE_USER]: {
    id: 'AllUsersPage.inviteUser',
    defaultMessage: 'Invite user',
  },
  [ADD_USER]: {
    id: 'AllUsersPage.AddUser',
    defaultMessage: 'Add user',
  },
});

@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };
  onExportUsers = () => {
    window.location.href = URLS.exportUsers();
  };
  renderHeaderButtons = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const ACTION_BUTTONS = [
      {
        key: EXPORT,
        icon: ExportIcon,
        grayBorder: true,
        onClick: this.onExportUsers,
      },
      {
        key: INVITE_USER,
        icon: InviteUserIcon,
        grayBorder: false,
      },
      {
        key: ADD_USER,
        icon: AddUserIcon,
        grayBorder: false,
      },
    ];
    return (
      <div className={cx('action-buttons')}>
        {ACTION_BUTTONS.map(({ key, icon, grayBorder, onClick }) => (
          <div className={cx('action-button')} key={key}>
            <GhostButton icon={icon} grayBorder={grayBorder} onClick={onClick}>
              {formatMessage(messages[key])}
            </GhostButton>
          </div>
        ))}
      </div>
    );
  };

  render() {
    return this.renderHeaderButtons();
  }
}
