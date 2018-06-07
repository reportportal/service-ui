import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
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
          fieldName="isAutoAnalyzerEnabled"
          containerClasses={cx('accuracy-form-group')}
          inputWrapperClasses={cx('switcher-wrapper')}
          label={intl.formatMessage(messages.autoAnalysisSwitcherTitle)}
          description={intl.formatMessage(messages.analysisStatusInfo)}
          formatValue={Boolean}
          parseValue={Boolean}
        >
          <InputBigSwitcher mobileDisabled />
        </FormField>

        <FormField
          fieldName="analyzer_mode"
          containerClasses={cx('radio-container')}
          inputWrapperClasses={cx('aa-strategy-option', 'aa-strategy-option-selector')}
          descriptionClasses={cx('radio-description')}
          label={intl.formatMessage(messages.strategySelectorTitle)}
          description={intl.formatMessage(messages.sameNameLaunchesInfo)}
        >
          <InputRadio
            ownValue="LAUNCH_NAME"
            name="aa-strategy"
            childrenClass={cx('radio-children')}
            mobileDisabled
          >
            {intl.formatMessage(messages.sameNameLaunchesCaption)}
          </InputRadio>
        </FormField>

        <FormField
          fieldName="analyzer_mode"
          containerClasses={cx('radio-container')}
          inputWrapperClasses={cx('aa-strategy-option', 'aa-strategy-option-selector')}
          labelClasses={cx('no-label')}
          descriptionClasses={cx('radio-description')}
          description={intl.formatMessage(messages.allLaunchesInfo)}
        >
          <InputRadio
            ownValue="ALL"
            name="aa-strategy"
            childrenClass={cx('radio-children')}
            mobileDisabled
          >
            {intl.formatMessage(messages.allLaunchesCaption)}
          </InputRadio>
        </FormField>
        <div className={cx('form-break-line')} />
      </React.Fragment>
    );
  }
}
