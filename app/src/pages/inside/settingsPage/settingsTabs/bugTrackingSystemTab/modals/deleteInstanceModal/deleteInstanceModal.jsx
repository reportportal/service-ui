import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import { activeProjectSelector } from 'controllers/user';
import { updateExternalSystemAction, externalSystemSelector } from 'controllers/project';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import classNames from 'classnames/bind';
import { withModal, ModalLayout } from 'components/main/modal';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import styles from './deleteInstanceModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  deleteInstanceHeader: {
    id: 'DeleteInstanceModal.deleteInstanceHeader',
    defaultMessage: 'Delete project',
  },
  deleteInstanceSuccessMessage: {
    id: 'DeleteInstanceModal.deleteInstanceSuccessMessage',
    defaultMessage: 'Project settings were successfully updated',
  },
  deleteInstanceErrorMessage: {
    id: 'DeleteInstanceModal.deleteInstanceErrorMessage',
    defaultMessage: 'Failed to delete project settings: {message}',
  },
  deleteInstanceConfirmation: {
    id: 'DeleteInstanceModal.deleteInstanceConfirmation',
    defaultMessage:
      "Are you sure you want to remove {systemType} project <b>'{instanceTitle}'</b> from project settings?",
  },
});

@withModal('deleteInstanceModal')
@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
    externalSystems: externalSystemSelector(state),
  }),
  {
    showNotification,
    updateExternalSystemAction,
  },
)
@injectIntl
export class DeleteInstanceModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentProject: PropTypes.string.isRequired,
    externalSystems: PropTypes.array.isRequired,
    data: PropTypes.object,
    showNotification: PropTypes.func.isRequired,
    updateExternalSystemAction: PropTypes.func.isRequired,
  };
  static defaultProps = {
    data: {},
  };

  deleteInstance = (closeModal) => {
    const {
      intl,
      currentProject,
      externalSystems,
      data: { instanceId },
    } = this.props;
    fetch(URLS.externalSystemInstance(currentProject, instanceId), { method: 'delete' })
      .then(() => {
        const indexToRemove = externalSystems.findIndex((item) => item.id === instanceId);
        const updatedExternalSystemsInstances = [...externalSystems];
        updatedExternalSystemsInstances.splice(indexToRemove, 1);
        this.props.updateExternalSystemAction(updatedExternalSystemsInstances);
        this.props.showNotification({
          message: intl.formatMessage(messages.deleteInstanceSuccessMessage),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((error) => {
        this.props.showNotification({
          message: intl.formatMessage(messages.deleteInstanceErrorMessage, {
            message: error.message,
          }),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
    closeModal();
  };

  render() {
    const {
      intl,
      data: { systemType, instanceTitle },
    } = this.props;

    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: this.deleteInstance,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    return (
      <ModalLayout
        title={intl.formatMessage(messages.deleteInstanceHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('modal-content-message')}>
          {Parser(
            intl.formatMessage(messages.deleteInstanceConfirmation, { systemType, instanceTitle }),
          )}
        </p>
      </ModalLayout>
    );
  }
}
