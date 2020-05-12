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
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
  userIdSelector,
} from 'controllers/user';
import { clearLogPageStackTrace } from 'controllers/log';
import { launchSelector } from 'controllers/testItem';
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
import { TestItemStatus } from 'pages/inside/common/testItemStatus';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { TestParameters } from 'pages/inside/common/testParameters';
import { validate } from 'common/utils/validation';
import { ContainerWithTabs } from 'components/main/containerWithTabs';
import { StackTrace } from 'pages/inside/common/stackTrace';
import { STEP_PAGE_EVENTS } from 'components/main/analytics/events/stepPageEvents';
import { messages } from './messages';
import styles from './testItemDetailsModal.scss';

const cx = classNames.bind(styles);

@withModal('testItemDetails')
@reduxForm({
  form: 'testItemDetails',
  validate: ({ attributes }) => ({
    attributes: !validate.attributesArray(attributes),
  }),
})
@connect(
  (state) => ({
    userAccountRole: userAccountRoleSelector(state),
    userProjectRole: activeProjectRoleSelector(state),
    userId: userIdSelector(state),
    currentProject: activeProjectSelector(state),
    launch: launchSelector(state),
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
    userProjectRole: PropTypes.string,
    userAccountRole: PropTypes.string.isRequired,
    userId: PropTypes.string,
    initialize: PropTypes.func.isRequired,
    dirty: PropTypes.bool,
    handleSubmit: PropTypes.func.isRequired,
    currentProject: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    clearLogPageStackTrace: PropTypes.func,
  };

  static defaultProps = {
    launch: {},
    userId: '',
    userProjectRole: '',
    dirty: false,
    clearLogPageStackTrace: () => {},
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
    } = this.props;
    return [
      {
        name: formatMessage(messages.detailsTabTitle),
        content: this.renderDetailsTab(editable),
      },
      {
        name: formatMessage(messages.stackTraceTabTitle),
        content: this.renderStackTraceTab(),
      },
    ];
  };

  testItemAttributeKeyURLCreator = (projectId) => {
    const {
      data: { item },
    } = this.props;
    return URLS.testItemAttributeKeysSearch(projectId, item.launchId || item.id);
  };

  testItemAttributeValueURLCreator = (projectId, key) => {
    const {
      data: { item },
    } = this.props;
    return URLS.testItemAttributeValuesSearch(projectId, item.launchId || item.id, key);
  };

  updateItemAndCloseModal = (closeModal) => (formData) => {
    this.props.dirty && this.updateItem(formData);
    closeModal();
  };

  updateItem = (data) => {
    const {
      intl: { formatMessage },
      currentProject,
      data: { item, type, fetchFunc, eventsInfo },
      tracking,
    } = this.props;

    if (item.description !== data.description) {
      tracking.trackEvent(eventsInfo.editDescription);
    }

    fetch(URLS.launchesItemsUpdate(currentProject, item.id, type), {
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

  renderDetailsTab = (editable) => {
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
          {getDuration(item.startTime, item.endTime)}
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
        <ModalField label={intl.formatMessage(messages.attributesLabel)}>
          <FieldProvider name="attributes">
            <AttributeListField
              disabled={!editable}
              keyURLCreator={this.testItemAttributeKeyURLCreator}
              valueURLCreator={this.testItemAttributeValueURLCreator}
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
        <div className={cx('label')}>{intl.formatMessage(messages.description)}</div>
        {editable ? (
          <ModalField>
            <FieldProvider name="description">
              <MarkdownEditor placeholder={intl.formatMessage(messages.descriptionPlaceholder)} />
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

  renderStackTraceTab = () => {
    const {
      data: { item },
    } = this.props;
    return (
      <div className={cx('stack-trace-tab')}>
        <StackTrace logItem={item} hideTime minHeight={508} />
      </div>
    );
  };

  render() {
    const {
      intl,
      data: { item, eventsInfo },
      launch,
      userAccountRole,
      userProjectRole,
      userId,
      handleSubmit,
    } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.SAVE),
      onClick: (closeModal) => {
        handleSubmit(this.updateItemAndCloseModal(closeModal))();
      },
      eventInfo: eventsInfo.saveBtn,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };

    const editable = canEditLaunch(
      userAccountRole,
      userProjectRole,
      item.owner ? userId === item.owner : userId === launch.owner,
    );
    return (
      <ModalLayout
        title={intl.formatMessage(messages.modalTitle)}
        okButton={editable ? okButton : undefined}
        cancelButton={cancelButton}
        closeConfirmation={editable ? this.getCloseConfirmationConfig() : undefined}
        warningMessage={editable ? intl.formatMessage(messages.launchWarning) : ''}
        contentClassName={cx('tab-container')}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <ContainerWithTabs data={this.getTabsConfig(editable)} customClass={cx('tab-header')} />
      </ModalLayout>
    );
  }
}
