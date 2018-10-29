import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { formValueSelector, submit } from 'redux-form';
import { connect } from 'react-redux';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import styles from './widgetWizardContent.scss';
import { getWidgets } from '../widgets';
import { WIDGET_WIZARD_FORM } from './wizardControlsSection/constants';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    activeWidgetId: formValueSelector(WIDGET_WIZARD_FORM)(state, 'widgetType'),
  }),
  {
    submitWidgetWizardForm: () => submit(WIDGET_WIZARD_FORM),
  },
)
@track()
export class WidgetWizardContent extends Component {
  static propTypes = {
    activeWidgetId: PropTypes.string,
    submitWidgetWizardForm: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    activeWidgetId: '',
    eventsInfo: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
    };
    this.widgets = getWidgets(props.intl.formatMessage);
  }

  onClickNextStep = () => {
    this.props.tracking.trackEvent(this.props.eventsInfo.nextStep);
    this.props.submitWidgetWizardForm();
  };

  onClickPrevStep = () => {
    this.setState({ step: this.state.step - 1 });
    this.props.tracking.trackEvent(this.props.eventsInfo.prevStep);
  };

  onAddWidget = (data) => {
    this.props.tracking.trackEvent(this.props.eventsInfo.addWidget);
    console.log(data);
  };

  nextStep = () => {
    this.setState({ step: this.state.step + 1 });
  };

  render() {
    return (
      <div className={cx('widget-wizard-content')}>
        <WizardInfoSection
          activeWidget={this.widgets.find((widget) => this.props.activeWidgetId === widget.id)}
          step={this.state.step}
        />
        <WizardControlsSection
          eventsInfo={this.props.eventsInfo}
          widgets={this.widgets}
          activeWidgetId={this.props.activeWidgetId}
          step={this.state.step}
          onClickNextStep={this.onClickNextStep}
          onClickPrevStep={this.onClickPrevStep}
          nextStep={this.nextStep}
          onAddWidget={this.onAddWidget}
          submitWidgetWizardForm={this.props.submitWidgetWizardForm}
        />
      </div>
    );
  }
}
