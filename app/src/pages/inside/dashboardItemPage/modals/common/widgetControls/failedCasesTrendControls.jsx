import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import {
  STATS_AB_TOTAL,
  STATS_ND_TOTAL,
  STATS_PB_TOTAL,
  STATS_SI_TOTAL,
  STATS_TI_TOTAL,
} from 'common/constants/statistics';
import { commonValidators } from 'common/utils';
import { ITEMS_INPUT_WIDTH } from './constants';
import { FiltersControl, InputControl } from './controls';

const DEFAULT_ITEMS_COUNT = '50';
const messages = defineMessages({
  ItemsFieldLabel: {
    id: 'FailedCasesTrendControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  ItemsValidationError: {
    id: 'FailedCasesTrendControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 600',
  },
});

@injectIntl
export class FailedCasesTrendControls extends Component {
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
        contentFields: [
          STATS_PB_TOTAL,
          STATS_AB_TOTAL,
          STATS_SI_TOTAL,
          STATS_ND_TOTAL,
          STATS_TI_TOTAL,
        ],
        widgetOptions: {},
        itemsCount: DEFAULT_ITEMS_COUNT,
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
          </Fragment>
        )}
      </Fragment>
    );
  }
}
