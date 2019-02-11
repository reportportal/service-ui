import React, { Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import ExportIcon from 'common/img/export-inline.svg';
import InviteUserIcon from 'common/img/ic_invite-inline.svg';
import AddUserIcon from 'common/img/ic-add-user-inline.svg';
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

const ACTION_BUTTONS = [
  {
    key: EXPORT,
    icon: ExportIcon,
    grayBorder: true,
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

@injectIntl
export class ActionPanel extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };
  renderHeaderButtons = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <div className={cx('action-buttons')}>
        {ACTION_BUTTONS.map(({ key, icon, grayBorder }) => (
          <div className={cx('action-button')} key={key}>
            <GhostButton icon={icon} grayBorder={grayBorder}>
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
