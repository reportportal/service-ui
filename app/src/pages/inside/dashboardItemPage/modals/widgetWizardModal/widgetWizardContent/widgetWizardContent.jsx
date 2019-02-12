import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { formValueSelector, submit } from 'redux-form';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showScreenLockAction } from 'controllers/screenLock';
import { activeProjectSelector } from 'controllers/user';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { DEFAULT_WIDGET_CONFIG } from '../../common/constants';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import styles from './widgetWizardContent.scss';
import { WIDGET_WIZARD_FORM } from '../constants';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    activeWidgetId: formValueSelector(WIDGET_WIZARD_FORM)(state, 'widgetType'),
    widgetUrl: URLS.widget(activeProjectSelector(state)),
  }),
  {
    submitWidgetWizardForm: () => submit(WIDGET_WIZARD_FORM),
    showScreenLockAction,
  },
)
@track()
export class WidgetWizardContent extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activeWidgetId: PropTypes.string,
    submitWidgetWizardForm: PropTypes.func.isRequired,
    widgetUrl: PropTypes.string.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    onConfirm: PropTypes.func,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    activeWidgetId: '',
    eventsInfo: {},
    onConfirm: () => {},
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

  onAddWidget = (formData) => {
    const {
      tracking: { trackEvent },
      eventsInfo: { addWidget },
      widgetUrl,
      onConfirm,
    } = this.props;

    const data = {
      ...formData,
      filterIds: formData.filterIds.map((item) => (typeof item === 'object' ? item.value : item)),
    };

    trackEvent(addWidget);
    this.props.showScreenLockAction();
    fetch(widgetUrl, {
      method: 'post',
      data,
    }).then(({ id }) => {
      const newWidget = {
        widgetId: id,
        ...DEFAULT_WIDGET_CONFIG,
      };
      onConfirm(newWidget, this.props.closeModal);
    });
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
