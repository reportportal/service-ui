import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { STATS_FAILED, STATS_PASSED, STATS_SKIPPED } from 'common/constants/statistics';
import { URLS } from 'common/urls';
import { validate } from 'common/utils';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { ModalField } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { DEFECT_STATISTICS_OPTIONS, TO_INVESTIGATE_OPTION, ITEMS_INPUT_WIDTH } from './constants';
import { FiltersControl, InputControl } from './controls';

const DEFAULT_ITEMS_COUNT = '10';
const STATIC_CONTENT_FIELDS = [STATS_FAILED, STATS_SKIPPED, STATS_PASSED];
const messages = defineMessages({
  CriteriaFieldLabel: {
    id: 'CumulativeTrendControls.CriteriaFieldLabel',
    defaultMessage: 'Criteria for widget',
  },
  ItemsFieldLabel: {
    id: 'CumulativeTrendControls.ItemsFieldLabel',
    defaultMessage: 'Items',
  },
  attributesArrayLabel: {
    id: 'CumulativeTrendControls.attributesArrayLabel',
    defaultMessage: 'Attributes',
  },
  attributeKeyFieldPlaceholder: {
    id: 'CumulativeTrendControls.attributeKeyFieldPlaceholder',
    defaultMessage: 'Enter an attribute key',
  },
  attributeKeyFieldTip: {
    id: 'CumulativeTrendControls.attributeKeyFieldTip',
    defaultMessage: 'To view a dynamic of a definite attribute you should type its key',
  },
  ItemsValidationError: {
    id: 'LaunchStatisticsControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 10',
  },
  attributesArrayValidationError: {
    id: 'CumulativeTrendControls.attributesArrayValidationError',
    defaultMessage: 'Select at least 1 attribute key',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 10)) &&
    formatMessage(messages.ItemsValidationError),
  attributesArray: (formatMessage) => (value) =>
    (!value || !validate.attributesArray(value)) &&
    formatMessage(messages.attributesArrayValidationError),
};

@injectIntl
@connect((state) => ({
  launchAttributeKeysSearch: URLS.launchAttributeKeysSearch(activeProjectSelector(state)),
}))
export class CumulativeTrendControls extends Component {
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
    const { intl, widgetSettings, initializeControlsForm } = props;

    this.criteria = getWidgetCriteriaOptions(
      [DEFECT_STATISTICS_OPTIONS, TO_INVESTIGATE_OPTION],
      intl.formatMessage,
    );

    initializeControlsForm({
      contentParameters: widgetSettings.contentParameters || {
        itemsCount: DEFAULT_ITEMS_COUNT,
        contentFields: this.parseContentFields(this.criteria),
        widgetOptions: {
          attributes: [],
        },
      },
    });
  }

  formatContentFields = (criteries) =>
    criteries.filter((criteria) => STATIC_CONTENT_FIELDS.indexOf(criteria) === -1);

  parseContentFields = (criteries) => {
    const data =
      criteries &&
      STATIC_CONTENT_FIELDS.concat(
        criteries
          .map((criteria) => criteria.value || criteria)
          .reduce((acc, val) => acc.concat(val), []),
      );

    return criteries ? data : this.props.widgetSettings.contentParameters.contentFields;
  };

  normalizeValue = (value) => value && `${value}`.replace(/\D+/g, '');

  formatFilterValue = (value) => value && value[0];
  parseFilterValue = (value) => value && [value];

  formatAttributes = (attributes) =>
    attributes ? attributes.map((attribute) => ({ value: attribute, label: attribute })) : null;
  parseAttributes = (attributes) =>
    attributes ? attributes.map((attribute) => attribute.value) : undefined;

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
        {!formAppearance.isMainControlsLocked && (
          <Fragment>
            <ModalField
              label={intl.formatMessage(messages.attributesArrayLabel)}
              labelWidth={145}
              tip={intl.formatMessage(messages.attributeKeyFieldTip)}
            >
              <div style={{ width: '100%' }}>
                <FieldProvider
                  parse={this.parseAttributes}
                  format={this.formatAttributes}
                  name="contentParameters.widgetOptions.attributes"
                  validate={validators.attributesArray(intl.formatMessage)}
                >
                  <InputTagsSearch
                    uri={launchAttributeKeysSearch}
                    minLength={1}
                    async
                    creatable
                    showNewLabel
                    multi
                    removeSelected
                    makeOptions={this.formatAttributes}
                  />
                </FieldProvider>
              </div>
            </ModalField>

            <FieldProvider
              name="contentParameters.itemsCount"
              validate={validators.items(intl.formatMessage)}
              format={String}
              normalize={this.normalizeValue}
            >
              <InputControl
                fieldLabel={intl.formatMessage(messages.ItemsFieldLabel)}
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
