import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { validate } from 'common/utils';
import { ToggleButton } from 'components/buttons/toggleButton';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { AccuracyFormBlock } from './accuracyFormBlock';
import { NUMBER_OF_LOG_LINES, MIN_DOC_FREQ, MIN_SHOULD_MATCH, MIN_TERM_FREQ } from '../constants';
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

@reduxForm({
  form: 'analysisForm',
  validate: ({ minShouldMatch, minTermFreq, minDocFreq }) => ({
    minShouldMatch:
      (!minShouldMatch || !validate.minShouldMatch(minShouldMatch)) && 'minShouldMatchHint',
    minTermFreq: (!minTermFreq || !validate.minTermFreq(minTermFreq)) && 'minTermFreqHint',
    minDocFreq: (!minDocFreq || !validate.minDocFreq(minDocFreq)) && 'minTermFreqHint',
  }),
})
@connect((state) => ({
  formInputsValues: selector(
    state,
    MIN_SHOULD_MATCH,
    MIN_DOC_FREQ,
    MIN_TERM_FREQ,
    NUMBER_OF_LOG_LINES,
  ),
}))
@injectIntl
@track()
export class AnalysisForm extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    intl: intlShape.isRequired,
    initialValues: PropTypes.object,
    change: PropTypes.func,
    handleSubmit: PropTypes.func,
    onFormSubmit: PropTypes.func,
    formInputsValues: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    disabled: false,
    initialValues: {},
    change: () => {},
    handleSubmit: () => {},
    onFormSubmit: () => {},
    formInputsValues: {},
  };

  state = {
    autoAnalysisMode: DEFAULT_ANALYSIS_MODE,
  };

  componentDidMount() {
    this.setAnalysisMode(this.props.initialValues);
  }

  onInputChange = (event, newValue, previousValue, name) => {
    const formInputsValues = this.props.formInputsValues;
    formInputsValues[name] = newValue;
    this.setAnalysisMode(formInputsValues);
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
    const { tracking, change } = this.props;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.TOGGLE_AUTO_ANALYSIS_MODE);
    change(MIN_SHOULD_MATCH, analysisModeConfig[newValue][MIN_SHOULD_MATCH]);
    change(MIN_DOC_FREQ, analysisModeConfig[newValue][MIN_DOC_FREQ]);
    change(MIN_TERM_FREQ, analysisModeConfig[newValue][MIN_TERM_FREQ]);
    change(NUMBER_OF_LOG_LINES, analysisModeConfig[newValue][NUMBER_OF_LOG_LINES]);

    this.setState({
      autoAnalysisMode: newValue,
    });
  };

  submitHandler = (data) => {
    const { tracking, onFormSubmit } = this.props;
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.SUBMIT_AUTO_ANALYSIS_SETTINGS);
    onFormSubmit(data);
  };

  render() {
    const { intl, handleSubmit, disabled } = this.props;

    return (
      <form className={cx('analysis-form')} onSubmit={handleSubmit(this.submitHandler)}>
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
