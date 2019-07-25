import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { dynamicFieldShape } from './dynamicFieldShape';
import { getFieldComponent } from './utils';
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
  };

  static defaultProps = {
    fields: [],
    withValidation: false,
    customBlockCreator: null,
    customFieldWrapper: null,
  };

  getCustomBlockConfig = (field) => {
    if (this.props.customBlockCreator) {
      return this.props.customBlockCreator(field);
    }

    return null;
  };

  createFields = () => {
    const { fields = [], customFieldWrapper, withValidation } = this.props;

    return fields.map((field) => {
      const FieldComponent = getFieldComponent(field);

      return (
        <FieldComponent
          key={field.id}
          field={field}
          customBlock={this.getCustomBlockConfig(field)}
          withValidation={withValidation}
          customFieldWrapper={customFieldWrapper}
        />
      );
    });
  };

  render() {
    return <div className={cx('dynamic-fields-section')}>{this.createFields()}</div>;
  }
}
