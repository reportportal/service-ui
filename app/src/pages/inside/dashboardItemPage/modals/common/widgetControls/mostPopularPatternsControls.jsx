import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { URLS } from 'common/urls';
import { validate } from 'common/utils';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { ModalField } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { FIELD_LABEL_WIDTH } from 'pages/inside/dashboardItemPage/modals/common/widgetControls/controls/constants';
import { FiltersControl, InputControl, TogglerControl } from './controls';
import { getWidgetModeOptions } from './utils/getWidgetModeOptions';
import { ITEMS_INPUT_WIDTH } from './constants';

const DEFAULT_LAUNCHES_COUNT = '600';
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'MostPopularPatternsControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  numberOfLaunchesLabel: {
    id: 'MostPopularPatternsControls.numberOfLaunchesLabel',
    defaultMessage: 'Number of launches',
  },
  attributeKeyFieldLabel: {
    id: 'MostPopularPatternsControls.attributeKeyFieldLabel',
    defaultMessage: 'Attribute key',
  },
  attributeKeyFieldPlaceholder: {
    id: 'MostPopularPatternsControls.attributeKeyFieldPlaceholder',
    defaultMessage: 'Enter an attribute key',
  },
  numberOfLaunchesValidationError: {
    id: 'MostPopularPatternsControls.numberOfLaunchesValidationError',
    defaultMessage: 'Number of launches should have value from 1 to 600',
  },
  attributeKeyValidationError: {
    id: 'MostPopularPatternsControls.attributeKeyValidationError',
    defaultMessage: 'Value should have size from 1 to 128',
  },
});
const validators = {
  numberOfLaunches: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 600)) &&
    formatMessage(messages.numberOfLaunchesValidationError),
  attributeKey: (formatMessage) => (value) =>
    (!value || !validate.attributeKey(value)) &&
    formatMessage(messages.attributeKeyValidationError),
};

@injectIntl
@connect((state) => ({
  launchAttributeKeysSearch: URLS.launchAttributeKeysSearch(activeProjectSelector(state)),
}))
export class MostPopularPatternsControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
    launchAttributeKeysSearch: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    const { widgetSettings, initializeControlsForm } = props;

    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_LAUNCHES_COUNT,
        contentFields: [],
        widgetOptions: {
          latest: MODES_VALUES[CHART_MODES.ALL_LAUNCHES],
          attributeKey: '',
        },
      },
    });
  }

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  makeAttributes = (attributes) =>
    attributes ? attributes.map((attribute) => ({ value: attribute, label: attribute })) : null;

  formatAttribute = (attribute) => (attribute ? { value: attribute, label: attribute } : null);

  parseAttribute = (attribute) => {
    if (attribute === null) return null;
    if (attribute && attribute.value) return attribute.value;

    return undefined;
  };

  render() {
    const { intl, formAppearance, onFormAppearanceChange, launchAttributeKeysSearch } = this.props;
    return (
      <Fragment>
        <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
          />
        </FieldProvider>
        <FieldProvider name="contentParameters.widgetOptions.latest">
          <TogglerControl
            fieldLabel=" "
            items={getWidgetModeOptions(
              [CHART_MODES.ALL_LAUNCHES, CHART_MODES.LATEST_LAUNCHES],
              intl.formatMessage,
            )}
          />
        </FieldProvider>
        <FieldProvider
          name="contentParameters.itemsCount"
          validate={validators.numberOfLaunches(intl.formatMessage)}
          format={String}
          normalize={this.normalizeValue}
        >
          <InputControl
            fieldLabel={intl.formatMessage(messages.numberOfLaunchesLabel)}
            inputWidth={ITEMS_INPUT_WIDTH}
            maxLength="3"
            hintType={'top-right'}
          />
        </FieldProvider>
        <ModalField
          label={intl.formatMessage(messages.attributeKeyFieldLabel)}
          labelWidth={FIELD_LABEL_WIDTH}
        >
          <FieldProvider
            parse={this.parseAttribute}
            format={this.formatAttribute}
            name="contentParameters.widgetOptions.attributeKey"
            validate={validators.attributeKey(intl.formatMessage)}
          >
            <InputTagsSearch
              uri={launchAttributeKeysSearch}
              minLength={1}
              async
              creatable
              showNewLabel
              removeSelected
              makeOptions={this.makeAttributes}
              placeholder={intl.formatMessage(messages.attributeKeyFieldPlaceholder)}
            />
          </FieldProvider>
        </ModalField>
      </Fragment>
    );
  }
}
