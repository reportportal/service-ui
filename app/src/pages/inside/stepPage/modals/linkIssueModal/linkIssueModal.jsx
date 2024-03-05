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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { reduxForm, FieldArray } from 'redux-form';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { userIdSelector } from 'controllers/user';
import { projectKeySelector } from 'controllers/project';
import { namedAvailableBtsIntegrationsSelector } from 'controllers/plugins';
import { withModal } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { URLS } from 'common/urls';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import { fetch } from 'common/utils/fetch';
import { updateSessionItem } from 'common/utils/storageUtils';
import { RALLY } from 'common/constants/pluginNames';
import { BtsIntegrationSelector } from 'pages/inside/common/btsIntegrationSelector';
import { DarkModalLayout, ModalFooter } from 'components/main/modal/darkModalLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import { hideModalAction } from 'controllers/modal';
import { getDefaultIssueModalConfig } from '../postIssueModal/utils';
import { LinkIssueFields } from './linkIssueFields';
import { messages as makeDecisionMessages } from '../makeDecisionModal/messages';
import styles from './linkIssueModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  linkIssue: {
    id: 'LinkIssueModal.linkIssue',
    defaultMessage: 'Link Issue',
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
    issues: issues?.map((issue) => ({
      issueLink: bindMessageToValidator(validate.url, 'urlHint')(issue.issueLink),
      issueId: bindMessageToValidator(validate.issueId, 'issueIdHint')(issue.issueId),
    })),
  }),
})
@connect(
  (state) => ({
    userId: userIdSelector(state),
    namedBtsIntegrations: namedAvailableBtsIntegrationsSelector(state),
    projectKey: projectKeySelector(state),
  }),
  {
    showNotification,
    hideModalAction,
  },
)
@injectIntl
@track()
export class LinkIssueModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    projectKey: PropTypes.string.isRequired,
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
    }),
    hideModalAction: PropTypes.func,
    invalid: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
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
      data: { items, fetchFunc, eventsInfo },
      projectKey,
      tracking,
      namedBtsIntegrations,
    } = this.props;
    const { pluginName, integrationId } = this.state;
    const requestUrl = URLS.testItemsLinkIssues(projectKey);
    const {
      integrationParameters: { project, url },
    } = namedBtsIntegrations[pluginName].find((item) => item.id === integrationId);
    const testItemIds = items.map((item) => item.id);
    const issues = formData.issues.map((issue) => ({
      ticketId: issue.issueId,
      url: issue.issueLink,
      btsProject: project,
      btsUrl: url,
      pluginName,
    }));

    eventsInfo.loadBtn && tracking.trackEvent(eventsInfo.loadBtn(issues.length));

    fetch(requestUrl, {
      method: 'put',
      data: {
        issues,
        testItemIds,
      },
    })
      .then(() => {
        this.props.hideModalAction();
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

  onLink = () => {
    const { handleSubmit } = this.props;
    handleSubmit(this.onFormSubmit)();
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

  getFooterButtons = () => ({
    cancelButton: (
      <GhostButton
        onClick={this.props.hideModalAction}
        color="''"
        appearance="topaz"
        transparentBackground
      >
        {this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
      </GhostButton>
    ),
    okButton: (
      <GhostButton
        onClick={this.onLink}
        disabled={this.props.invalid}
        color="''"
        appearance="topaz"
      >
        {this.props.intl.formatMessage(messages.linkIssue)}
      </GhostButton>
    ),
  });

  render() {
    const {
      namedBtsIntegrations,
      data: { items, eventsInfo = {} },
      change,
      intl: { formatMessage },
    } = this.props;
    const { pluginName, integrationId } = this.state;

    return (
      <DarkModalLayout
        headerTitle={formatMessage(messages.linkIssue)}
        footer={
          <ModalFooter
            infoBlock={
              items.length > 1
                ? formatMessage(makeDecisionMessages.applyToItems, {
                    itemsCount: items.length,
                  })
                : formatMessage(makeDecisionMessages.applyToItem)
            }
            buttons={this.getFooterButtons()}
          />
        }
      >
        <form className={cx('form')}>
          <BtsIntegrationSelector
            namedBtsIntegrations={namedBtsIntegrations}
            pluginName={pluginName}
            integrationId={integrationId}
            onChangeIntegration={this.onChangeIntegration}
            onChangePluginName={this.onChangePlugin}
          />
          <FieldArray
            name="issues"
            change={change}
            component={LinkIssueFields}
            addEventInfo={eventsInfo.addNewIssue}
            withAutocomplete={pluginName !== RALLY}
          />
        </form>
      </DarkModalLayout>
    );
  }
}
