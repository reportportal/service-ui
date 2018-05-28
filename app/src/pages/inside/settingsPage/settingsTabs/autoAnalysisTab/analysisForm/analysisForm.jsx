import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { validate, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectAnalyzerConfigSelector } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { showNotification } from 'controllers/notification';
import { TabsSwitcher } from 'components/main/tabsSwitcher';
import { StrategyBlock } from './strategyBlock/index';
import { AccuracyFormBlock } from './accuracyFormBlock/index';
import styles from './analysisForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  analysisModeTitle: {
    id: 'AnalysisForm.analysisModeTitle',
    defaultMessage: 'Mode of Auto-Analyse Accuracy',
  },
  analysisStrictModeTitle: {
    id: 'AnalysisForm.analysisStrictModeTitle',
    defaultMessage: 'Strict',
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

const analysisModeConfig = [
  {
    name: 'Strict', // format messages here
    options: {
      minShouldMatch: 95,
      minDocFreq: 5,
      minTermFreq: 7,
      numberOfLogLines: 2,
    },
  },
  {
    name: 'Moderate',
    options: {
      minShouldMatch: 80,
      minDocFreq: 7,
      minTermFreq: 1,
      numberOfLogLines: 2,
    },
  },
  {
    name: 'Light',
    options: {
      minShouldMatch: 60,
      minDocFreq: 7,
      minTermFreq: 1,
      numberOfLogLines: 2,
    },
  },
];

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
  { showNotification },
)
export class AnalysisForm extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    analyzerConfiguration: PropTypes.object,
    currentProject: PropTypes.string,
    initialize: PropTypes.func,
    change: PropTypes.func,
    handleSubmit: PropTypes.func,
    showNotification: PropTypes.func,
    formInputsValues: PropTypes.object,
  };

  static defaultProps = {
    analyzerConfiguration: {},
    currentProject: '',
    initialize: () => {},
    change: () => {},
    handleSubmit: () => {},
    showNotification: () => {},
    formInputsValues: {},
  };

  state = {
    currentTabsValue: analysisModeConfig[1].name,
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
    const formattedValue = newValue.toString().replace(/\D+/g, '');
    const formInputsValues = this.props.formInputsValues;
    formInputsValues[name] = +formattedValue;
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
    fetch(URLS.project(this.props.currentProject), { method: 'put', data: dataToSend })
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateSuccessNotification),
          type: 'success',
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.updateErrorNotification),
          type: 'error',
        });
      });
  };

  setAnalysisMode = (modeConfig) => {
    let isModeChosen = false;
    analysisModeConfig.forEach((item) => {
      if (
        item.options.minShouldMatch === +modeConfig.minShouldMatch &&
        item.options.minDocFreq === +modeConfig.minDocFreq &&
        item.options.minTermFreq === +modeConfig.minTermFreq &&
        item.options.numberOfLogLines === +modeConfig.numberOfLogLines
      ) {
        isModeChosen = true;
        this.setState({
          currentTabsValue: item.name,
        });
      }
    });

    if (!isModeChosen) {
      this.setState({
        currentTabsValue: false,
      });
    }
  };

  tabChangeHandle = (id) => {
    this.props.change('minShouldMatch', analysisModeConfig[id].options.minShouldMatch);
    this.props.change('minDocFreq', analysisModeConfig[id].options.minDocFreq);
    this.props.change('minTermFreq', analysisModeConfig[id].options.minTermFreq);
    this.props.change('numberOfLogLines', analysisModeConfig[id].options.numberOfLogLines);

    this.setState({
      currentTabsValue: analysisModeConfig[id].name,
    });
  };

  render() {
    const { intl, handleSubmit } = this.props;

    const localization = {
      Strict: intl.formatMessage(messages.analysisStrictModeTitle),
      Moderate: intl.formatMessage(messages.analysisModerateModeTitle),
      Light: intl.formatMessage(messages.analysisLightModeTitle),
    };
    return (
      <form className={cx('analysis-form-content')} onSubmit={handleSubmit(this.onFormSubmit)}>
        <StrategyBlock />
        <div className={cx('form-group-container', 'accuracy-form-group')}>
          <span
            className={cx('form-group-column', 'switch-auto-analysis-label', 'mode-tabs-label')}
          >
            {intl.formatMessage(messages.analysisModeTitle)}
          </span>
          <div className={cx('form-group-column', 'tabs-switcher-wrapper')}>
            <TabsSwitcher
              data={analysisModeConfig}
              localization={localization}
              value={this.state.currentTabsValue}
              onChange={this.tabChangeHandle}
            />
          </div>
        </div>
        <AccuracyFormBlock onInputChange={this.onInputChange} />
      </form>
    );
  }
}
