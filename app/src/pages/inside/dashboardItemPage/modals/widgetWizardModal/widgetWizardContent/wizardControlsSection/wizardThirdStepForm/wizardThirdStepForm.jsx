import React, { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, initialize } from 'redux-form';
import PropTypes from 'prop-types';
import {
  dashboardItemsSelector,
  activeDashboardItemSelector,
  loadingSelector,
} from 'controllers/dashboard';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { CommonWidgetControls } from '../../../../common/widgetControls';
import { WIDGET_WIZARD_FORM } from '../../../../common/constants';

const WIDGET_NAME_PART_LIMIT = 124;
const messages = defineMessages({
  newDashboardName: {
    id: 'dashboardControl.dashboardName',
    defaultMessage: 'My first dashboard',
  },
});

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})
@connect(
  (state) => ({
    formValues: getFormValues(WIDGET_WIZARD_FORM)(state),
    dashboards: dashboardItemsSelector(state),
    activeDashboard: activeDashboardItemSelector(state),
    loading: loadingSelector(state),
  }),
  {
    initializeWizardThirdStepForm: (data) =>
      initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
  },
)
@injectIntl
@track()
export class WizardThirdStepForm extends Component {
  static propTypes = {
    initializeWizardThirdStepForm: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    formValues: PropTypes.object,
    widgetTitle: PropTypes.string,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    dashboards: PropTypes.arrayOf(PropTypes.object),
    activeDashboard: PropTypes.object,
    loading: PropTypes.bool,
    change: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    eventsInfo: {},
    formValues: {},
    widgetTitle: '',
    onSubmit: () => {},
    dashboards: [],
    activeDashboard: null,
    loading: false,
  };

  getUniqPostfix = () =>
    new Date()
      .valueOf()
      .toString()
      .slice(-3);

  generateWidgetName = () => {
    const {
      filters,
      contentParameters: {
        widgetOptions: { launchNameFilter },
      },
    } = this.props.formValues;
    const filterBasedName =
      (filters.length &&
        filters.reduce((acc, item) => `${acc}${acc.length ? '.' : ''}${item.name}`, '')) ||
      '';
    let generatedName = filterBasedName || launchNameFilter || this.props.widgetTitle;
    if (generatedName.length > WIDGET_NAME_PART_LIMIT) {
      generatedName = generatedName.substring(0, WIDGET_NAME_PART_LIMIT);
    }

    return `${generatedName}_${this.getUniqPostfix()}`;
  };

  initializeControlsForm = () => {
    const { dashboards, intl } = this.props;
    const newDashboard = {
      name: intl.formatMessage(messages.newDashboardName),
      description: '',
      share: false,
    };
    const selectedDashboard = dashboards.length > 0 ? dashboards[0] : newDashboard;
    const data = {
      name: this.generateWidgetName(),
      description: '',
      share: selectedDashboard.share,
      selectedDashboard,
    };
    return this.props.initializeWizardThirdStepForm(data);
  };
  handleChange = (event, value) => {
    const { formValues, change } = this.props;
    const share = value.share || formValues.share;
    change('share', share);
  };
  render() {
    const {
      handleSubmit,
      onSubmit,
      tracking,
      eventsInfo,
      dashboards,
      activeDashboard,
      loading,
    } = this.props;
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        {loading ? (
          <SpinningPreloader />
        ) : (
          <CommonWidgetControls
            initializeControlsForm={this.initializeControlsForm}
            trackEvent={tracking.trackEvent}
            eventsInfo={eventsInfo}
            dashboards={dashboards}
            activeDashboard={activeDashboard}
            loading={loading}
            onChange={this.handleChange}
          />
        )}
      </form>
    );
  }
}
