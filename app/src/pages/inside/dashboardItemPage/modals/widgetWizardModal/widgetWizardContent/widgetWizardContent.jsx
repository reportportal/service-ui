import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { getFormValues, submit } from 'redux-form';
import { connect } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showScreenLockAction } from 'controllers/screenLock';
import { activeProjectSelector } from 'controllers/user';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { DEFAULT_WIDGET_CONFIG, WIDGET_WIZARD_FORM } from '../../common/constants';
import { prepareWidgetDataForSubmit } from '../../common/utils';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import styles from './widgetWizardContent.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    formValues: getFormValues(WIDGET_WIZARD_FORM)(state),
    projectId: activeProjectSelector(state),
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
    formValues: PropTypes.object,
    submitWidgetWizardForm: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
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
    formValues: {
      widgetType: '',
    },
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
      projectId,
      onConfirm,
    } = this.props;

    const data = prepareWidgetDataForSubmit(formData);

    trackEvent(addWidget);
    this.props.showScreenLockAction();
    fetch(URLS.widget(projectId), {
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
    const {
      formValues: { widgetType },
    } = this.props;

    return (
      <div className={cx('widget-wizard-content')}>
        <WizardInfoSection
          activeWidget={this.widgets.find((widget) => widgetType === widget.id)}
          projectId={this.props.projectId}
          widgetSettings={prepareWidgetDataForSubmit(this.props.formValues)}
          step={this.state.step}
        />
        <WizardControlsSection
          eventsInfo={this.props.eventsInfo}
          widgets={this.widgets}
          activeWidgetId={widgetType}
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
