import React, { Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { WidgetInfoBlock } from '../../../common/widgetInfoBlock';
import { StepLabelItem } from './stepLabelItem';
import styles from './wizardInfoSection.scss';

const cx = classNames.bind(styles);
const STEPS = ['WidgetSelection', 'WidgetConfiguring', 'WidgetSaving'];
const messages = defineMessages({
  WidgetSelectionStepLabel: {
    id: 'WizardInfoSection.WidgetSelectionStepLabel',
    defaultMessage: 'Select widget type',
  },
  WidgetConfiguringStepLabel: {
    id: 'WizardInfoSection.WidgetConfiguringStepLabel',
    defaultMessage: 'Configure widget',
  },
  WidgetSavingStepLabel: {
    id: 'WizardInfoSection.WidgetSavingStepLabel',
    defaultMessage: 'Save',
  },
});

@injectIntl
export class WizardInfoSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    step: PropTypes.number,
    activeWidget: PropTypes.object,
    widgetSettings: PropTypes.object,
  };
  static defaultProps = {
    step: 0,
    activeWidget: {},
    widgetSettings: {},
  };

  render() {
    const { intl, step, activeWidget, widgetSettings, projectId } = this.props;

    return (
      <div className={cx('wizard-info-section')}>
        <div className={cx('steps-block')}>
          {STEPS.map((value, index) => (
            <StepLabelItem
              key={value}
              step={index}
              label={intl.formatMessage(messages[`${value}StepLabel`])}
              active={step === index}
              completed={step > index}
            />
          ))}
        </div>
        <WidgetInfoBlock
          projectId={projectId}
          widgetSettings={widgetSettings}
          activeWidget={activeWidget}
          customCondition={step === 1}
        />
      </div>
    );
  }
}
