import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { reduxForm, formPropTypes, formValues } from 'redux-form';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { getUniqueAndCommonAttributes } from 'common/utils/attributeUtils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { activeProjectSelector } from 'controllers/user';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { ModalField, ModalLayout, withModal } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MarkdownEditor } from 'components/main/markdown';
import { AttributeListField } from 'components/main/attributeList';
import { InputDropdown } from 'components/inputs/inputDropdown';
import styles from './editItemsModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  modalHeader: {
    id: 'EditItemsModal.modalHeader',
    defaultMessage: 'Edit {type}',
  },
  commonAttributesLabel: {
    id: 'EditItemsModal.commonAttributesLabel',
    defaultMessage: 'Common attributes',
  },
  uniqueAttributesLabel: {
    id: 'EditItemsModal.uniqueAttributesLabel',
    defaultMessage: 'Unique attributes',
  },
  descriptionLabel: {
    id: 'EditItemsModal.descriptionLabel',
    defaultMessage: 'Description',
  },
  descriptionPlaceholder: {
    id: 'EditItemsModal.descriptionPlaceholder',
    defaultMessage: 'Enter description',
  },
  descriptionLeaveLabel: {
    id: 'EditItemsModal.descriptionLeaveLabel',
    defaultMessage: "Don't change",
  },
  descriptionAddLabel: {
    id: 'EditItemsModal.descriptionAddLabel',
    defaultMessage: 'Add to existing descriptions',
  },
  descriptionReplaceLabel: {
    id: 'EditItemsModal.descriptionReplaceLabel',
    defaultMessage: 'Replace for all items',
  },
  launches: {
    id: 'EditItemsModal.launches',
    defaultMessage: 'launches',
  },
  items: {
    id: 'EditItemsModal.items',
    defaultMessage: 'items',
  },
  itemUpdateSuccess: {
    id: 'EditItemsModal.itemUpdateSuccess',
    defaultMessage: 'Completed successfully!',
  },
});

const ATTRIBUTE_CREATE = 'CREATE';
const ATTRIBUTE_UPDATE = 'UPDATE';
const ATTRIBUTE_DELETE = 'DELETE';

const DESCRIPTION_LEAVE = 'LEAVE';
const DESCRIPTION_UPDATE = 'UPDATE';
const DESCRIPTION_CREATE = 'CREATE';

const makeDescriptionOptions = (formatMessage) => [
  {
    value: DESCRIPTION_LEAVE,
    label: formatMessage(messages.descriptionLeaveLabel),
  },
  {
    value: DESCRIPTION_UPDATE,
    label: formatMessage(messages.descriptionAddLabel),
  },
  {
    value: DESCRIPTION_CREATE,
    label: formatMessage(messages.descriptionReplaceLabel),
  },
];

@withModal('editItemsModal')
@injectIntl
@reduxForm({
  form: 'editItemsForm',
})
@formValues('descriptionAction', 'uniqueAttributes')
@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
  }),
  {
    showNotification,
  },
)
export class EditItemsModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      items: PropTypes.array,
      parentLaunch: PropTypes.object,
      type: PropTypes.string,
      fetchFunc: PropTypes.func,
    }).isRequired,
    initialize: PropTypes.func.isRequired,
    currentProject: PropTypes.string.isRequired,
    descriptionAction: PropTypes.string,
    uniqueAttributes: PropTypes.array,
    intl: intlShape.isRequired,
    ...formPropTypes,
  };

  static defaultProps = {
    descriptionAction: DESCRIPTION_LEAVE,
    uniqueAttributes: [],
  };

  componentDidMount() {
    const {
      initialize,
      data: { items },
    } = this.props;
    const attributes = getUniqueAndCommonAttributes(items);

    initialize({
      ids: items.map((item) => item.id),
      commonAttributes: attributes.common,
      uniqueAttributes: attributes.unique,
      attributes: [],
      descriptionAction: DESCRIPTION_LEAVE,
    });
  }

  onChangeCommonAttributes = (e, attributes, oldAttributes) => {
    const { array } = this.props;
    const saveHistory = (payload) => array.push('attributes', payload);

    // Create attribute
    if (attributes.length > oldAttributes.length) {
      const createdAttribute = this.findAttribute(attributes, oldAttributes);

      this.removeUniqueAttribute(createdAttribute);

      saveHistory({
        action: ATTRIBUTE_CREATE,
        to: createdAttribute,
      });

      // Delete attribute
    } else if (attributes.length < oldAttributes.length) {
      const deletedAttribute = this.findAttribute(oldAttributes, attributes);

      saveHistory({
        action: ATTRIBUTE_DELETE,
        from: deletedAttribute,
      });

      // Update attribute
    } else {
      const attributeBeforeUpdate = this.findAttribute(oldAttributes, attributes);
      const updatedAttribute = this.findAttribute(attributes, oldAttributes);

      this.removeUniqueAttribute(updatedAttribute);

      saveHistory({
        action: ATTRIBUTE_UPDATE,
        from: attributeBeforeUpdate,
        to: updatedAttribute,
      });
    }
  };

  getAttributeKeyURLCreator = () => (activeProject) => {
    const {
      data: { type, parentLaunch },
    } = this.props;

    return type === LAUNCH_ITEM_TYPES.launch
      ? URLS.launchAttributeKeysSearch(activeProject)
      : URLS.testItemAttributeKeysSearch(activeProject, parentLaunch.id);
  };

  getAttributeValueURLCreator = () => (activeProject, key) => {
    const {
      data: { type, parentLaunch },
    } = this.props;

    return type === LAUNCH_ITEM_TYPES.launch
      ? URLS.launchAttributeValuesSearch(activeProject, key)
      : URLS.testItemAttributeValuesSearch(activeProject, parentLaunch.id, key);
  };

  removeUniqueAttribute = (attribute) => {
    const { change, uniqueAttributes } = this.props;

    change(
      'uniqueAttributes',
      uniqueAttributes.filter(
        (uniqueAttribute) =>
          !(uniqueAttribute.key === attribute.key && uniqueAttribute.value === attribute.value),
      ),
    );
  };

  findAttribute = (sourceAttributes, targetAttributes) =>
    sourceAttributes.find(
      (attribute) =>
        !targetAttributes.find(
          (oldAttribute) =>
            oldAttribute.key === attribute.key && oldAttribute.value === attribute.value,
        ),
    );

  updateItemsAndCloseModal = (closeModal) => (formData) => {
    this.props.dirty && this.updateItems(formData);
    closeModal();
  };

  updateItems = ({ ids, attributes, description, descriptionAction }) => {
    const {
      intl: { formatMessage },
      currentProject,
      data: { type, fetchFunc },
    } = this.props;
    const fetchUrl =
      type === LAUNCH_ITEM_TYPES.launch
        ? URLS.launchesInfoUpdate(currentProject)
        : URLS.testItemsInfoUpdate(currentProject);
    const data = {
      ids,
      attributes,
    };

    if (description && descriptionAction !== DESCRIPTION_LEAVE) {
      data.description = {
        action: descriptionAction,
        comment: description,
      };
    }

    fetch(fetchUrl, { method: 'put', data }).then(() => {
      this.props.showNotification({
        message: formatMessage(messages.itemUpdateSuccess),
        type: NOTIFICATION_TYPES.SUCCESS,
      });
      fetchFunc();
    });
  };

  render() {
    const {
      intl: { formatMessage },
      descriptionAction,
      uniqueAttributes,
      handleSubmit,
      data: { type },
    } = this.props;
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: (closeModal) => handleSubmit(this.updateItemsAndCloseModal(closeModal))(),
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };

    return (
      <ModalLayout
        title={formatMessage(messages.modalHeader, {
          type: formatMessage(
            type === LAUNCH_ITEM_TYPES.launch ? messages.launches : messages.items,
          ),
        })}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <form>
          <ModalField label={formatMessage(messages.commonAttributesLabel)}>
            <FieldProvider name="commonAttributes" onChange={this.onChangeCommonAttributes}>
              <AttributeListField
                keyURLCreator={this.getAttributeKeyURLCreator()}
                valueURLCreator={this.getAttributeValueURLCreator()}
              />
            </FieldProvider>
          </ModalField>
          {uniqueAttributes.length > 0 && (
            <ModalField label={formatMessage(messages.uniqueAttributesLabel)}>
              <FieldProvider name="uniqueAttributes">
                <AttributeListField
                  disabled
                  keyURLCreator={this.getAttributeKeyURLCreator()}
                  valueURLCreator={this.getAttributeValueURLCreator()}
                />
              </FieldProvider>
            </ModalField>
          )}
          <ModalField label={formatMessage(messages.descriptionLabel)}>
            <div className={cx('description-dropdown-wrapper')}>
              <FieldProvider name="descriptionAction">
                <InputDropdown options={makeDescriptionOptions(formatMessage)} />
              </FieldProvider>
            </div>
          </ModalField>
          {descriptionAction !== DESCRIPTION_LEAVE && (
            <ModalField>
              <FieldProvider name="description">
                <MarkdownEditor placeholder={formatMessage(messages.descriptionPlaceholder)} />
              </FieldProvider>
            </ModalField>
          )}
        </form>
      </ModalLayout>
    );
  }
}
