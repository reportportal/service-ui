import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import {
  STATS_TOTAL,
  STATS_FAILED,
  STATS_PASSED,
  STATS_SKIPPED,
  STATS_AB_TOTAL,
  STATS_ND_TOTAL,
  STATS_PB_TOTAL,
  STATS_SI_TOTAL,
  STATS_TI_TOTAL,
} from 'common/constants/statistics';
import { FiltersControl } from './controls';

const DEFAULT_ITEMS_COUNT = '2';

@injectIntl
export class DifferentLaunchesComparisonControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { initializeControlsForm } = props;
    initializeControlsForm({
      contentParameters: {
        contentFields: [
          STATS_TOTAL,
          STATS_PASSED,
          STATS_FAILED,
          STATS_SKIPPED,
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

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  render() {
    const { formAppearance, onFormAppearanceChange } = this.props;
    return (
      <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
        <FiltersControl
          formAppearance={formAppearance}
          onFormAppearanceChange={onFormAppearanceChange}
        />
      </FieldProvider>
    );
  }
}
