import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputRadio } from 'components/inputs/inputRadio';
import { FormField } from 'components/fields/formField';
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
export class StrategyBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.props;

    return (
      <React.Fragment>
        <FormField
          name="isAutoAnalyzerEnabled"
          containerClassName={cx('accuracy-form-group')}
          inputWrapperClassName={cx('switcher-wrapper')}
          label={intl.formatMessage(messages.autoAnalysisSwitcherTitle)}
          description={Parser(intl.formatMessage(messages.analysisStatusInfo))}
          format={Boolean}
          parse={Boolean}
        >
          <InputBigSwitcher mobileDisabled />
        </FormField>

        <FormField
          name="analyzer_mode"
          containerClassName={cx('radio-container')}
          inputWrapperClassName={cx('aa-strategy-option', 'aa-strategy-option-selector')}
          descriptionClassName={cx('radio-description')}
          label={intl.formatMessage(messages.strategySelectorTitle)}
          description={intl.formatMessage(messages.sameNameLaunchesInfo)}
        >
          <InputRadio ownValue="LAUNCH_NAME" name="aa-strategy" mobileDisabled>
            <span className={cx('radio-children')}>
              {intl.formatMessage(messages.sameNameLaunchesCaption)}
            </span>
          </InputRadio>
        </FormField>

        <FormField
          name="analyzer_mode"
          containerClassName={cx('radio-container')}
          inputWrapperClassName={cx('aa-strategy-option', 'aa-strategy-option-selector')}
          labelClassName={cx('no-label')}
          descriptionClassName={cx('radio-description')}
          description={intl.formatMessage(messages.allLaunchesInfo)}
        >
          <InputRadio ownValue="ALL" name="aa-strategy" mobileDisabled>
            <span className={cx('radio-children')}>
              {intl.formatMessage(messages.allLaunchesCaption)}
            </span>
          </InputRadio>
        </FormField>
        <div className={cx('form-break-line')} />
      </React.Fragment>
    );
  }
}
