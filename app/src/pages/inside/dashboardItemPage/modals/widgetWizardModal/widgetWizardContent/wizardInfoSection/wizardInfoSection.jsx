import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import EmptyWidgetPreview from 'pages/inside/dashboardItemPage/modals/common/img/wdgt-undefined-inline.svg';
import { WidgetPreview } from 'pages/inside/dashboardItemPage/modals/common/widgetPreview';
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
    widgetConfig: PropTypes.object,
  };
  static defaultProps = {
    step: 0,
    activeWidget: {},
    widgetConfig: {},
  };

  state = {
    loading: false,
    widgetData: null,
  };

  componentDidUpdate(prevProps) {
    const { filterIds = [], contentParameters = { widgetOptions: {} } } = this.props.widgetConfig;
    if (prevProps.activeWidget.id !== this.props.activeWidget.id) {
      this.resetPrevWidgetData();
      return;
    }
    if (
      this.props.step === 1 &&
      !isEqual(prevProps.widgetConfig, this.props.widgetConfig) &&
      (filterIds.length || contentParameters.widgetOptions.launchNameFilter)
    ) {
      this.fetchWidget();
    }
  }

  getDefaultPreview = () =>
    this.props.activeWidget.id ? this.props.activeWidget.preview : Parser(EmptyWidgetPreview);

  resetPrevWidgetData = () =>
    this.setState({
      widgetData: null,
    });

  fetchWidget = () => {
    this.setState({
      loading: true,
      widgetType: this.props.activeWidget.id,
    });
    fetch(URLS.widgetPreview(this.props.projectId), {
      method: 'post',
      data: this.props.widgetConfig,
    })
      .then((widget) => {
        this.setState({
          loading: false,
          widgetData: {
            content: widget,
            ...this.props.widgetConfig,
          },
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          widgetData: null,
        });
      });
  };

  render() {
    const { intl, step, activeWidget } = this.props;
    const { widgetData, loading } = this.state;
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
        {activeWidget.id && (
          <div className={cx('widget-info-block')}>
            <div className={cx('widget-title')}>{activeWidget.title}</div>
            <div className={cx('widget-description')}>{activeWidget.description}</div>
          </div>
        )}
        <WidgetPreview
          defaultPreview={this.getDefaultPreview()}
          loading={loading}
          widgetType={activeWidget.id}
          data={widgetData}
        />
      </div>
    );
  }
}
