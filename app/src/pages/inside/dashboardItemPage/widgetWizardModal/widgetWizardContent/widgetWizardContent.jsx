import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { formValueSelector, submit } from 'redux-form';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { activeProjectSelector } from 'controllers/user';
import { activeDashboardIdSelector } from 'controllers/pages';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import styles from './widgetWizardContent.scss';
import { getWidgets } from '../widgets';
import { WIDGET_WIZARD_FORM } from './wizardControlsSection/constants';

const cx = classNames.bind(styles);

const messages = defineMessages({
  addWidgetSuccess: {
    id: 'WidgetWizardContent.addWidgetSuccess',
    defaultMessage: 'Widget has been added',
  },
});

@injectIntl
@connect(
  (state) => ({
    activeWidgetId: formValueSelector(WIDGET_WIZARD_FORM)(state, 'widgetType'),
    widgetUrl: URLS.widget(activeProjectSelector(state)),
    dashboardWidgetUrl: URLS.addDashboardWidget(
      activeProjectSelector(state),
      activeDashboardIdSelector(state),
    ),
  }),
  {
    submitWidgetWizardForm: () => submit(WIDGET_WIZARD_FORM),
    showNotification,
    showScreenLockAction,
    hideScreenLockAction,
  },
)
@track()
export class WidgetWizardContent extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activeWidgetId: PropTypes.string,
    submitWidgetWizardForm: PropTypes.func.isRequired,
    widgetUrl: PropTypes.string.isRequired,
    dashboardWidgetUrl: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired,
    eventsInfo: PropTypes.object,
    showNotification: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
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

  onAddWidget = (formData) => {
    const {
      intl: { formatMessage },
      tracking: { trackEvent },
      eventsInfo: { addWidget },
      widgetUrl,
      dashboardWidgetUrl,
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
    })
      .then(({ id }) => {
        const newWidget = {
          widgetId: id,
          widgetPosition: { positionX: 0, positionY: 0 },
          widgetSize: { width: 12, height: 7 },
        };
        return fetch(dashboardWidgetUrl, {
          method: 'put',
          data: { addWidget: newWidget },
        });
      })
      .then(() => {
        this.props.hideScreenLockAction();
        this.props.closeModal();
        this.props.showNotification({
          message: formatMessage(messages.addWidgetSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((err) => {
        this.props.hideScreenLockAction();
        this.props.showNotification({ message: err.message, type: NOTIFICATION_TYPES.ERROR });
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
