import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { showNotification } from 'controllers/notification';
import classNames from 'classnames/bind';
import { withModal, ModalLayout } from 'components/main/modal';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import styles from './removeIndexModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  removeIndexHeader: {
    id: 'RemoveIndexModal.headerRemoveIndexModal',
    defaultMessage: 'Remove index',
  },
  contentHeaderMessage: {
    id: 'RemoveIndexModal.contentHeaderMessage',
    defaultMessage: 'Are you sure to remove all data from the ElasticSearch?',
  },
  removeButtonText: {
    id: 'RemoveIndexModal.removeButtonText',
    defaultMessage: 'Remove',
  },
  cancelButtonText: {
    id: 'RemoveIndexModal.cancelButtonText',
    defaultMessage: 'Cancel',
  },
  removeSuccessNotification: {
    id: 'RemoveIndexModal.removeSuccessNotification',
    defaultMessage: 'Index was removed successfully',
  },
  removeErrorNotification: {
    id: 'RemoveIndexModal.removeErrorNotification',
    defaultMessage: 'Something went wrong...',
  },
});

@withModal('removeIndexModal')
@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
  }),
  { showNotification },
)
@injectIntl
export class RemoveIndexModal extends Component {
  static propTypes = {
    intl: intlShape,
    currentProject: PropTypes.string,
    showNotification: PropTypes.func,
  };
  static defaultProps = {
    intl: {},
    currentProject: '',
    showNotification: () => {},
  };

  onRemoveClick = (closeModal) => {
    fetch(URLS.projectIndex(this.props.currentProject), { method: 'delete' })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.removeSuccessNotification),
          type: 'success',
        });
        closeModal();
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.removeErrorNotification),
          type: 'error',
        });
      });
  };

  render() {
    const okButton = {
      text: this.props.intl.formatMessage(messages.removeButtonText),
      danger: true,
      onClick: this.onRemoveClick,
    };
    const cancelButton = {
      text: this.props.intl.formatMessage(messages.cancelButtonText),
    };

    return (
      <ModalLayout
        title={this.props.intl.formatMessage(messages.removeIndexHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('modal-content-header')}>
          {this.props.intl.formatMessage(messages.contentHeaderMessage)}
        </p>
      </ModalLayout>
    );
  }
}
