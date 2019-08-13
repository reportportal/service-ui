import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { FieldArray } from 'redux-form';
import { validate } from 'common/utils';
import { STATS_FAILED, STATS_PASSED, STATS_SKIPPED } from 'common/constants/statistics';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FiltersControl, InputControl, TogglerControl } from '../controls';
import { getWidgetCriteriaOptions } from '../utils/getWidgetCriteriaOptions';
import { DEFECT_STATISTICS_OPTIONS, TO_INVESTIGATE_OPTION, ITEMS_INPUT_WIDTH } from '../constants';
import { AttributesFieldArray } from './attributesFieldArray';
import styles from '../widgetControls.scss';

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
  attributesTitle: {
    id: 'CumulativeTrendControls.attributesTitle',
    defaultMessage: 'Add attributes',
  },
  ItemsValidationError: {
    id: 'CumulativeTrendControls.ItemsValidationError',
    defaultMessage: 'Items count should have value from 1 to 15',
  },
  attributeKeyValidationError: {
    id: 'CumulativeTrendControls.attributeKeyValidationError',
    defaultMessage: 'Value should have size from 1 to 128',
  },
  attributesArrayValidationError: {
    id: 'CumulativeTrendControls.attributesArrayValidationError',
    defaultMessage:
      'Enter an attribute key whose unique values will be used for combine launches into groups',
  },
});
const validators = {
  items: (formatMessage) => (value) =>
    (!value || !validate.inRangeValidate(value, 1, 15)) &&
    formatMessage(messages.ItemsValidationError),
  attributeKey: (formatMessage) => (value) => {
    if (!value) {
      return formatMessage(messages.attributesArrayValidationError);
    } else if (!validate.attributeKey(value)) {
      return formatMessage(messages.attributeKeyValidationError);
    }
    return undefined;
  },
};

@injectIntl
export class CumulativeTrendControls extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    initializeControlsForm: PropTypes.func.isRequired,
    formAppearance: PropTypes.object.isRequired,
    onFormAppearanceChange: PropTypes.func.isRequired,
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

  tabItems = [
    {
      value: '1',
      label: 'All launches',
    },
    {
      value: '2',
      label: 'Latest Launches',
    },
  ];

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
            <TogglerControl disabled fieldLabel=" " items={this.tabItems} value="2" />

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
                hintType={'top-right'}
              />
            </FieldProvider>

            <div className={cx('attr-header')}>{formatMessage(messages.attributesTitle)}</div>
            <FieldArray
              name="contentParameters.widgetOptions.attributes"
              component={AttributesFieldArray}
              fieldValidator={validators.attributeKey(formatMessage)}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }
}
