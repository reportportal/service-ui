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
    customBlockCreator: PropTypes.func,
    customFieldWrapper: PropTypes.func,
  };

  static defaultProps = {
    fields: [],
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
    const { fields = [], customFieldWrapper } = this.props;

    return fields.map((field) => {
      const FieldComponent = getFieldComponent(field);

      return (
        <FieldComponent
          key={field.id}
          field={field}
          customFieldWrapper={customFieldWrapper}
          customBlock={this.getCustomBlockConfig(field)}
        />
      );
    });
  };

  render() {
    return <div className={cx('dynamic-fields-section')}>{this.createFields()}</div>;
  }
}
