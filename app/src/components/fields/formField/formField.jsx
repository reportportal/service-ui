/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FieldProvider } from 'components/fields/fieldProvider';
import styles from './formField.scss';

const cx = classNames.bind(styles);

export class FormField extends PureComponent {
  static propTypes = {
    containerClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    fieldWrapperClassName: PropTypes.string,
    customBlock: PropTypes.shape({
      wrapperClassName: PropTypes.string,
      node: PropTypes.element,
    }),
    label: PropTypes.string,
    onChange: PropTypes.func,
    normalize: PropTypes.func,
    format: PropTypes.func,
    parse: PropTypes.func,
    disabled: PropTypes.bool,
    children: PropTypes.any,
    required: PropTypes.bool,
    withoutProvider: PropTypes.bool,
  };

  static defaultProps = {
    containerClassName: '',
    labelClassName: '',
    fieldWrapperClassName: '',
    customBlock: null,
    label: '',
    onChange: () => {},
    normalize: (value) => value,
    format: (value) => value,
    parse: (value) => value,
    disabled: false,
    children: null,
    required: false,
    withoutProvider: false,
  };

  render() {
    const {
      containerClassName,
      labelClassName,
      fieldWrapperClassName,
      customBlock,
      label,
      children,
      required,
      withoutProvider,
      ...rest
    } = this.props;
    return (
      <div className={cx('form-field', containerClassName)}>
        <span className={cx('form-group-label', labelClassName, { required })}>{label}</span>
        <div className={cx('field-wrapper', fieldWrapperClassName)}>
          {withoutProvider ? children : <FieldProvider {...rest}>{children}</FieldProvider>}
        </div>
        {customBlock && (
          <div className={cx('custom-block', customBlock.wrapperClassName)}>{customBlock.node}</div>
        )}
      </div>
    );
  }
}
