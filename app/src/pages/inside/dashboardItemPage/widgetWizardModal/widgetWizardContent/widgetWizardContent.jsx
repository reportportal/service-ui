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
    activeWidgetId: '',
  };

  onNextStep = () => {
    this.setState({ step: this.state.step + 1 });
  };

  onPrevStep = () => {
    this.setState({ step: this.state.step - 1 });
  };

  onChangeWidgetType = (e) => {
    this.setState({
      activeWidgetId: e.target.value,
    });
  };

  render() {
    return (
      <div className={cx('widget-wizard-content')}>
        <WizardInfoSection
          activeWidget={WIDGETS.filter((widget) => this.state.activeWidgetId === widget.id)[0]}
          step={this.state.step}
        />
        <WizardControlsSection
          widgets={WIDGETS}
          activeWidgetId={this.state.activeWidgetId}
          step={this.state.step}
          onNextStep={this.onNextStep}
          onPrevStep={this.onPrevStep}
          onChangeWidgetType={this.onChangeWidgetType}
        />
      </div>
    );
  }
}
