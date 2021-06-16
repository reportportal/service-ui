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
import { withModal } from 'components/main/modal';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { URLS } from 'common/urls';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import { fetch } from 'common/utils/fetch';
import { updateSessionItem } from 'common/utils/storageUtils';
import { RALLY } from 'common/constants/pluginNames';
import { BtsIntegrationSelector } from 'pages/inside/common/btsIntegrationSelector';
import { DarkModalLayout } from 'components/main/modal/darkModalLayout';
import { GhostButton } from 'components/buttons/ghostButton';
import { hideModalAction } from 'controllers/modal';
import { ItemsList } from '../makeDecisionModal/optionsSection/itemsList';
import { getDefaultIssueModalConfig } from '../postIssueModal/utils';
import { ERROR_LOGS_SIZE } from '../makeDecisionModal/constants';
import { LinkIssueFields } from './linkIssueFields';
import styles from './linkIssueModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  link: {
    id: 'LinkIssueModal.link',
    defaultMessage: 'Link',
  },
  linkIssue: {
    id: 'LinkIssueModal.linkIssue',
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
  linkIssueForTheTest: {
    id: 'LinkIssueModal.linkIssueForTheTest',
    defaultMessage: 'Link Issue to the test {launchNumber}',
  },
  linkIssueFailed: {
    id: 'LinkIssueModal.linkIssueFailed',
    defaultMessage: 'Failed to link issue',
  },
  cancel: {
    id: 'LinkIssueModal.cancel',
    defaultMessage: 'Cancel',
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
    activeProject: activeProjectSelector(state),
  }),
  {
    showNotification,
    hideModalAction,
  },
)
@injectIntl
export class LinkIssueModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    requestUrl: PropTypes.string.isRequired,
    activeProject: PropTypes.string.isRequired,
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
    hideModalAction: PropTypes.func,
    invalid: PropTypes.bool,
  };

  static defaultProps = {
    data: {
      items: [],
      fetchFunc: () => {},
      eventsInfo: {},
    },
  };

  isBulkOperation = this.props.data.items.length > 1;

  constructor(props) {
    super(props);
    const {
      namedBtsIntegrations,
      userId,
      data: { items },
    } = props;
    const { pluginName, integration } = getDefaultIssueModalConfig(namedBtsIntegrations, userId);
    const currentItems = this.isBulkOperation
      ? items.map((item) => {
          return { ...item, itemId: item.id };
        })
      : items;

    this.props.initialize({
      issues: [{}],
    });
    this.state = {
      pluginName,
      integrationId: integration.id,
      loading: false,
      testItems: currentItems,
      selectedItems: currentItems,
    };
  }

  onFormSubmit = (formData) => {
    const {
      intl,
      userId,
      requestUrl,
      data: { fetchFunc },
      namedBtsIntegrations,
    } = this.props;
    const { pluginName, integrationId, selectedItems } = this.state;
    const {
      integrationParameters: { project, url },
    } = namedBtsIntegrations[pluginName].find((item) => item.id === integrationId);
    const testItemIds = selectedItems.map((item) => item.id);
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
    this.props.hideModalAction();
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

  componentDidMount() {
    const { intl, activeProject } = this.props;
    const { testItems } = this.state;
    const fetchLogs = () => {
      this.setState({ loading: true });
      let testItemLogRequest = [];
      let requests;
      if (this.isBulkOperation) {
        testItems.map((elem) => {
          return testItemLogRequest.push(
            fetch(URLS.logItemStackTrace(activeProject, elem.path, ERROR_LOGS_SIZE)),
          );
        });
        requests = testItemLogRequest;
      } else {
        testItemLogRequest = fetch(
          URLS.logItemStackTrace(activeProject, testItems[0].path, ERROR_LOGS_SIZE),
        );
        requests = [testItemLogRequest];
      }

      Promise.all(requests)
        .then((responses) => {
          const [testItemRes] = responses;
          const testItemLogs = this.isBulkOperation
            ? responses.map((item) => item.content)
            : testItemRes.content;
          const items = [];
          this.isBulkOperation
            ? testItems.map((elem, i) => {
                return items.push({ ...elem, logs: testItemLogs[i] });
              })
            : items.push({ ...testItems[0], logs: testItemLogs });
          this.setState({
            testItems: items,
            loading: false,
          });
        })
        .catch(() => {
          this.setState({
            testItems: [],
            selectedItems: [],
            loading: false,
          });
          this.props.showNotification({
            message: intl.formatMessage(messages.linkIssueFailed),
            type: NOTIFICATION_TYPES.ERROR,
          });
        });
    };
    fetchLogs();
  }

  renderIssueFormHeaderElements = () => {
    const {
      intl: { formatMessage },
      invalid,
    } = this.props;
    return (
      <>
        <GhostButton
          onClick={() => this.props.hideModalAction()}
          disabled={false}
          transparentBorder
          transparentBackground
          appearance="topaz"
        >
          {formatMessage(messages.cancel)}
        </GhostButton>
        <GhostButton onClick={this.onLink} disabled={invalid} color="''" appearance="topaz">
          {formatMessage(messages.linkIssue)}
        </GhostButton>
      </>
    );
  };
  renderTitle = (collapsedRightSection) => {
    const {
      data: { items },
      intl: { formatMessage },
    } = this.props;
    return collapsedRightSection
      ? formatMessage(messages.linkIssueForTheTest, {
          launchNumber: items.launchNumber && `#${items.launchNumber}`,
        })
      : formatMessage(messages.link);
  };

  setItems = (newState) => {
    this.setState(newState);
  };

  renderRightSection = (collapsedRightSection) => {
    const { testItems, selectedItems, loading } = this.state;
    return (
      <div className={cx('items-list')}>
        <ItemsList
          setItems={this.setItems}
          testItems={testItems}
          selectedItems={selectedItems}
          isNarrowView={collapsedRightSection}
          isBulkOperation={this.isBulkOperation}
          loading={loading}
        />
      </div>
    );
  };

  render() {
    const {
      namedBtsIntegrations,
      data: { eventsInfo = {} },
      change,
    } = this.props;
    const { pluginName, integrationId } = this.state;

    return (
      <DarkModalLayout
        renderHeaderElements={this.renderIssueFormHeaderElements}
        renderTitle={this.renderTitle}
        renderRightSection={this.renderRightSection}
      >
        {() => (
          <form className={cx('form')}>
            <BtsIntegrationSelector
              namedBtsIntegrations={namedBtsIntegrations}
              pluginName={pluginName}
              integrationId={integrationId}
              onChangeIntegration={this.onChangeIntegration}
              onChangePluginName={this.onChangePlugin}
              darkView
            />
            <FieldArray
              name="issues"
              change={change}
              component={LinkIssueFields}
              addEventInfo={eventsInfo.addNewIssue}
              withAutocomplete={pluginName !== RALLY}
              darkView
            />
          </form>
        )}
      </DarkModalLayout>
    );
  }
}
