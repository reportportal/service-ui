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
import { connect } from 'react-redux';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Parser from 'html-react-parser';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal, ModalLayout, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { userRolesType } from 'common/constants/projectRoles';
import { userRolesSelector } from 'controllers/pages';
import { clearLogPageStackTrace } from 'controllers/log';
import { launchSelector } from 'controllers/testItem';
import { ExtensionLoader, extensionType } from 'components/extensionLoader';
import { MarkdownEditor, MarkdownViewer } from 'components/main/markdown';
import { getDuration } from 'common/utils/timeDateUtils';
import { AccordionContainer } from 'components/main/accordionContainer';
import { AttributeListField } from 'components/main/attributeList';
import { canEditLaunch } from 'common/utils/permissions';
import {
  showDefaultErrorNotification,
  showNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { testItemDetailsAddonSelector } from 'controllers/plugins/uiExtensions';
import { TestItemStatus } from 'pages/inside/common/testItemStatus';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { TestParameters } from 'pages/inside/common/testParameters';
import { commonValidators, validate } from 'common/utils/validation';
import { ContainerWithTabs } from 'components/main/containerWithTabs';
import { StackTrace } from 'pages/inside/common/stackTrace';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events/stepPageEvents';
import { projectKeySelector } from 'controllers/project';
import { messages } from './messages';
import styles from './testItemDetailsModal.scss';

const cx = classNames.bind(styles);

@withModal('testItemDetails')
@reduxForm({
  form: 'testItemDetails',
  validate: ({ attributes, description }) => ({
    attributes: !validate.attributesArray(attributes),
    description: commonValidators.createDescriptionValidator(description),
  }),
})
@connect(
  (state) => ({
    userRoles: userRolesSelector(state),
    launch: launchSelector(state),
    projectKey: projectKeySelector(state),
    extensions: testItemDetailsAddonSelector(state),
  }),
  {
    showNotification,
    showDefaultErrorNotification,
    clearLogPageStackTrace,
  },
)
@track()
@injectIntl
export class TestItemDetailsModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object,
      type: PropTypes.string,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
    launch: PropTypes.object,
    userRoles: userRolesType,
    initialize: PropTypes.func.isRequired,
    dirty: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    clearLogPageStackTrace: PropTypes.func,
    invalid: PropTypes.bool.isRequired,
    projectKey: PropTypes.string.isRequired,
    extensions: PropTypes.arrayOf(extensionType),
  };

  static defaultProps = {
    launch: {},
    userRoles: {},
    dirty: false,
    clearLogPageStackTrace: () => {},
    extensions: [],
  };

  componentDidMount() {
    this.props.initialize({
      description: this.props.data.item.description || '',
      attributes: this.props.data.item.attributes || [],
    });
    this.props.clearLogPageStackTrace();
  }

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  getTabsConfig = (editable) => {
    const {
      intl: { formatMessage },
      data: {
        eventsInfo: { detailsTab, stackTraceTab },
      },
    } = this.props;
    return [
      {
        name: formatMessage(messages.detailsTabTitle),
        content: this.renderDetailsTab(editable),
        eventInfo: { changeTab: detailsTab },
      },
      {
        name: formatMessage(messages.stackTraceTabTitle),
        content: this.renderStackTraceTab(),
        eventInfo: { changeTab: stackTraceTab },
      },
    ];
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

  updateItemAndCloseModal = (closeModal) => (formData) => {
    const {
      dirty,
      data: { item, eventsInfo },
      tracking,
    } = this.props;
    dirty && this.updateItem(formData);
    closeModal();

    if (eventsInfo.getSaveBtnEvent) {
      const isDescriptionUpdated = item.description !== formData.description;
      tracking.trackEvent(eventsInfo.getSaveBtnEvent(isDescriptionUpdated));
    }
  };

  updateItem = (data) => {
    const {
      intl: { formatMessage },
      projectKey,
      data: { item, type, fetchFunc, eventsInfo },
      tracking,
    } = this.props;

    if (item.description !== data.description) {
      tracking.trackEvent(eventsInfo.editDescription);
    }

    fetch(URLS.launchesItemsUpdate(projectKey, item.id, type), {
      method: 'put',
      data,
    })
      .then(() => {
        this.props.showNotification({
          message: formatMessage(messages.itemUpdateSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        fetchFunc();
      })
      .catch(this.props.showDefaultErrorNotification);
  };

  checkDescriptionLengthForHint = (description) => description.length > 1948;

  getDescriptionText = (description) => {
    const {
      intl: { formatMessage },
    } = this.props;
    return formatMessage(messages.descriptionHint, { length: description.length });
  };

  renderDetailsTabContent = (editable, { nameAddon, attributesAddon, descriptionAddon } = {}) => {
    const {
      intl,
      data: { item },
      tracking: { trackEvent },
    } = this.props;

    return (
      <div className={cx('details-tab')}>
        <div className={cx('name-row')}>
          <div className={cx('name')}>{item.name}</div>
          <div className={cx('status')}>
            {nameAddon}
            <TestItemStatus status={item.status} />
          </div>
        </div>
        <ModalField label={intl.formatMessage(messages.testCaseUId)}>
          <div className={cx('id')}>{item.uniqueId}</div>
        </ModalField>
        <ModalField label={intl.formatMessage(messages.testCaseId)}>
          <div className={cx('id')}>{item.testCaseId}</div>
        </ModalField>
        <ModalField label={intl.formatMessage(messages.duration)}>
          {getDuration(new Date(item.startTime).getTime(), new Date(item.endTime).getTime())}
        </ModalField>
        {item.codeRef && (
          <ModalField label={intl.formatMessage(messages.codeRef)}>
            <div className={cx('code-ref')} title={item.codeRef}>
              {item.codeRef}
              <CopyToClipboard
                text={item.codeRef}
                className={cx('copy')}
                onCopy={() => trackEvent(STEP_PAGE_EVENTS.COPY_CODE_REFERENCE_EDIT_ITEM_MODAL)}
              >
                {Parser(IconDuplicate)}
              </CopyToClipboard>
            </div>
          </ModalField>
        )}
        <ModalField
          label={intl.formatMessage(messages.attributesLabel)}
          tip={editable && attributesAddon}
          tipPosition="right"
        >
          <FieldProvider name="attributes">
            <AttributeListField
              disabled={!editable}
              keyURLCreator={this.testItemAttributeKeyURLCreator}
              valueURLCreator={this.testItemAttributeValueURLCreator}
              eventsInfo={this.props.data.eventsInfo}
            />
          </FieldProvider>
        </ModalField>
        {item.parameters && (
          <Fragment>
            <div className={cx('label')}>{intl.formatMessage(messages.parametersLabel)}</div>
            <ModalField>
              <ScrollWrapper autoHeight autoHeightMax={210}>
                <TestParameters parameters={item.parameters} />
              </ScrollWrapper>
            </ModalField>
          </Fragment>
        )}
        <div className={cx('label', 'description')}>
          {intl.formatMessage(messages.description)}
          {editable && descriptionAddon}
        </div>
        {editable ? (
          <ModalField>
            <FieldProvider name="description">
              <FieldErrorHint provideHint={false}>
                <MarkdownEditor
                  placeholder={intl.formatMessage(messages.descriptionPlaceholder)}
                  provideErrorHint
                  hint={{
                    hintText: this.getDescriptionText,
                    hintCondition: this.checkDescriptionLengthForHint,
                  }}
                  controlled={!!descriptionAddon}
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
        ) : (
          item.description && (
            <AccordionContainer maxHeight={170}>
              {({ setupRef, className }) => (
                <div ref={setupRef} className={className}>
                  <ModalField>
                    <MarkdownViewer value={item.description} />
                  </ModalField>
                </div>
              )}
            </AccordionContainer>
          )
        )}
      </div>
    );
  };

  renderDetailsTab = (editable) => {
    const {
      data: { item },
      extensions,
    } = this.props;

    return extensions.length
      ? extensions.map((extension) => (
          <ExtensionLoader
            key={extension.name}
            extension={extension}
            item={item}
            editable={editable}
          >
            {this.renderDetailsTabContent}
          </ExtensionLoader>
        ))
      : this.renderDetailsTabContent(editable);
  };

  renderStackTraceTab = () => {
    const {
      data: { item, eventsInfo },
    } = this.props;
    return (
      <div className={cx('stack-trace-tab')}>
        <StackTrace logItem={item} hideAdditionalCells minHeight={508} eventsInfo={eventsInfo} />
      </div>
    );
  };

  render() {
    const {
      intl,
      data: { eventsInfo },
      userRoles,
      handleSubmit,
    } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: (closeModal) => {
        handleSubmit(this.updateItemAndCloseModal(closeModal))();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };

    const editable = canEditLaunch(userRoles);
    return (
      <ModalLayout
        title={intl.formatMessage(messages.modalTitle)}
        okButton={editable ? okButton : undefined}
        cancelButton={cancelButton}
        closeConfirmation={editable ? this.getCloseConfirmationConfig() : undefined}
        warningMessage={
          (this.props.invalid && intl.formatMessage(COMMON_LOCALE_KEYS.changesWarning)) ||
          (editable ? intl.formatMessage(messages.launchWarning) : '')
        }
        warningType={!this.props.invalid && 'info'}
        contentClassName={cx('tab-container')}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <ContainerWithTabs data={this.getTabsConfig(editable)} customClass={cx('tab-header')} />
      </ModalLayout>
    );
  }
}
