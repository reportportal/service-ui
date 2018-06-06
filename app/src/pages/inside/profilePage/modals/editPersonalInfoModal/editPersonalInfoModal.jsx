import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { validate } from 'common/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { reduxForm } from 'redux-form';
import { Input } from 'components/inputs/input';
import classNames from 'classnames/bind';
import styles from './editPersonalInfoModl.scss';

const LABEL_WIDTH = 90;
const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'EditPersonalInformationModal.header',
    defaultMessage: 'Edit personal information',
  },
  namePlaceholder: {
    id: 'EditPersonalInformationModal.namePlaceholder',
    defaultMessage: 'Enter user name',
  },
  emailPlaceholder: {
    id: 'EditPersonalInformationModal.emailPlaceholder',
    defaultMessage: 'Enter email',
  },
  nameLabel: {
    id: 'EditPersonalInformationModal.nameLabel',
    defaultMessage: 'User name',
  },
  emailLabel: {
    id: 'EditPersonalInformationModal.emailLabel',
    defaultMessage: 'Email',
  },
});

@withModal('editPersonalInformationModal')
@injectIntl
@reduxForm({
  form: 'editModal',
  validate: ({ name, email }) => ({
    name: (!name || !validate.name(name)) && 'profileUserName',
    email: (!email || !validate.email(email)) && 'profileEmail',
  }),
})
export class EditPersonalInformationModal extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    data: PropTypes.shape({
      onEdit: PropTypes.func,
      info: PropTypes.object,
    }).isRequired,
    initialize: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };
  componentDidMount() {
    this.props.initialize(this.props.data.info);
  }
  editAndCloseModal = (closeModal) => (formData) => {
    this.props.data.onEdit(formData);
    closeModal();
  };
  render() {
    const { intl, handleSubmit } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT),
      onClick: (closeModal) => {
        handleSubmit(this.editAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.header)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <form className={cx('form')}>
          <ModalField label={intl.formatMessage(messages.nameLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="name">
              <FieldErrorHint>
                <Input placeholder={intl.formatMessage(messages.namePlaceholder)} type="text" />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField label={intl.formatMessage(messages.emailLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="email">
              <FieldErrorHint>
                <Input placeholder={intl.formatMessage(messages.emailPlaceholder)} type="text" />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
