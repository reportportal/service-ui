import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { dynamicFieldShape } from './dynamicFieldShape';
import { getFieldComponent } from './utils';
import { VALUE_ID_KEY, VALUE_NAME_KEY } from './constants';
import styles from './dynamicFieldsSection.scss';

const cx = classNames.bind(styles);

@injectIntl
export class DynamicFieldsSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    fields: PropTypes.arrayOf(dynamicFieldShape),
    withValidation: PropTypes.bool,
    customBlockCreator: PropTypes.func,
    customFieldWrapper: PropTypes.func,
    // default field property to use as value (depends on different sets of fields)
    defaultOptionValueKey: PropTypes.oneOf([VALUE_ID_KEY, VALUE_NAME_KEY]),
  };

  static defaultProps = {
    fields: [],
    withValidation: false,
    customBlockCreator: null,
    customFieldWrapper: null,
    defaultOptionValueKey: VALUE_NAME_KEY,
  };

  getCustomBlockConfig = (field) => {
    if (this.props.customBlockCreator) {
      return this.props.customBlockCreator(field);
    }

    return null;
  };

  createFields = () => {
    const { fields = [], customFieldWrapper, withValidation, defaultOptionValueKey } = this.props;

    return fields.map((field) => {
      const FieldComponent = getFieldComponent(field);

      return (
        <FieldComponent
          key={field.id}
          field={field}
          customBlock={this.getCustomBlockConfig(field)}
          withValidation={withValidation}
          customFieldWrapper={customFieldWrapper}
          defaultOptionValueKey={defaultOptionValueKey}
        />
      );
    });
  };

  render() {
    return <div className={cx('dynamic-fields-section')}>{this.createFields()}</div>;
  }
}
