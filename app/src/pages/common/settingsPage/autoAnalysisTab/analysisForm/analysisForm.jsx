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
  updateConfigurationAttributesAction,
  analyzerAttributesSelector,
  normalizeAttributesWithPrefix,
  ANALYZER_ATTRIBUTE_PREFIX,
} from 'controllers/project';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { ToggleButton } from 'components/buttons/toggleButton';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { StrategyBlock } from './strategyBlock/index';
import { AccuracyFormBlock } from './accuracyFormBlock/index';
import {
  NUMBER_OF_LOG_LINES,
  MIN_DOC_FREQ,
  MIN_SHOULD_MATCH,
  MIN_TERM_FREQ,
  INDEXING_RUNNING,
} from './constants';
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
    [MIN_SHOULD_MATCH]: 95,
    [MIN_DOC_FREQ]: 1,
    [MIN_TERM_FREQ]: 1,
    [NUMBER_OF_LOG_LINES]: -1,
  },
  Moderate: {
    [MIN_SHOULD_MATCH]: 80,
    [MIN_DOC_FREQ]: 1,
    [MIN_TERM_FREQ]: 1,
    [NUMBER_OF_LOG_LINES]: 5,
  },
  Light: {
    [MIN_SHOULD_MATCH]: 60,
    [MIN_DOC_FREQ]: 1,
    [MIN_TERM_FREQ]: 1,
    [NUMBER_OF_LOG_LINES]: 3,
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
    analyzerConfiguration: analyzerAttributesSelector(state),
    formInputsValues: selector(
      state,
      MIN_SHOULD_MATCH,
      MIN_DOC_FREQ,
      MIN_TERM_FREQ,
      NUMBER_OF_LOG_LINES,
    ),
  }),
  {
    showNotification,
    updateConfigurationAttributesAction,
  },
)
@track()
export class AnalysisForm extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    intl: intlShape.isRequired,
    analyzerConfiguration: PropTypes.object,
    projectId: PropTypes.string,
    initialize: PropTypes.func,
    change: PropTypes.func,
    handleSubmit: PropTypes.func,
    showNotification: PropTypes.func,
    updateConfigurationAttributesAction: PropTypes.func,
    formInputsValues: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    disabled: false,
    analyzerConfiguration: {},
    projectId: '',
    initialize: () => {},
    change: () => {},
    handleSubmit: () => {},
    showNotification: () => {},
    updateConfigurationAttributesAction: () => {},
    formInputsValues: {},
  };

  state = {
    autoAnalysisMode: DEFAULT_ANALYSIS_MODE,
  };

  componentDidMount() {
    const initialConfiguration = {
      ...this.props.analyzerConfiguration,
    };
    delete initialConfiguration[INDEXING_RUNNING];
    this.setAnalysisMode(initialConfiguration);
    this.props.initialize(initialConfiguration);
  }

  onInputChange = (event, newValue, previousValue, name) => {
    const formInputsValues = this.props.formInputsValues;
    formInputsValues[name] = newValue;
    this.setAnalysisMode(formInputsValues);
  };

  onFormSubmit = (formData) => {
    const preparedData = normalizeAttributesWithPrefix(formData, ANALYZER_ATTRIBUTE_PREFIX);

    const data = {
      configuration: {
        attributes: {
          ...preparedData,
        },
      },
    };
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.SUBMIT_AUTO_ANALYSIS_SETTINGS);
    fetch(URLS.project(this.props.projectId), { method: 'put', data })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateSuccessNotification),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.updateConfigurationAttributesAction(data);
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
        analysisModeConfig[key][MIN_SHOULD_MATCH] === Number(modeConfig[MIN_SHOULD_MATCH]) &&
        analysisModeConfig[key][MIN_DOC_FREQ] === Number(modeConfig[MIN_DOC_FREQ]) &&
        analysisModeConfig[key][MIN_TERM_FREQ] === Number(modeConfig[MIN_TERM_FREQ]) &&
        analysisModeConfig[key][NUMBER_OF_LOG_LINES] === Number(modeConfig[NUMBER_OF_LOG_LINES]),
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
    this.props.change(MIN_SHOULD_MATCH, analysisModeConfig[newValue][MIN_SHOULD_MATCH]);
    this.props.change(MIN_DOC_FREQ, analysisModeConfig[newValue][MIN_DOC_FREQ]);
    this.props.change(MIN_TERM_FREQ, analysisModeConfig[newValue][MIN_TERM_FREQ]);
    this.props.change(NUMBER_OF_LOG_LINES, analysisModeConfig[newValue][NUMBER_OF_LOG_LINES]);

    this.setState({
      autoAnalysisMode: newValue,
    });
  };

  render() {
    const { intl, handleSubmit, disabled } = this.props;

    return (
      <form className={cx('analysis-form')} onSubmit={handleSubmit(this.onFormSubmit)}>
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
