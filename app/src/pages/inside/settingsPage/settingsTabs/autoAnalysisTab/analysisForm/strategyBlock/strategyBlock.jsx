import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { FieldProvider } from 'components/fields/fieldProvider';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { InputRadio } from 'components/inputs/inputRadio';
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
            <FieldProvider name="isAutoAnalyzerEnabled" format={Boolean} parse={Boolean}>
              <InputBigSwitcher mobileDisabled />
            </FieldProvider>
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
                <FieldProvider name="analyzer_mode">
                  <InputRadio ownValue={'LAUNCH_NAME'} name={'aa-strategy'} mobileDisabled>
                    {intl.formatMessage(messages.sameNameLaunchesCaption)}
                  </InputRadio>
                </FieldProvider>
              </div>
              <span className={cx('form-group-help-block')}>
                {intl.formatMessage(messages.sameNameLaunchesInfo)}
              </span>
            </div>
            <div className={cx('aa-strategy-option')}>
              <div className={cx('aa-strategy-option-selector')}>
                <FieldProvider name="analyzer_mode">
                  <InputRadio ownValue={'ALL'} name={'aa-strategy'} mobileDisabled>
                    {intl.formatMessage(messages.allLaunchesCaption)}
                  </InputRadio>
                </FieldProvider>
              </div>
              <span className={cx('form-group-help-block')}>
                {intl.formatMessage(messages.allLaunchesInfo)}
              </span>
            </div>
          </div>
        </div>
        <div className={cx('form-break-line')} />
      </React.Fragment>
    );
  }
}
