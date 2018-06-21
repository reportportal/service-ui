import React, { Component } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import styles from './widgetWizardContent.scss';
import { getWidgets } from '../widgets';

const cx = classNames.bind(styles);

@injectIntl
export class WidgetWizardContent extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      activeWidgetId: '',
    };
    this.widgets = getWidgets(props.intl.formatMessage);
  }

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
  onAddWidget = (data) => {
    console.log(data);
  };

  render() {
    return (
      <div className={cx('widget-wizard-content')}>
        <WizardInfoSection
          activeWidget={this.widgets.filter((widget) => this.state.activeWidgetId === widget.id)[0]}
          step={this.state.step}
        />
        <WizardControlsSection
          widgets={this.widgets}
          activeWidgetId={this.state.activeWidgetId}
          step={this.state.step}
          onNextStep={this.onNextStep}
          onPrevStep={this.onPrevStep}
          onAddWidget={this.onAddWidget}
          onChangeWidgetType={this.onChangeWidgetType}
        />
      </div>
    );
  }
}
