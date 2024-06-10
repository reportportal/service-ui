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

import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Parser from 'html-react-parser';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import { fetch } from 'common/utils/fetch';
import { commonValidators, validate } from 'common/utils/validation';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCH_ITEM_TYPES } from 'common/constants/launchItemTypes';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { userRolesType } from 'common/constants/projectRoles';
import { userRolesSelector } from 'controllers/user';
import { formatItemName } from 'controllers/testItem';
import { SectionHeader } from 'components/main/sectionHeader';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { MarkdownEditor, MarkdownViewer } from 'components/main/markdown';
import { AttributeListField } from 'components/main/attributeList';
import { AccordionContainer } from 'components/main/accordionContainer';
import { canEditLaunch } from 'common/utils/permissions';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { TestParameters } from 'pages/inside/common/testParameters';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { projectKeySelector } from 'controllers/project';
import styles from './editItemModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  attributesLabel: {
    id: 'EditItemModal.attributesLabel',
    defaultMessage: 'Attributes',
  },
  uuidLabel: {
    id: 'EditItemModal.uuidLabel',
    defaultMessage: 'UUID:',
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
  launchWarning: {
    id: 'EditItemModal.launchWarning',
    defaultMessage:
      'Change of description and attributes can affect your filtering results, widgets, trends',
  },
  codeRef: {
    id: 'TestItemDetailsModal.codeRef',
    defaultMessage: 'Code reference:',
  },
  description: {
    id: 'TestItemDetailsModal.description',
    defaultMessage: 'Description:',
  },
  parametersLabel: {
    id: 'TestItemDetailsModal.parametersLabel',
    defaultMessage: 'Parameters:',
  },
  descriptionHint: {
    id: 'EditItemModal.descriptionAdviceHint',
    defaultMessage: 'You used {length} of 2048 symbols',
  },
});

@withModal('editItemModal')
@injectIntl
@track()
@reduxForm({
  form: 'editItemForm',
  validate: ({ attributes, description }) => ({
    attributes: !validate.attributesArray(attributes),
    description: commonValidators.createDescriptionValidator(description),
  }),
})
@connect(
  (state) => ({
    userRoles: userRolesSelector(state),
    projectKey: projectKeySelector(state),
  }),
  {
    showNotification,
  },
)
export class EditItemModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object,
      parentLaunch: PropTypes.object,
      type: PropTypes.string,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
    userRoles: userRolesType,
    initialize: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    invalid: PropTypes.bool.isRequired,
    projectKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    userRoles: {},
  };

  componentDidMount() {
    this.props.initialize({
      description: this.props.data.item.description || '',
      attributes: this.props.data.item.attributes || [],
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

  getAttributeKeyURLCreator = () => {
    const {
      data: { type },
    } = this.props;
    return type === LAUNCH_ITEM_TYPES.launch
      ? URLS.launchAttributeKeysSearch
      : this.testItemAttributeKeyURLCreator;
  };

  getAttributeValueURLCreator = () => {
    const {
      data: { type },
    } = this.props;
    return type === LAUNCH_ITEM_TYPES.launch
      ? URLS.launchAttributeValuesSearch
      : this.testItemAttributeValueURLCreator;
  };

  updateItemAndCloseModal = (closeModal) => (formData, dispatch, props) => {
    const {
      data: { eventsInfo },
      tracking,
    } = this.props;
    if (props.data.item.description !== formData.description) {
      tracking.trackEvent(eventsInfo.EDIT_ITEM_DESCRIPTION);
    }
    this.props.dirty && this.updateItem(formData);
    closeModal();
  };

  updateItem = (data) => {
    const {
      intl: { formatMessage },
      projectKey,
      data: { item, type, fetchFunc },
    } = this.props;

    fetch(URLS.launchesItemsUpdate(projectKey, item.id, type), {
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

  testItemAttributeKeyURLCreator = (projectKey) => {
    const {
      data: { item },
    } = this.props;
    return URLS.testItemAttributeKeysSearch(projectKey, item.launchId || item.id);
  };

  testItemAttributeValueURLCreator = (projectKey, key) => {
    const {
      data: { item },
    } = this.props;
    return URLS.testItemAttributeValuesSearch(projectKey, item.launchId || item.id, key);
  };

  onClickCopyUUID = () => {
    const {
      data: { eventsInfo },
      tracking,
    } = this.props;
    eventsInfo.CLICK_COPY_ICON_UUID && tracking.trackEvent(eventsInfo.CLICK_COPY_ICON_UUID);
  };

  checkDescriptionLengthForHint = (description) => description.length > 1948;

  getDescriptionText = (description) => {
    const {
      intl: { formatMessage },
    } = this.props;
    return formatMessage(messages.descriptionHint, { length: description.length });
  };

  render() {
    const {
      intl: { formatMessage },
      data: { item, type, eventsInfo },
      handleSubmit,
      userRoles,
      tracking,
    } = this.props;
    const okButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: (closeModal) => {
        tracking.trackEvent(eventsInfo.SAVE_BTN_EDIT_ITEM_MODAL);
        handleSubmit(this.updateItemAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.CANCEL_BTN_EDIT_ITEM_MODAL,
    };

    const editable = canEditLaunch(userRoles);

    return (
      <ModalLayout
        title={formatMessage(messages.modalHeader, { type: formatMessage(messages[type]) })}
        okButton={editable ? okButton : undefined}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.CLOSE_ICON_EDIT_ITEM_MODAL}
        warningMessage={
          (this.props.invalid && formatMessage(COMMON_LOCALE_KEYS.changesWarning)) ||
          (type === LAUNCH_ITEM_TYPES.launch && editable && formatMessage(messages.launchWarning))
        }
        warningType={!this.props.invalid && 'info'}
      >
        <form>
          <ModalField>
            <SectionHeader
              text={formatMessage(messages.contentTitle, {
                type: formatMessage(messages[type]),
              })}
            />
          </ModalField>
          <ModalField>
            <div title={item.name} className={cx('item-name')}>
              {formatItemName(item.name)}
              {type === LAUNCH_ITEM_TYPES.launch && ` #${item.number}`}
            </div>
          </ModalField>
          {item.uuid && (
            <ModalField label={formatMessage(messages.uuidLabel)}>
              <div title={item.uuid} className={cx('item-uuid')}>
                {formatItemName(item.uuid)}
                <CopyToClipboard
                  text={item.uuid}
                  onCopy={this.onClickCopyUUID}
                  className={cx('copy')}
                >
                  {Parser(IconDuplicate)}
                </CopyToClipboard>
              </div>
            </ModalField>
          )}
          <ModalField label={formatMessage(messages.attributesLabel)}>
            <FieldProvider name="attributes">
              <AttributeListField
                keyURLCreator={this.getAttributeKeyURLCreator()}
                valueURLCreator={this.getAttributeValueURLCreator()}
                disabled={!editable}
              />
            </FieldProvider>
          </ModalField>
          {item.codeRef && (
            <ModalField label={formatMessage(messages.codeRef)}>
              <div className={cx('code-ref')} title={item.codeRef}>
                {item.codeRef}
                <CopyToClipboard text={item.codeRef} className={cx('copy')}>
                  {Parser(IconDuplicate)}
                </CopyToClipboard>
              </div>
            </ModalField>
          )}
          {item.parameters && (
            <Fragment>
              <div className={cx('label')}>{formatMessage(messages.parametersLabel)}</div>
              <ModalField>
                <ScrollWrapper autoHeight autoHeightMax={210}>
                  <TestParameters parameters={item.parameters} />
                </ScrollWrapper>
              </ModalField>
            </Fragment>
          )}
          {editable ? (
            <ModalField>
              <FieldProvider name="description">
                <FieldErrorHint provideHint={false}>
                  <MarkdownEditor
                    placeholder={formatMessage(messages.descriptionPlaceholder, {
                      type: formatMessage(messages[type]),
                    })}
                    provideErrorHint
                    hint={{
                      hintText: this.getDescriptionText,
                      hintCondition: this.checkDescriptionLengthForHint,
                    }}
                  />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>
          ) : (
            <Fragment>
              <div className={cx('label')}>{formatMessage(messages.description)}</div>
              <ModalField>
                <AccordionContainer maxHeight={170}>
                  {({ setupRef, className }) => (
                    <div ref={setupRef} className={className}>
                      <MarkdownViewer value={item.description} />
                    </div>
                  )}
                </AccordionContainer>
              </ModalField>
            </Fragment>
          )}
        </form>
      </ModalLayout>
    );
  }
}
