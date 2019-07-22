import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldProvider } from 'components/fields/fieldProvider';
import { STATS_FAILED, STATS_PASSED, STATS_SKIPPED } from 'common/constants/statistics';
import { URLS } from 'common/urls';
import { validate } from 'common/utils';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { ModalField } from 'components/main/modal';
import { activeProjectSelector } from 'controllers/user';
import classNames from 'classnames/bind';
import { FIELD_LABEL_WIDTH } from './controls/constants';
import { FiltersControl, InputControl, TogglerControl } from './controls';
import { getWidgetCriteriaOptions } from './utils/getWidgetCriteriaOptions';
import { DEFECT_STATISTICS_OPTIONS, TO_INVESTIGATE_OPTION, ITEMS_INPUT_WIDTH } from './constants';
import styles from './widgetControls.scss';
import { WIDGET_WIZARD_FORM, WIDGET_WIZARD_WIDGET_OPTIONS_ATTRIBUTES_KEY } from '../constants';

const cx = classNames.bind(styles);

const DEFAULT_ITEMS_COUNT = '15';
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
  attributesTitle: {
    id: 'CumulativeTrendControls.attributesTitle',
    defaultMessage: 'Add attributes',
  },
  attributeKeyFieldLabel: {
    id: 'CumulativeTrendControls.attributeKeyFieldLabel',
    defaultMessage: 'Attribute key',
  },
  attributeKeyFieldLabel1: {
    id: 'CumulativeTrendControls.attributeKeyFieldLabel1',
    defaultMessage: 'Level 1 (overview)',
  },
  attributeKeyFieldLabel2: {
    id: 'CumulativeTrendControls.attributeKeyFieldLabel2',
    defaultMessage: 'Level 2 (detailed view)',
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
    defaultMessage: 'Items count should have value from 1 to 15',
  },
  attributeKeyValidationError: {
    id: 'LaunchStatisticsControls.attributeKeyValidationError',
    defaultMessage: 'Value should have size from 1 to 128',
  },
  attributesArrayValidationError: {
    id: 'CumulativeTrendControls.attributesArrayValidationError',
    defaultMessage: 'Select at least 1 attribute key',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 15)) &&
    formatMessage(messages.ItemsValidationError),
  attributeKey: (formatMessage) => (value) =>
    (!value || !validate.attributeKey(value)) &&
    formatMessage(messages.attributeKeyValidationError),
  attributesArray: (formatMessage) => (value) =>
    (!value || !validate.attributesArrayRequired(value)) &&
    formatMessage(messages.attributesArrayValidationError),
};
const valueSelector = formValueSelector(WIDGET_WIZARD_FORM);

@injectIntl
@connect((state) => ({
  levelsAttributes: valueSelector(state, WIDGET_WIZARD_WIDGET_OPTIONS_ATTRIBUTES_KEY),
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
    levelsAttributes: PropTypes.array,
  };

  static defaultProps = {
    levelsAttributes: [],
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

  makeAttributes = (items) => {
    const filteredItems = items.filter((item) => !this.props.levelsAttributes.includes(item));

    return filteredItems ? filteredItems.map((item) => ({ value: item, label: item })) : null;
  };

  formatAttributes = (attribute) => (attribute ? { value: attribute, label: attribute } : null);

  parseAttributes = (attribute) => {
    if (attribute === null) return null;
    if (attribute && attribute.value) return attribute.value;

    return undefined;
  };

  isOptionUnique = ({ option }) => !this.props.levelsAttributes.includes(option.value);

  render() {
    const { intl, formAppearance, onFormAppearanceChange, launchAttributeKeysSearch } = this.props;
    const tabItems = [
      {
        value: '1',
        label: 'All launches',
      },
      {
        value: '2',
        label: 'Latest Launches',
      },
    ];
    return (
      <Fragment>
        <FieldProvider name="filters" parse={this.parseFilterValue} format={this.formatFilterValue}>
          <FiltersControl
            formAppearance={formAppearance}
            onFormAppearanceChange={onFormAppearanceChange}
          />
        </FieldProvider>

        <TogglerControl disabled fieldLabel=" " items={tabItems} value={'2'} />

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

        {!formAppearance.isMainControlsLocked && (
          <Fragment>
            <div className={cx('attr-header')}>{intl.formatMessage(messages.attributesTitle)}</div>
            <ModalField
              label={intl.formatMessage(messages.attributeKeyFieldLabel1)}
              labelWidth={FIELD_LABEL_WIDTH}
            >
              <div style={{ width: '100%' }}>
                <FieldProvider
                  parse={this.parseAttributes}
                  format={this.formatAttributes}
                  name={`${WIDGET_WIZARD_WIDGET_OPTIONS_ATTRIBUTES_KEY}.0`}
                  validate={validators.attributesArray(intl.formatMessage)}
                >
                  <InputTagsSearch
                    uri={launchAttributeKeysSearch}
                    minLength={1}
                    async
                    creatable
                    showNewLabel
                    removeSelected
                    makeOptions={this.makeAttributes}
                    isOptionUnique={this.isOptionUnique}
                  />
                </FieldProvider>
              </div>
            </ModalField>

            <ModalField
              label={intl.formatMessage(messages.attributeKeyFieldLabel2)}
              labelWidth={FIELD_LABEL_WIDTH}
            >
              <div style={{ width: '100%' }}>
                <FieldProvider
                  parse={this.parseAttributes}
                  format={this.formatAttributes}
                  name={`${WIDGET_WIZARD_WIDGET_OPTIONS_ATTRIBUTES_KEY}.1`}
                >
                  <InputTagsSearch
                    uri={launchAttributeKeysSearch}
                    minLength={1}
                    async
                    creatable
                    showNewLabel
                    removeSelected
                    makeOptions={this.makeAttributes}
                    isOptionUnique={this.isOptionUnique}
                  />
                </FieldProvider>
              </div>
            </ModalField>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
