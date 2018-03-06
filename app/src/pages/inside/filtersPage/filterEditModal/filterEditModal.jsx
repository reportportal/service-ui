import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MarkdownEditor } from 'components/main/markdown';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { validate } from 'common/utils';

const messages = defineMessages({
  name: {
    id: 'Filter.name',
    defaultMessage: 'Name',
  },
  namePlaceholder: {
    id: 'Filter.namePlaceholder',
    defaultMessage: 'Enter filter name',
  },
  description: {
    id: 'Filter.description',
    defaultMessage: 'Description',
  },
  descriptionPlaceholder: {
    id: 'Filter.descriptionPlaceholder',
    defaultMessage: 'Enter filter description',
  },
  share: {
    id: 'Filters.share',
    defaultMessage: 'Share',
  },
  edit: {
    id: 'Filter.edit',
    defaultMessage: 'Edit filter',
  },
});

@withModal('filterEditModal')
@injectIntl
@reduxForm({
  form: 'filterEditForm',
  validate: ({ name }) => ({ name: (!name || !validate.filterName(name)) && 'filterNameError' }),
})
export class FilterEditModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      filter: PropTypes.object,
      onEdit: PropTypes.func,
    }).isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    this.props.initialize(this.props.data.filter);
  }

  saveFilterAndCloseModal = closeModal => (values) => {
    this.props.data.onEdit(values);
    closeModal();
  };

  render() {
    const { intl, handleSubmit } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CONFIRM),
      onClick: (closeModal) => {
        handleSubmit(this.saveFilterAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.edit)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <form>
          <ModalField label={intl.formatMessage(messages.name)}>
            <FieldProvider name="name">
              <FieldErrorHint>
                <Input withBorder placeholder={intl.formatMessage(messages.namePlaceholder)} />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField>
            <FieldProvider name="description">
              <MarkdownEditor placeholder={intl.formatMessage(messages.descriptionPlaceholder)} />
            </FieldProvider>
          </ModalField>
          <ModalField label={intl.formatMessage(messages.share)}>
            <FieldProvider name="share" format={Boolean} parse={Boolean}>
              <InputBigSwitcher />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
