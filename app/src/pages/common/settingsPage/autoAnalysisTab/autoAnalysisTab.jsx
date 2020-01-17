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
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { canUpdateSettings } from 'common/utils/permissions';
import { projectIdSelector } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import {
  fetchConfigurationAttributesAction,
  updateConfigurationAttributesAction,
  normalizeAttributesWithPrefix,
  analyzerAttributesSelector,
  ANALYZER_ATTRIBUTE_PREFIX,
} from 'controllers/project';
import { analyzerExtensionsSelector } from 'controllers/appInfo/selectors';
import { AnalysisForm } from './analysisForm/analysisForm';
import { IndexActionsBlock } from './indexActionsBlock';
import { StrategyBlock } from './analysisForm/strategyBlock';
import {
  INDEXING_RUNNING,
  NUMBER_OF_LOG_LINES,
  MIN_SHOULD_MATCH,
  ANALYZER_ENABLED,
  ANALYZER_MODE,
} from './constants';
import styles from './autoAnalysisTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  updateSuccessNotification: {
    id: 'AnalysisForm.updateSuccessNotification',
    defaultMessage: 'Project settings were successfully updated',
  },
  updateErrorNotification: {
    id: 'AnalysisForm.updateErrorNotification',
    defaultMessage: 'Something went wrong',
  },
  regenerateIndexTitle: {
    id: 'AnalysisForm.regenerateIndexTitle',
    defaultMessage: 'Regenerate index',
  },
  regenerateIndexDescription: {
    id: 'AnalysisForm.regenerateIndexDescription',
    defaultMessage:
      'You have changed a parameter "Number of log lines". This action can influence on results of an analysis. For an appropriate work of the analyzer, please regenerate Index in Elastic Search. Do you want to regenerate it now?',
  },
});

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
    analyzerConfiguration: analyzerAttributesSelector(state),
    analyzerExtensions: analyzerExtensionsSelector(state),
  }),
  {
    fetchConfigurationAttributesAction,
    updateConfigurationAttributesAction,
    showNotification,
    showGenerateIndexModal: (data) => showModalAction({ id: 'generateIndexModal', data }),
  },
)
@injectIntl
export class AutoAnalysisTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.string,
    fetchConfigurationAttributesAction: PropTypes.func.isRequired,
    updateConfigurationAttributesAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    showGenerateIndexModal: PropTypes.func.isRequired,
    analyzerConfiguration: PropTypes.object,
    analyzerExtensions: PropTypes.array,
  };

  static defaultProps = {
    projectId: '',
    analyzerConfiguration: {},
    analyzerExtensions: [],
  };

  componentDidMount() {
    this.props.fetchConfigurationAttributesAction(this.props.projectId);
  }

  getIndexActionsBlockValues = () =>
    JSON.parse(this.props.analyzerConfiguration[INDEXING_RUNNING] || 'false');

  getAnalysisFormValues = () => {
    const { analyzerConfiguration } = this.props;

    return {
      [MIN_SHOULD_MATCH]: analyzerConfiguration[MIN_SHOULD_MATCH],
      [NUMBER_OF_LOG_LINES]: analyzerConfiguration[NUMBER_OF_LOG_LINES],
    };
  };

  getStrategyBlockValues = () => {
    const { analyzerConfiguration } = this.props;

    return {
      [ANALYZER_ENABLED]: JSON.parse(analyzerConfiguration[ANALYZER_ENABLED] || 'false'),
      [ANALYZER_MODE]: analyzerConfiguration[ANALYZER_MODE],
    };
  };

  checkIfConfirmationNeeded = (data) => {
    const { analyzerExtensions, analyzerConfiguration } = this.props;
    const indexingRunning = this.getIndexActionsBlockValues();
    const newLogLinesValue = data[NUMBER_OF_LOG_LINES];

    return (
      !indexingRunning &&
      analyzerExtensions.length &&
      newLogLinesValue &&
      String(newLogLinesValue) !== String(analyzerConfiguration[NUMBER_OF_LOG_LINES])
    );
  };

  updateProjectConfig = (formData) => {
    const {
      intl: { formatMessage },
      showGenerateIndexModal,
    } = this.props;
    const isConfirmationNeeded = this.checkIfConfirmationNeeded(formData);
    const preparedData = normalizeAttributesWithPrefix(formData, ANALYZER_ATTRIBUTE_PREFIX);
    const data = {
      configuration: {
        attributes: {
          ...preparedData,
        },
      },
    };

    fetch(URLS.project(this.props.projectId), { method: 'put', data })
      .then(() => {
        this.props.showNotification({
          message: formatMessage(messages.updateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.updateConfigurationAttributesAction(data);
        if (isConfirmationNeeded) {
          showGenerateIndexModal({
            modalTitle: messages.regenerateIndexTitle,
            modalDescription: messages.regenerateIndexDescription,
          });
        }
      })
      .catch(() => {
        this.props.showNotification({
          message: formatMessage(messages.updateErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  render() {
    const { accountRole, userRole, showGenerateIndexModal, analyzerExtensions } = this.props;
    const disabled = !canUpdateSettings(accountRole, userRole);

    return (
      <div className={cx('auto-analysis-tab')}>
        <StrategyBlock
          disabled={disabled}
          data={this.getStrategyBlockValues()}
          onFormSubmit={this.updateProjectConfig}
        />
        <AnalysisForm
          disabled={disabled}
          initialValues={this.getAnalysisFormValues()}
          onFormSubmit={this.updateProjectConfig}
        />
        <IndexActionsBlock
          disabled={disabled}
          indexingRunning={this.getIndexActionsBlockValues()}
          showGenerateIndexModal={showGenerateIndexModal}
          analyzerExtensions={analyzerExtensions}
        />
      </div>
    );
  }
}
