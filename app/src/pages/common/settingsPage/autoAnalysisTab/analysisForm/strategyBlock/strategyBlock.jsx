import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputRadio } from 'components/inputs/inputRadio';
import { FormField } from 'components/fields/formField';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ANALYZER_ENABLED, ANALYZER_MODE } from '../../constants';
import styles from './strategyBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  autoAnalysisSwitcherTitle: {
    id: 'StrategyBlock.autoAnalysisSwitcherTitle',
    defaultMessage: 'Auto analysis',
  },
  strategySelectorTitle: {
    id: 'StrategyBlock.strategySelectorTitle',
    defaultMessage: 'Base for Auto Analysis',
  },
  analysisStatusInfo: {
    id: 'StrategyBlock.analysisStatusInfo',
    defaultMessage:
      'If ON - analysis starts as soon as any launch finished<br/>If OFF - not automatic, but can be invoked manually',
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
@track()
export class StrategyBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    disabled: PropTypes.bool,
    data: PropTypes.object,
    onFormSubmit: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    disabled: false,
    data: {},
    onFormSubmit: () => {},
  };

  changeAnalyzerEnabled = (value) => {
    const { tracking, onFormSubmit } = this.props;
    onFormSubmit({
      [ANALYZER_ENABLED]: value,
    });
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_SWITCHER);
  };

  changeAnalyzerMode = (event) => {
    const { tracking, onFormSubmit } = this.props;
    onFormSubmit({
      [ANALYZER_MODE]: event.target.value,
    });
    tracking.trackEvent(SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_BASE_RADIO_BTN);
  };

  render() {
    const {
      intl: { formatMessage },
      disabled,
      data,
    } = this.props;

    return (
      <div className={cx('strategy-block')}>
        <FormField
          fieldWrapperClassName={cx('switcher-wrapper')}
          label={formatMessage(messages.autoAnalysisSwitcherTitle)}
          customBlock={{
            node: <p>{Parser(formatMessage(messages.analysisStatusInfo))}</p>,
          }}
          withoutProvider
        >
          <InputBigSwitcher
            value={data[ANALYZER_ENABLED]}
            onChange={this.changeAnalyzerEnabled}
            disabled={disabled}
            mobileDisabled
          />
        </FormField>

        <FormField
          containerClassName={cx('radio-container')}
          fieldWrapperClassName={cx('aa-strategy-option-selector')}
          customBlock={{
            node: <p>{formatMessage(messages.sameNameLaunchesInfo)}</p>,
            wrapperClassName: cx('radio-description'),
          }}
          label={formatMessage(messages.strategySelectorTitle)}
          withoutProvider
        >
          <InputRadio
            ownValue="LAUNCH_NAME"
            value={data[ANALYZER_MODE]}
            onChange={this.changeAnalyzerMode}
            name="aa-strategy"
            disabled={disabled}
            mobileDisabled
          >
            <span className={cx('radio-children')}>
              {formatMessage(messages.sameNameLaunchesCaption)}
            </span>
          </InputRadio>
        </FormField>

        <FormField
          containerClassName={cx('radio-container')}
          fieldWrapperClassName={cx('aa-strategy-option-selector')}
          labelClassName={cx('no-label')}
          customBlock={{
            node: <p>{formatMessage(messages.allLaunchesInfo)}</p>,
            wrapperClassName: cx('radio-description'),
          }}
          withoutProvider
        >
          <InputRadio
            ownValue="ALL"
            value={data[ANALYZER_MODE]}
            onChange={this.changeAnalyzerMode}
            name="aa-strategy"
            disabled={disabled}
            mobileDisabled
          >
            <span className={cx('radio-children')}>
              {formatMessage(messages.allLaunchesCaption)}
            </span>
          </InputRadio>
        </FormField>
      </div>
    );
  }
}
