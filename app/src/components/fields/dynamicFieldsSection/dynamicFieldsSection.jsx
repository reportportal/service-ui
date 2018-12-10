import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { FILEDS_MAP } from './constants';
import styles from './dynamicFieldsSection.scss';

const cx = classNames.bind(styles);

@injectIntl
export class DynamicFieldsSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    fields: PropTypes.array,
    customBlock: PropTypes.func,
  };

  static defaultProps = {
    fields: [],
    customBlock: null,
  };

  createFields = () => {
    const { fields = [], customBlock } = this.props;

    return fields.map((field) => {
      const FieldComponent = FILEDS_MAP[field.type];

      return <FieldComponent key={field.id} field={field} customBlock={customBlock} />;
    });
  };

  render() {
    return <div className={cx('dynamic-fields-section')}>{this.createFields()}</div>;
  }
}
