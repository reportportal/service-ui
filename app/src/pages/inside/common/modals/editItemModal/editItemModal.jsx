import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { activeProjectSelector } from 'controllers/user';
import { ModalLayout, withModal, ModalField, ModalContentHeading } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MarkdownEditor } from 'components/main/markdown';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { ITEM_TYPES } from './constants';
import styles from './editItemModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  tagsLabel: {
    id: 'EditItemModal.tagsLabel',
    defaultMessage: 'Tags',
  },
  tagsPlaceholder: {
    id: 'EditItemModal.tagsPlaceholder',
    defaultMessage: 'Enter tag name',
  },
  tagsHint: {
    id: 'EditItemModal.tagsHint',
    defaultMessage: 'Please enter 1 or more characters',
  },
  descriptionPlaceholder: {
    id: 'EditItemModal.descriptionPlaceholder',
    defaultMessage: 'Enter {type} description',
  },
  modalHeader: {
    id: 'EditItemModal.modalHeader',
    defaultMessage: 'Edit {type}',
  },
  launch: {
    id: 'EditItemModal.launch',
    defaultMessage: 'launch',
  },
  item: {
    id: 'EditItemModal.item',
    defaultMessage: 'item',
  },
  contentTitle: {
    id: 'EditItemModal.contentTitle',
    defaultMessage: '{type} details',
  },
  launchUpdateSuccess: {
    id: 'EditItemModal.launchUpdateSuccess',
    defaultMessage: 'Launch has been updated',
  },
  itemUpdateSuccess: {
    id: 'EditItemModal.itemUpdateSuccess',
    defaultMessage: 'Completed successfully!',
  },
});

@withModal('editItemModal')
@injectIntl
@reduxForm({
  form: 'editItemForm',
})
@connect(
  (state) => ({
    tagsSearchUrl: URLS.launchTagsSearch(activeProjectSelector(state)),
    currentProject: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
export class EditItemModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      item: PropTypes.object,
      type: PropTypes.string,
      fetchFunc: PropTypes.func,
    }).isRequired,
    initialize: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    tagsSearchUrl: PropTypes.string.isRequired,
    currentProject: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    this.props.initialize({
      description: this.props.data.item.description || '',
      tags: this.props.data.item.tags || [],
    });
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  formatTags = (tags) =>
    tags && !!tags.length ? tags.map((tag) => ({ value: tag, label: tag })) : [];
  parseTags = (options) => options.map((option) => option.value);

  updateItemAndCloseModal = (closeModal) => (formData) => {
    this.props.dirty && this.updateItem(formData);
    closeModal();
  };

  updateItem = (data) => {
    const {
      intl: { formatMessage },
      currentProject,
      data: { item, type, fetchFunc },
    } = this.props;

    fetch(URLS.launchesItemsUpdate(currentProject, item.id, type), {
      method: 'put',
      data,
    }).then(() => {
      this.props.showNotification({
        message: formatMessage(messages[`${type}UpdateSuccess`]),
        type: NOTIFICATION_TYPES.SUCCESS,
      });
      fetchFunc();
    });
  };

  render() {
    const {
      intl: { formatMessage },
      data: { item, type },
      handleSubmit,
      tagsSearchUrl,
    } = this.props;
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: (closeModal) => {
        handleSubmit(this.updateItemAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    return (
      <ModalLayout
        title={formatMessage(messages.modalHeader, { type: formatMessage(messages[type]) })}
        okButton={okButton}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <form>
          <ModalField>
            <ModalContentHeading
              text={formatMessage(messages.contentTitle, {
                type: formatMessage(messages[type]),
              })}
            />
          </ModalField>
          <ModalField>
            <div className={cx('item-name')}>
              {`${item.name}`}
              {type === ITEM_TYPES.launch && ` #${item.number}`}
            </div>
          </ModalField>
          <ModalField label={formatMessage(messages.tagsLabel)}>
            <FieldProvider name="tags" format={this.formatTags} parse={this.parseTags}>
              <InputTagsSearch
                placeholder={formatMessage(messages.tagsPlaceholder)}
                focusPlaceholder={formatMessage(messages.tagsHint)}
                minLength={1}
                async
                uri={tagsSearchUrl}
                makeOptions={this.formatTags}
                creatable
                showNewLabel
                multi
                removeSelected
              />
            </FieldProvider>
          </ModalField>
          <ModalField>
            <FieldProvider name="description">
              <MarkdownEditor
                placeholder={formatMessage(messages.descriptionPlaceholder, {
                  type: formatMessage(messages[type]),
                })}
              />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
