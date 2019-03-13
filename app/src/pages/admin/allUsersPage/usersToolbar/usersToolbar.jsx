import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ActionPanel } from './actionPanel';
import styles from './usersToolbar.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  deleteModalContent: {
    id: 'administrateUsersPageToolbar.allUsers',
    defaultMessage: '{count} items selected',
  },
});
@injectIntl
export class UsersToolbar extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    selectedUsers: PropTypes.arrayOf(PropTypes.object),
    onDelete: PropTypes.func,
  };
  static defaultProps = {
    selectedUsers: [],
    onDelete: () => {},
  };
  get selectedUsersCount() {
    return this.props.selectedUsers.length;
  }
  get showBulkEditPanel() {
    return this.selectedUsersCount > 0;
  }
  get renderRightSideComponent() {
    const { intl, onDelete } = this.props;
    if (this.showBulkEditPanel) {
      return (
        <div className={cx('users-bulk-toolbar')}>
          <div className={cx('users-bulk-toolbar-item')}>
            {intl.formatMessage(messages.deleteModalContent, { count: this.selectedUsersCount })}
          </div>
          <div className={cx(['users-bulk-button', 'users-bulk-toolbar-item'])} onClick={onDelete}>
            {intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
          </div>
        </div>
      );
    }
    return <ActionPanel />;
  }
  render() {
    return (
      <div className={cx('users-toolbar')}>
        <div />
        {this.renderRightSideComponent}
      </div>
    );
  }
}
