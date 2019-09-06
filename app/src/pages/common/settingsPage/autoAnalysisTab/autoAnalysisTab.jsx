import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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
import { AnalysisForm } from './analysisForm/analysisForm';
import { IndexActionsBlock } from './indexActionsBlock';
import { StrategyBlock } from './analysisForm/strategyBlock';
import {
  INDEXING_RUNNING,
  NUMBER_OF_LOG_LINES,
  MIN_DOC_FREQ,
  MIN_SHOULD_MATCH,
  MIN_TERM_FREQ,
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
});

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
    analyzerConfiguration: analyzerAttributesSelector(state),
  }),
  {
    fetchConfigurationAttributesAction,
    updateConfigurationAttributesAction,
    showNotification,
    showGenerateIndexModal: () => showModalAction({ id: 'generateIndexModal' }),
  },
)
@injectIntl
export class AutoAnalysisTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string,
    fetchConfigurationAttributesAction: PropTypes.func.isRequired,
    updateConfigurationAttributesAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    showGenerateIndexModal: PropTypes.func.isRequired,
    analyzerConfiguration: PropTypes.object,
  };

  static defaultProps = {
    projectId: '',
    analyzerConfiguration: {},
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
      [MIN_DOC_FREQ]: analyzerConfiguration[MIN_DOC_FREQ],
      [MIN_TERM_FREQ]: analyzerConfiguration[MIN_TERM_FREQ],
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

  checkIfConfirmationNeeded = (data) =>
    data[NUMBER_OF_LOG_LINES] !== this.props.analyzerConfiguration[NUMBER_OF_LOG_LINES];

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
          showGenerateIndexModal();
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
    const { accountRole, userRole, showGenerateIndexModal } = this.props;
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
        />
      </div>
    );
  }
}
