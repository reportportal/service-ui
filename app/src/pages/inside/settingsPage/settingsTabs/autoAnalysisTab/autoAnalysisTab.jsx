import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputRadio } from 'components/inputs/inputRadio';
import styles from './autoAnalysisTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  autoAnalysisSwitcherTitle: {
    id: 'AutoAnalysisSwitcher.title',
    defaultMessage: 'Auto analysis',
  },
  strategySelectorTitle: {
    id: 'StrategySelectorTitle.title',
    defaultMessage: 'Base for Auto Analysis',
  },
});
@injectIntl
export class AutoAnalysisTab extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    minDocFreq: PropTypes.number,
    minShouldMatch: PropTypes.number,
    minTermFreq: PropTypes.number,
    numberOfLogLines: PropTypes.number,
    indexing_running: PropTypes.bool,
    isAutoAnalyzerEnabled: PropTypes.bool,
    analyzer_mode: PropTypes.string,
  };

  static defaultProps = {
    analyzer_mode: 'LAUNCH_NAME',
    minDocFreq: 7,
    minShouldMatch: 80,
    minTermFreq: 1,
    numberOfLogLines: 2,
    indexing_running: false,
    isAutoAnalyzerEnabled: false,
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
      <div className={cx('settings-tab-content')}>
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
              <p>If ON - analysis starts as soon as any launch finished.</p>
              <p>If OFF - not automatic, but can be invoked manually</p>
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
                  Launches with the same name
                </InputRadio>
              </div>
              <span className={cx('form-group-help-block')}>
                The test items are analyzed on base of previously investigated data in launches with
                the same name
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
                  All launches
                </InputRadio>
              </div>
              <span className={cx('form-group-help-block')}>
                The test items are analyzed on base of previously investigated data in all launches
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
