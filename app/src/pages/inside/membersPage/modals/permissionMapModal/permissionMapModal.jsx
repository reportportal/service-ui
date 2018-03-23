import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { PermissionMap } from './permissionMap';

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
  okClickHandler = (closeModal) => {
    setTimeout(() => closeModal(), 1000);
  };
  render() {
    return (
      <ModalLayout
        title={this.props.intl.formatMessage(messages.permissionMapHeader)}
        permissionMap
      >
        <PermissionMap />
      </ModalLayout>
    );
  }
}
