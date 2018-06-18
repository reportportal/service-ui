import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import EmptyWidgetPreview from '../../img/wdgt-undefined-inline.svg';
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
    step: PropTypes.number,
    activeWidget: PropTypes.object,
  };
  static defaultProps = {
    step: 0,
    activeWidget: {},
  };

  render() {
    const { intl, step, activeWidget } = this.props;
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
        <div className={cx('widget-preview-block')}>
          {activeWidget.id ? activeWidget.preview : Parser(EmptyWidgetPreview)}
        </div>
        {activeWidget.id && (
          <div className={cx('widget-info-block')}>
            <div className={cx('widget-title')}>{activeWidget.title}</div>
            <div className={cx('widget-description')}>{activeWidget.description}</div>
          </div>
        )}
      </div>
    );
  }
}
