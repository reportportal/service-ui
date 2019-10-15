import React, { Component } from 'react';
import { connect } from 'react-redux';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { validate, composeBoundValidators, bindMessageToValidator } from 'common/utils';
import { dashboardItemsSelector } from 'controllers/dashboard';
import styles from './addEditModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  dashboardNamePlaceholder: {
    id: 'DashboardForm.dashboardNamePlaceholder',
    defaultMessage: 'Enter Dashboard Name',
  },
  dashboardNameLabel: {
    id: 'DashboardForm.dashboardNameLabel',
    defaultMessage: 'Name',
  },
  dashboardDescriptionPlaceholder: {
    id: 'DashboardForm.dashboardDescriptionPlaceholder',
    defaultMessage: 'Enter Dashboard Description',
  },
  dashboardDescriptionLabel: {
    id: 'DashboardForm.dashboardDescriptionLabel',
    defaultMessage: 'Description',
  },
  dashboardShareLabel: {
    id: 'DashboardForm.dashboardShareLabel',
    defaultMessage: 'Share',
  },
  editModalTitle: {
    id: 'DashboardForm.editModalTitle',
    defaultMessage: 'Edit Dashboard',
  },
  editModalSubmitButtonText: {
    id: 'DashboardForm.editModalSubmitButtonText',
    defaultMessage: 'Update',
  },
  addModalTitle: {
    id: 'DashboardForm.addModalTitle',
    defaultMessage: 'Add New Dashboard',
  },
  addModalSubmitButtonText: {
    id: 'DashboardForm.addModalSubmitButtonText',
    defaultMessage: 'Add',
  },
  modalCancelButtonText: {
    id: 'DashboardForm.modalCancelButtonText',
    defaultMessage: 'Cancel',
  },
});

const LABEL_WIDTH = 90;

const createDashboardNameValidator = (dashboardItems, dashboardItem) =>
  composeBoundValidators([
    bindMessageToValidator(validate.dashboardName, 'dashboardNameHint'),
    bindMessageToValidator(
      validate.createDashboardNameUniqueValidator(dashboardItems, dashboardItem),
      'dashboardNameExistsHint',
    ),
  ]);

@withModal('dashboardAddEditModal')
@injectIntl
@track()
@connect((state) => ({
  dashboardItems: dashboardItemsSelector(state),
}))
@reduxForm({
  form: 'addEditDashboard',
  validate: ({ name }, { dashboardItems = [], data: { dashboardItem = {} } }) => ({
    name: createDashboardNameValidator(dashboardItems, dashboardItem)(name),
  }),
})
export class AddEditModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      dashboardItem: PropTypes.object,
      onSubmit: PropTypes.func,
      type: PropTypes.string,
      eventsInfo: PropTypes.object,
    }),
    intl: intlShape.isRequired,
    initialize: PropTypes.func,
    dirty: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    dashboardItems: PropTypes.array.isRequired,
  };

  static defaultProps = {
    data: {
      dashboardItem: {},
      onSubmit: () => {},
      type: '',
      eventsInfo: {},
    },
    initialize: () => {},
    handleSubmit: () => {},
  };

  componentDidMount() {
    this.props.initialize(this.props.data.dashboardItem);
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  submitFormAndCloseModal = (closeModal) => (item) => {
    const {
      tracking,
      data: { dashboardItem, eventsInfo = {} },
      dirty,
    } = this.props;
    if (dirty) {
      !dashboardItem && item.description && tracking.trackEvent(eventsInfo.changeDescription);
      this.props.data.onSubmit(item);
    }
    closeModal();
  };

  render() {
    const {
      intl,
      handleSubmit,
      data: { type, eventsInfo = {} },
    } = this.props;
    const submitText = intl.formatMessage(messages[`${type}ModalSubmitButtonText`]);
    const title = intl.formatMessage(messages[`${type}ModalTitle`]);
    const cancelText = intl.formatMessage(messages.modalCancelButtonText);

    return (
      <ModalLayout
        title={title}
        okButton={{
          text: submitText,
          onClick: (closeModal) => {
            this.props.tracking.trackEvent(eventsInfo.submitBtn);
            handleSubmit(this.submitFormAndCloseModal(closeModal))();
          },
        }}
        cancelButton={{
          text: cancelText,
          eventInfo: eventsInfo.cancelBtn,
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <form onSubmit={(event) => event.preventDefault()} className={cx('add-dashboard-form')}>
          <ModalField
            label={intl.formatMessage(messages.dashboardNameLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="name" type="text">
              <FieldErrorHint>
                <Input
                  maxLength={'128'}
                  placeholder={intl.formatMessage(messages.dashboardNamePlaceholder)}
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.dashboardDescriptionLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider
              name="description"
              placeholder={intl.formatMessage(messages.dashboardDescriptionPlaceholder)}
            >
              <InputTextArea />
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.dashboardShareLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="share" type="checkbox" format={Boolean} parse={Boolean}>
              <InputBigSwitcher onChangeEventInfo={eventsInfo.shareSwitcher} />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
