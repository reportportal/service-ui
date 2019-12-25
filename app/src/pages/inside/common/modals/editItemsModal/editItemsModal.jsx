/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { reduxForm, formPropTypes, formValues } from 'redux-form';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { validate } from 'common/utils/validation';
import { getUniqueAndCommonAttributes } from 'common/utils/attributeUtils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { activeProjectSelector } from 'controllers/user';
import {
  NOTIFICATION_TYPES,
  showNotification,
  showDefaultErrorNotification,
} from 'controllers/notification';
import { ModalField, ModalLayout, withModal } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MarkdownEditor } from 'components/main/markdown';
import { AttributeListField } from 'components/main/attributeList';
import { InputDropdown } from 'components/inputs/inputDropdown';
import track from 'react-tracking';
import styles from './editItemsModal.scss';

const cx = classNames.bind(styles);

const DESCRIPTION_LEAVE = 'LEAVE';
const DESCRIPTION_UPDATE = 'UPDATE';
const DESCRIPTION_CREATE = 'CREATE';

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
  [DESCRIPTION_LEAVE]: {
    id: 'EditItemsModal.descriptionLeaveLabel',
    defaultMessage: "Don't change",
  },
  [DESCRIPTION_UPDATE]: {
    id: 'EditItemsModal.descriptionAddLabel',
    defaultMessage: 'Add to existing descriptions',
  },
  [DESCRIPTION_CREATE]: {
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
  warningMessage: {
    id: 'EditItemsModal.warningMessage',
    defaultMessage: 'The attribute will be deleted for all launches after applying changes',
  },
});

const ATTRIBUTE_CREATE = 'CREATE';
const ATTRIBUTE_UPDATE = 'UPDATE';
const ATTRIBUTE_DELETE = 'DELETE';

const FIELD_LABEL_WIDTH = 120;

const makeDescriptionOptions = (formatMessage) => [
  {
    value: DESCRIPTION_LEAVE,
    label: formatMessage(messages[DESCRIPTION_LEAVE]),
  },
  {
    value: DESCRIPTION_UPDATE,
    label: formatMessage(messages[DESCRIPTION_UPDATE]),
  },
  {
    value: DESCRIPTION_CREATE,
    label: formatMessage(messages[DESCRIPTION_CREATE]),
  },
];

@withModal('editItemsModal')
@injectIntl
@reduxForm({
  form: 'editItemsForm',
  validate: ({ commonAttributes }) => ({
    commonAttributes: !validate.attributesArray(commonAttributes),
  }),
})
@formValues('descriptionAction', 'uniqueAttributes')
@connect(
  (state) => ({
    currentProject: activeProjectSelector(state),
  }),
  {
    showNotification,
    showDefaultErrorNotification,
  },
)
@track()
export class EditItemsModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      items: PropTypes.array,
      parentLaunch: PropTypes.object,
      type: PropTypes.string,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
    initialize: PropTypes.func.isRequired,
    currentProject: PropTypes.string.isRequired,
    descriptionAction: PropTypes.string,
    uniqueAttributes: PropTypes.array,
    intl: PropTypes.object.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    ...formPropTypes,
  };

  static defaultProps = {
    descriptionAction: DESCRIPTION_LEAVE,
    uniqueAttributes: [],
  };

  state = {
    warningMessageShown: false,
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

    this.deletedUniqueAttributes = [];
  }

  onChangeCommonAttributes = (e, attributes, oldAttributes) => {
    if (!validate.attributesArray(attributes)) return;

    const { array } = this.props;
    const saveHistory = (payload) => array.push('attributes', payload);

    // Delete attribute
    if (attributes.length < oldAttributes.length) {
      const deletedAttribute = this.findAttribute(oldAttributes, attributes);
      const deletedUniqueAttributeIndex = this.deletedUniqueAttributes.findIndex(
        (attribute) =>
          attribute.key === deletedAttribute.key && attribute.value === deletedAttribute.value,
      );
      saveHistory({
        action: ATTRIBUTE_DELETE,
        from: deletedAttribute,
      });

      if (deletedUniqueAttributeIndex !== -1) {
        this.deletedUniqueAttributes.slice(deletedUniqueAttributeIndex, 1);
        this.showWarningMessage();
      }
    } else {
      const attributeBeforeUpdate = this.findAttribute(oldAttributes, attributes);
      const updatedAttribute = this.findAttribute(attributes, oldAttributes);

      // Create attribute
      if (!attributeBeforeUpdate.value) {
        this.removeUniqueAttribute(updatedAttribute);

        saveHistory({
          action: ATTRIBUTE_CREATE,
          to: updatedAttribute,
        });
      } else {
        // Update attribute
        this.removeUniqueAttribute(updatedAttribute);

        const { edited, ...fromAttribute } = attributeBeforeUpdate;

        saveHistory({
          action: ATTRIBUTE_UPDATE,
          from: fromAttribute,
          to: updatedAttribute,
        });
      }
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
    const updatedUniqueAttributes = uniqueAttributes.filter(
      (uniqueAttribute) =>
        !(
          (uniqueAttribute.key === attribute.key || (!uniqueAttribute.key && !attribute.key)) &&
          uniqueAttribute.value === attribute.value
        ),
    );

    if (uniqueAttributes.length !== updatedUniqueAttributes.length) {
      this.deletedUniqueAttributes.push(attribute);
      change('uniqueAttributes', updatedUniqueAttributes);
    }
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
      data: { type, fetchFunc, eventsInfo },
      tracking,
    } = this.props;
    const fetchUrl =
      type === LAUNCH_ITEM_TYPES.launch
        ? URLS.launchesInfoUpdate(currentProject)
        : URLS.testItemsInfoUpdate(currentProject);
    const data = {
      ids,
      attributes: attributes.filter((attribute) =>
        attribute.from ? Boolean(attribute.from.value) : true,
      ),
    };

    if (descriptionAction !== DESCRIPTION_LEAVE) {
      data.description = {
        action: descriptionAction,
        comment: `${DESCRIPTION_UPDATE ? '\n' : ''}${description || ''}`,
      };
      tracking.trackEvent({
        ...eventsInfo.editDescription,
        label: `${eventsInfo.editDescription.label}${formatMessage(messages[descriptionAction])}`,
      });
    }

    fetch(fetchUrl, { method: 'put', data })
      .then(() => {
        fetchFunc();
        this.props.showNotification({
          message: formatMessage(messages.itemUpdateSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(this.props.showDefaultErrorNotification);
  };

  showWarningMessage = () => this.setState({ warningMessageShown: true });

  render() {
    const { warningMessageShown } = this.state;
    const {
      intl: { formatMessage },
      descriptionAction,
      uniqueAttributes,
      handleSubmit,
      data: { type, eventsInfo },
    } = this.props;
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: (closeModal) => handleSubmit(this.updateItemsAndCloseModal(closeModal))(),
      eventInfo: eventsInfo.saveBtn,
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
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
        closeIconEventInfo={eventsInfo.closeIcon}
        warningMessage={warningMessageShown ? formatMessage(messages.warningMessage) : ''}
      >
        <form>
          <ModalField
            label={formatMessage(messages.commonAttributesLabel)}
            labelWidth={FIELD_LABEL_WIDTH}
            alignLeft
          >
            <FieldProvider name="commonAttributes" onChange={this.onChangeCommonAttributes}>
              <AttributeListField
                keyURLCreator={this.getAttributeKeyURLCreator()}
                valueURLCreator={this.getAttributeValueURLCreator()}
              />
            </FieldProvider>
          </ModalField>
          {uniqueAttributes.length > 0 && (
            <ModalField
              label={formatMessage(messages.uniqueAttributesLabel)}
              labelWidth={FIELD_LABEL_WIDTH}
              alignLeft
            >
              <FieldProvider name="uniqueAttributes">
                <AttributeListField
                  disabled
                  keyURLCreator={this.getAttributeKeyURLCreator()}
                  valueURLCreator={this.getAttributeValueURLCreator()}
                />
              </FieldProvider>
            </ModalField>
          )}
          <ModalField
            label={formatMessage(messages.descriptionLabel)}
            labelWidth={FIELD_LABEL_WIDTH}
            alignLeft
          >
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
