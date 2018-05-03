import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { InputTextArea } from 'components/inputs/inputTextArea';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { validate } from 'common/utils';
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
    id: 'DashboardModal.dashboardDescriptionPlaceholder',
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
});
@withModal('dashboardAddEditModal')
@injectIntl
@reduxForm({
  form: 'addEditDashboard',
  validate: ({ name }) => ({
    name: (!name || !validate.dashboardName(name)) && 'dashboardNameHint',
  }),
})
export class AddEditModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    intl: intlShape.isRequired,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func,
  };

  static defaultProps = {
    data: {},
    initialize: () => {},
    handleSubmit: () => {},
  };

  componentDidMount() {
    this.props.initialize(this.props.data.dashboardItem);
  }

  submitFormAndCloseModal = (closeModal) => (dashboardItem) => {
    this.props.data.onSubmit(dashboardItem);
    closeModal();
  };

  render() {
    const { submitText, title, cancelText } = this.props.data;
    const { intl, handleSubmit } = this.props;
    const labelWidth = 70;

    return (
      <ModalLayout
        title={title}
        okButton={{
          text: submitText,
          onClick: (closeModal) => {
            handleSubmit(this.submitFormAndCloseModal(closeModal))();
          },
        }}
        cancelButton={{
          text: cancelText,
        }}
      >
        <form className={cx('add-dashboard-form')}>
          <ModalField
            label={intl.formatMessage(messages.dashboardNameLabel)}
            labelWidth={labelWidth}
          >
            <FieldProvider name="name" type="text">
              <FieldErrorHint>
                <Input placeholder={intl.formatMessage(messages.dashboardNamePlaceholder)} />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.dashboardDescriptionLabel)}
            labelWidth={labelWidth}
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
            labelWidth={labelWidth}
          >
            <FieldProvider name="share" format={Boolean} parse={Boolean}>
              <InputBigSwitcher />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
