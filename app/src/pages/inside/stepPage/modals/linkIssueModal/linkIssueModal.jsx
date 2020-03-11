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
import { reduxForm, FieldArray } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { namedAvailableBtsIntegrationsSelector } from 'controllers/plugins';
import { ModalLayout, withModal } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { URLS } from 'common/urls';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import { fetch } from 'common/utils/fetch';
import { updateSessionItem } from 'common/utils/storageUtils';
import { RALLY } from 'common/constants/pluginNames';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { BtsIntegrationSelector } from 'pages/inside/common/btsIntegrationSelector';
import { getDefaultIssueModalConfig } from '../postIssueModal/utils';
import { LinkIssueFields } from './linkIssueFields';
import styles from './linkIssueModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  linkButton: {
    id: 'LinkIssueModal.linkButton',
    defaultMessage: 'Link',
  },
  title: {
    id: 'LinkIssueModal.title',
    defaultMessage: 'Link issue',
  },
  addIssueIdTitle: {
    id: 'LinkIssueModal.addIssueIdTitle',
    defaultMessage: 'Add issue id',
  },
  linkIssueSuccess: {
    id: 'LinkIssueModal.linkIssueSuccess',
    defaultMessage: 'Defect link successfully added',
  },
  linkIssueFailed: {
    id: 'LinkIssueModal.linkIssueFailed',
    defaultMessage: 'Failed to link issue',
  },
});

@withModal('linkIssueModal')
@reduxForm({
  form: 'linkIssueForm',
  validate: ({ issues }) => ({
    issues:
      issues &&
      issues.map((issue) => ({
        issueLink: bindMessageToValidator(validate.url, 'urlHint')(issue.issueLink),
        issueId: bindMessageToValidator(validate.issueId, 'issueIdHint')(issue.issueId),
      })),
  }),
})
@connect(
  (state) => ({
    userId: userIdSelector(state),
    requestUrl: URLS.testItemsLinkIssues(activeProjectSelector(state)),
    namedBtsIntegrations: namedAvailableBtsIntegrationsSelector(state),
  }),
  {
    showNotification,
  },
)
@injectIntl
export class LinkIssueModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    requestUrl: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    namedBtsIntegrations: PropTypes.object.isRequired,
    initialize: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      items: PropTypes.array,
      fetchFunc: PropTypes.func,
      eventsInfo: PropTypes.object,
    }).isRequired,
  };

  static defaultProps = {
    data: {
      items: [],
      fetchFunc: () => {},
      eventsInfo: {},
    },
  };

  constructor(props) {
    super(props);
    const { namedBtsIntegrations, userId } = props;
    const { pluginName, integration } = getDefaultIssueModalConfig(namedBtsIntegrations, userId);

    this.props.initialize({
      issues: [{}],
    });
    this.state = {
      pluginName,
      integrationId: integration.id,
    };
  }

  onFormSubmit = (formData) => {
    const {
      intl,
      userId,
      requestUrl,
      data: { items, fetchFunc },
      namedBtsIntegrations,
    } = this.props;
    const { pluginName, integrationId } = this.state;
    const {
      integrationParameters: { project, url },
    } = namedBtsIntegrations[pluginName].find((item) => item.id === integrationId);
    const testItemIds = items.map((item) => item.id);
    const issues = formData.issues.map((issue) => ({
      ticketId: issue.issueId,
      url: issue.issueLink,
      btsProject: project,
      btsUrl: url,
    }));

    fetch(requestUrl, {
      method: 'put',
      data: {
        issues,
        testItemIds,
      },
    })
      .then(() => {
        this.closeModal();
        fetchFunc();
        const sessionConfig = {
          pluginName,
          integrationId,
        };

        updateSessionItem(`${userId}_settings`, sessionConfig);
        this.props.showNotification({
          message: intl.formatMessage(messages.linkIssueSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.linkIssueFailed),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  onLink = () => (closeModal) => {
    this.closeModal = closeModal;
    this.props.handleSubmit(this.onFormSubmit)();
  };

  onChangePlugin = (pluginName) => {
    if (pluginName !== this.state.pluginName) {
      this.setState({
        pluginName,
        integrationId: this.props.namedBtsIntegrations[pluginName][0].id,
      });
    }
  };

  onChangeIntegration = (integrationId) => {
    if (integrationId !== this.state.integrationId) {
      this.setState({
        integrationId,
      });
    }
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  render() {
    const {
      intl,
      namedBtsIntegrations,
      data: { eventsInfo = {} },
    } = this.props;
    const okButton = {
      text: intl.formatMessage(messages.linkButton),
      onClick: this.onLink(),
      eventInfo: eventsInfo.loadBtn,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: eventsInfo.cancelBtn,
    };

    return (
      <ModalLayout
        title={
          <span className={cx('link-issue-title')}>
            {intl.formatMessage(messages.title)}
            <BetaBadge />
          </span>
        }
        okButton={okButton}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <h4 className={cx('add-issue-id-title')}>{intl.formatMessage(messages.addIssueIdTitle)}</h4>
        <div className={cx('link-issue-form-wrapper')}>
          <form>
            <BtsIntegrationSelector
              namedBtsIntegrations={namedBtsIntegrations}
              pluginName={this.state.pluginName}
              integrationId={this.state.integrationId}
              onChangeIntegration={this.onChangeIntegration}
              onChangePluginName={this.onChangePlugin}
            />
            <FieldArray
              name="issues"
              change={this.props.change}
              component={LinkIssueFields}
              addEventInfo={eventsInfo.addNewIssue}
              withAutocomplete={this.state.pluginName !== RALLY}
            />
          </form>
        </div>
      </ModalLayout>
    );
  }
}
