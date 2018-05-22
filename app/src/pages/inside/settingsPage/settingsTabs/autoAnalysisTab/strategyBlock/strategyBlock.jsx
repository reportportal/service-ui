import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputRadio } from 'components/inputs/inputRadio';
import styles from '../autoAnalysisTab.scss';

const cx = classNames.bind(styles);

const DEFAULT_ANALYSIS_CONFIGURATION = {
  analyzerMode: 'LAUNCH_NAME',
  isAutoAnalyzerEnabled: false,
};

const messages = defineMessages({
  autoAnalysisSwitcherTitle: {
    id: 'StrategyBlock.autoAnalysisSwitcherTitle',
    defaultMessage: 'Auto analysis',
  },
  strategySelectorTitle: {
    id: 'StrategyBlock.strategySelectorTitle',
    defaultMessage: 'Base for Auto Analysis',
  },
  analysisOnInfo: {
    id: 'StrategyBlock.analysisOnInfo',
    defaultMessage: 'If ON - analysis starts as soon as any launch finished',
  },
  analysisOffInfo: {
    id: 'StrategyBlock.analysisOffInfo',
    defaultMessage: 'If OFF - not automatic, but can be invoked manually',
  },
  sameNameLaunchesCaption: {
    id: 'StrategyBlock.sameNameLaunchesCaption',
    defaultMessage: 'Launches with the same name',
  },
  sameNameLaunchesInfo: {
    id: 'StrategyBlock.sameNameLaunchesInfo',
    defaultMessage:
      'The test items are analyzed on base of previously investigated data in launches with the same name',
  },
  allLaunchesCaption: {
    id: 'StrategyBlock.allLaunchesCaption',
    defaultMessage: 'All launches',
  },
  allLaunchesInfo: {
    id: 'StrategyBlock.allLaunchesInfo',
    defaultMessage:
      'The test items are analyzed on base of previously investigated data in all launches',
  },
});
@injectIntl
export class StrategyBlock extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    isAutoAnalyzerEnabled: PropTypes.bool,
    analyzer_mode: PropTypes.string,
  };

  static defaultProps = {
    analyzer_mode: DEFAULT_ANALYSIS_CONFIGURATION.analyzerMode,
    isAutoAnalyzerEnabled: DEFAULT_ANALYSIS_CONFIGURATION.isAutoAnalyzerEnabled,
  };

  state = {
    isSwitcherEnable: this.props.isAutoAnalyzerEnabled,
    analyzerValue: this.props.analyzer_mode,
  };

  handleSwitcherChange = (newValue) => {
    this.setState({
      isSwitcherEnable: newValue,
    });
  };

  handleRadioChange = (event) => {
    this.setState({
      analyzerValue: event.target.value,
    });
  };

  render() {
    const { intl } = this.props;
    return (
      <React.Fragment>
        <div className={cx('form-group-container')}>
          <span className={cx('form-group-column', 'switch-auto-analysis-label')}>
            {intl.formatMessage(messages.autoAnalysisSwitcherTitle)}
          </span>
          <div className={cx('form-group-column', 'switcher-wrapper')}>
            <InputBigSwitcher
              value={this.state.isSwitcherEnable}
              onChange={this.handleSwitcherChange}
            />
          </div>
          <div className={cx('form-group-column', 'form-group-description')}>
            <div className={cx('form-group-help-block')}>
              <p>{intl.formatMessage(messages.analysisOnInfo)}</p>
              <p>{intl.formatMessage(messages.analysisOffInfo)}</p>
            </div>
          </div>
        </div>

        <div className={cx('form-group-container')}>
          <span
            className={cx('form-group-column', 'switch-auto-analysis-label', 'aa-strategy-label')}
          >
            {intl.formatMessage(messages.strategySelectorTitle)}
          </span>
          <div className={cx('form-group-column', 'form-group-description')}>
            <div className={cx('aa-strategy-option')}>
              <div className={cx('aa-strategy-option-selector')}>
                <InputRadio
                  ownValue={'LAUNCH_NAME'}
                  value={this.state.analyzerValue}
                  onChange={this.handleRadioChange}
                  name={'aa-strategy'}
                >
                  {intl.formatMessage(messages.sameNameLaunchesCaption)}
                </InputRadio>
              </div>
              <span className={cx('form-group-help-block')}>
                {intl.formatMessage(messages.sameNameLaunchesInfo)}
              </span>
            </div>
            <div className={cx('aa-strategy-option')}>
              <div className={cx('aa-strategy-option-selector')}>
                <InputRadio
                  ownValue={'ALL'}
                  value={this.state.analyzerValue}
                  onChange={this.handleRadioChange}
                  name={'aa-strategy'}
                >
                  {intl.formatMessage(messages.allLaunchesCaption)}
                </InputRadio>
              </div>
              <span className={cx('form-group-help-block')}>
                {intl.formatMessage(messages.allLaunchesInfo)}
              </span>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
