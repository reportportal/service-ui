import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { validate, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import {
  projectAnalyzerConfigSelector,
  updateAutoAnalysisConfigurationAction,
} from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { ToggleButton } from 'components/buttons/toggleButton';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { StrategyBlock } from './strategyBlock';
import { AccuracyFormBlock } from './accuracyFormBlock';
import styles from './analysisForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  analysisModeTitle: {
    id: 'AnalysisForm.analysisModeTitle',
    defaultMessage: 'Mode of Auto-Analyse Accuracy',
  },
  analysisClassicModeTitle: {
    id: 'AnalysisForm.analysisClassicModeTitle',
    defaultMessage: 'Classic',
  },
  analysisModerateModeTitle: {
    id: 'AnalysisForm.analysisModerateModeTitle',
    defaultMessage: 'Moderate',
  },
  analysisLightModeTitle: {
    id: 'AnalysisForm.analysisLightModeTitle',
    defaultMessage: 'Light',
  },
  updateSuccessNotification: {
    id: 'AnalysisForm.updateSuccessNotification',
    defaultMessage: 'Project settings were successfully updated',
  },
  updateErrorNotification: {
    id: 'AnalysisForm.updateErrorNotification',
    defaultMessage: 'Something went wrong',
  },
});

const selector = formValueSelector('analysisForm');

const analysisModeConfig = {
  Classic: {
    minShouldMatch: 95,
    minDocFreq: 1,
    minTermFreq: 1,
    numberOfLogLines: -1,
  },
  Moderate: {
    minShouldMatch: 80,
    minDocFreq: 1,
    minTermFreq: 1,
    numberOfLogLines: 5,
  },
  Light: {
    minShouldMatch: 60,
    minDocFreq: 1,
    minTermFreq: 1,
    numberOfLogLines: 3,
  },
};

const DEFAULT_ANALYSIS_MODE = 'Classic';

@injectIntl
@reduxForm({
  form: 'analysisForm',
  validate: ({ minShouldMatch, minTermFreq, minDocFreq }) => ({
    minShouldMatch:
      (!minShouldMatch || !validate.minShouldMatch(minShouldMatch)) && 'minShouldMatchHint',
    minTermFreq: (!minTermFreq || !validate.minTermFreq(minTermFreq)) && 'minTermFreqHint',
    minDocFreq: (!minDocFreq || !validate.minDocFreq(minDocFreq)) && 'minTermFreqHint',
  }),
})
@connect(
  (state) => ({
    analyzerConfiguration: projectAnalyzerConfigSelector(state),
    currentProject: activeProjectSelector(state),
    formInputsValues: selector(
      state,
      'minShouldMatch',
      'minDocFreq',
      'minTermFreq',
      'numberOfLogLines',
    ),
  }),
  {
    showNotification,
    updateAutoAnalysisConfigurationAction,
  },
)
@track()
export class AnalysisForm extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    intl: intlShape.isRequired,
    analyzerConfiguration: PropTypes.object,
    currentProject: PropTypes.string,
    initialize: PropTypes.func,
    change: PropTypes.func,
    handleSubmit: PropTypes.func,
    showNotification: PropTypes.func,
    updateAutoAnalysisConfigurationAction: PropTypes.func,
    formInputsValues: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    disabled: false,
    analyzerConfiguration: {},
    currentProject: '',
    initialize: () => {},
    change: () => {},
    handleSubmit: () => {},
    showNotification: () => {},
    updateAutoAnalysisConfigurationAction: () => {},
    formInputsValues: {},
  };

  state = {
    autoAnalysisMode: DEFAULT_ANALYSIS_MODE,
  };

  componentDidMount() {
    const initialConfiguration = {
      ...this.props.analyzerConfiguration,
    };
    delete initialConfiguration.indexing_running;
    this.setAnalysisMode(initialConfiguration);
    this.props.initialize(initialConfiguration);
  }

  onInputChange = (event, newValue, previousValue, name) => {
    const formInputsValues = this.props.formInputsValues;
    formInputsValues[name] = newValue;
    this.setAnalysisMode(formInputsValues);
  };

  onFormSubmit = (data) => {
    const dataToSend = {
      configuration: {
        analyzerConfiguration: {
          ...data,
        },
      },
    };
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.SUBMIT_AUTO_ANALYSIS_SETTINGS);
    fetch(URLS.project(this.props.currentProject), { method: 'put', data: dataToSend })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.updateAutoAnalysisConfigurationAction(dataToSend);
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateErrorNotification),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  setAnalysisMode = (modeConfig) => {
    const analysisModeKeys = Object.keys(analysisModeConfig);
    const existingMode = analysisModeKeys.find(
      (key) =>
        analysisModeConfig[key].minShouldMatch === Number(modeConfig.minShouldMatch) &&
        analysisModeConfig[key].minDocFreq === Number(modeConfig.minDocFreq) &&
        analysisModeConfig[key].minTermFreq === Number(modeConfig.minTermFreq) &&
        analysisModeConfig[key].numberOfLogLines === Number(modeConfig.numberOfLogLines),
    );
    this.setState({
      autoAnalysisMode: existingMode || '',
    });
  };

  tabItems = [
    {
      value: 'Classic',
      label: this.props.intl.formatMessage(messages.analysisClassicModeTitle),
    },
    {
      value: 'Moderate',
      label: this.props.intl.formatMessage(messages.analysisModerateModeTitle),
    },
    {
      value: 'Light',
      label: this.props.intl.formatMessage(messages.analysisLightModeTitle),
    },
  ];

  tabChangeHandle = (newValue) => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.TOGGLE_AUTO_ANALYSIS_MODE);
    this.props.change('minShouldMatch', analysisModeConfig[newValue].minShouldMatch);
    this.props.change('minDocFreq', analysisModeConfig[newValue].minDocFreq);
    this.props.change('minTermFreq', analysisModeConfig[newValue].minTermFreq);
    this.props.change('numberOfLogLines', analysisModeConfig[newValue].numberOfLogLines);

    this.setState({
      autoAnalysisMode: newValue,
    });
  };

  render() {
    const { intl, handleSubmit, disabled } = this.props;

    return (
      <form className={cx('analysis-form-content')} onSubmit={handleSubmit(this.onFormSubmit)}>
        <StrategyBlock disabled={disabled} />
        <div className={cx('accuracy-form-group')}>
          <span className={cx('tabs-container-label')}>
            {intl.formatMessage(messages.analysisModeTitle)}
          </span>
          <div className={cx('toggle-button-wrapper')}>
            <ToggleButton
              disabled={disabled}
              items={this.tabItems}
              value={this.state.autoAnalysisMode}
              mobileDisabled
              onChange={this.tabChangeHandle}
            />
          </div>
        </div>
        <AccuracyFormBlock disabled={disabled} onInputChange={this.onInputChange} />
      </form>
    );
  }
}
