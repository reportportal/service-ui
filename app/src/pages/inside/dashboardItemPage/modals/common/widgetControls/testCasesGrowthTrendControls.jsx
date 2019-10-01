import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { STATS_TOTAL } from 'common/constants/statistics';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { commonValidators } from 'common/utils';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { ITEMS_INPUT_WIDTH } from './constants';
import { FiltersControl, InputControl, TogglerControl } from './controls';

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'TestCasesGrowthTrendControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'TestCasesGrowthTrendControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 600',
  },
});

@injectIntl
export class TestCasesGrowthTrendControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    eventsInfo: {},
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeControlsForm } = props;
    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        contentFields: [STATS_TOTAL],
        itemsCount: DEFAULT_ITEMS_COUNT,
        widgetOptions: {
          timeline: MODES_VALUES[CHART_MODES.LAUNCH_MODE],
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
      eventsInfo,
    } = this.props;

    return (
      <Fragment>
        <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
            eventsInfo={eventsInfo}
          />
        </FieldProvider>
        {!formAppearance.isMainControlsLocked && (
          <Fragment>
            <FieldProvider
              name="contentParameters.itemsCount"
              validate={commonValidators.createNumberOfLaunchesValidator(
                formatMessage(messages.ItemsValidationError),
              )}
              format={String}
              normalize={this.normalizeValue}
            >
              <InputControl
                fieldLabel={formatMessage(messages.ItemsFieldLabel)}
                inputWidth={ITEMS_INPUT_WIDTH}
                maxLength="3"
                hintType={'top-right'}
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
          </Fragment>
        )}
      </Fragment>
    );
  }
}
