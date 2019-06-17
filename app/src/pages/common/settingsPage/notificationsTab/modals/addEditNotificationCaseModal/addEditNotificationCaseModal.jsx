import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import className from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { validate } from 'common/utils';
import { NotificationCaseFormFields } from './notificationCaseFormFields';
import styles from './addEditNotificationCaseModal.scss';

const cx = className.bind(styles);

const messages = defineMessages({
  title: {
    id: 'AddEditNotificationCaseModal.title',
    defaultMessage: '{actionType} Notification Rule',
  },
  addRuleMessage: {
    id: 'AddEditNotificationCaseModal.newRuleMessage',
    defaultMessage: 'Add',
  },
  editRuleMessage: {
    id: 'AddEditNotificationCaseModal.editRuleMessage',
    defaultMessage: 'Edit',
  },
});

@withModal('addEditNotificationCaseModal')
@reduxForm({
  form: 'notificationCaseForm',
  validate: ({ recipients, informOwner, launchNames }) => ({
    recipients: (recipients && !recipients.length && !informOwner && 'recipientsHint') || undefined,
    launchNames:
      (launchNames &&
        launchNames.length &&
        !launchNames.some(validate.launchName) &&
        'launchesHint') ||
      undefined,
  }),
})
@injectIntl
export class AddEditNotificationCaseModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      notificationCase: PropTypes.object,
      onConfirm: PropTypes.func,
      isNewCase: PropTypes.bool,
    }),
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  componentDidMount() {
    this.props.initialize(this.props.data.notificationCase);
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  render() {
    const {
      intl: { formatMessage },
      data: { isNewCase, onConfirm },
      handleSubmit,
    } = this.props;

    return (
      <ModalLayout
        title={formatMessage(messages.title, {
          actionType: formatMessage(isNewCase ? messages.addRuleMessage : messages.editRuleMessage),
        })}
        okButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
          onClick: handleSubmit(onConfirm),
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
        className={cx('add-edit-notification-case-modal')}
      >
        <NotificationCaseFormFields />
      </ModalLayout>
    );
  }
}
