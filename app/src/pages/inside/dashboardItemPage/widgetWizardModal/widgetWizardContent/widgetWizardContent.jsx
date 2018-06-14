import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import styles from './widgetWizardContent.scss';
import { WIDGETS } from '../widgets';

const cx = classNames.bind(styles);

export class WidgetWizardContent extends Component {
  state = {
    step: 0,
    widget: '',
  };
  onNextStep = () => {
    this.setState({ step: this.state.step + 1 });
  };
  onPrevStep = () => {
    this.setState({ step: this.state.step - 1 });
  };

  render() {
    return (
      <div className={cx('widget-wizard-content')}>
        <WizardInfoSection step={this.state.step} />
        <WizardControlsSection
          widgets={WIDGETS}
          step={this.state.step}
          onNextStep={this.onNextStep}
          onPrevStep={this.onPrevStep}
        />
      </div>
    );
  }
}
