import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { FieldProvider } from 'components/fields/fieldProvider';
import { validate } from 'common/utils';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import classNames from 'classnames/bind';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import {
  LAUNCH_STATUSES_OPTIONS,
  GROUPED_DEFECT_TYPES_OPTIONS,
  ITEMS_INPUT_WIDTH,
} from './constants';
import {
  FiltersControl,
  DropdownControl,
  InputControl,
  TogglerControl,
  CheckboxControl,
} from './controls';
import styles from './widgetControls.scss';

const cx = classNames.bind(styles);

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'LaunchStatisticsControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'LaunchStatisticsControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ZoomControlText: {
    id: 'LaunchStatisticsControls.ZoomControlText',
    defaultMessage: 'Zoom widget area',
  },
  ItemsValidationError: {
    id: 'LaunchStatisticsControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 150',
  },
  ContentFieldsValidationError: {
    id: 'LaunchStatisticsControls.ContentFieldsValidationError',
    defaultMessage: 'You must select at least one item',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 150)) &&
    formatMessage(messages.ItemsValidationError),
  contentFields: (formatMessage) => (value) =>
    (!value || !value.length) && formatMessage(messages.ContentFieldsValidationError),
};

@injectIntl
@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
export class LaunchStatisticsControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    defectTypes: PropTypes.object.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl, widgetSettings, defectTypes, initializeControlsForm } = props;
    this.criteria = getWidgetCriteriaOptions(
      [LAUNCH_STATUSES_OPTIONS, GROUPED_DEFECT_TYPES_OPTIONS],
      intl.formatMessage,
      { defectTypes },
    );
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: this.criteria.map((criteria) => criteria.value),
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          zoom: false,
          timeline: MODES_VALUES[CHART_MODES.LAUNCH_MODE],
          viewMode: MODES_VALUES[CHART_MODES.AREA_VIEW],
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  render() {
    const {
      intl: { formatMessage },
      formAppearance,
      onFormAppearanceChange,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
          />
        </FieldProvider>
        {!formAppearance.isMainControlsLocked && (
          <Fragment>
            <FieldProvider
              name="contentParameters.contentFields"
              validate={validators.contentFields(formatMessage)}
            >
              <DropdownControl
                fieldLabel={formatMessage(messages.CriteriaFieldLabel)}
                multiple
                selectAll
                options={this.criteria}
              />
            </FieldProvider>
            <FieldProvider
              name="contentParameters.itemsCount"
              validate={validators.items(formatMessage)}
              format={String}
              normalize={this.normalizeValue}
            >
              <InputControl
                fieldLabel={formatMessage(messages.ItemsFieldLabel)}
                inputWidth={ITEMS_INPUT_WIDTH}
                maxLength="3"
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.timeline">
              <TogglerControl
                fieldLabel=" "
                items={getWidgetModeOptions(
                  [CHART_MODES.LAUNCH_MODE, CHART_MODES.TIMELINE_MODE],
                  formatMessage,
                )}
              />
            </FieldProvider>
            <FieldProvider name="contentParameters.widgetOptions.viewMode">
              <TogglerControl
                fieldLabel=" "
                items={getWidgetModeOptions(
                  [CHART_MODES.AREA_VIEW, CHART_MODES.BAR_VIEW],
                  formatMessage,
                )}
              />
            </FieldProvider>
            <div className={cx('zoom-container')}>
              <FieldProvider name="contentParameters.widgetOptions.zoom">
                <CheckboxControl fieldLabel=" " text={formatMessage(messages.ZoomControlText)} />
              </FieldProvider>
              <BetaBadge className={cx('launch-controls')} />
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
