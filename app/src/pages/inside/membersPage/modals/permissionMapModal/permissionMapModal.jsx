import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal, ModalLayout } from 'components/main/modal';
import { PermissionMap } from './permissionMap';
import styles from './permissionMapModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  permissionMapHeader: {
    id: 'PermissionMapModal.headerPermissionMapModal',
    defaultMessage: 'Permission map',
  },
});

@withModal('permissionMapModal')
@injectIntl
export class PermissionMapModal extends Component {
  static propTypes = {
    intl: intlShape,
  };
  static defaultProps = {
    intl: {},
  };
  render() {
    const okButton = {
      text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.OK),
      onClick: (closeModal) => {
        closeModal();
      },
    };
    return (
      <ModalLayout
        title={this.props.intl.formatMessage(messages.permissionMapHeader)}
        className={cx('permission-map')}
        okButton={okButton}
      >
        <PermissionMap />
      </ModalLayout>
    );
  }
}
