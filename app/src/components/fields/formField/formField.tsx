/*
 * Copyright 2026 EPAM Systems
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

import type { ReactNode } from 'react';
import { PureComponent } from 'react';
import type { BaseFieldProps } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { createClassnames } from 'common/utils';
import styles from './formField.scss';

const cx = createClassnames(styles);

export type FormFieldProps = Partial<BaseFieldProps> & {
  containerClassName?: string;
  labelClassName?: string;
  fieldWrapperClassName?: string;
  customBlock?: {
    wrapperClassName?: string;
    node: ReactNode;
  } | null;
  label?: string;
  disabled?: boolean;
  children?: ReactNode;
  required?: boolean;
  withoutProvider?: boolean;
  placeholder?: string;
};

export class FormField extends PureComponent<FormFieldProps> {
  render() {
    const {
      containerClassName = '',
      labelClassName = '',
      fieldWrapperClassName = '',
      customBlock = null,
      label = '',
      onChange = () => {},
      normalize = (value: unknown) => value,
      format = (value: unknown) => value,
      parse = (value: unknown) => value,
      disabled = false,
      children = null,
      required = false,
      withoutProvider = false,
      ...rest
    } = this.props;
    const fieldProviderProps = { ...rest, disabled, onChange, normalize, format, parse };
    return (
      <div className={cx('form-field', containerClassName)}>
        <span className={cx('form-group-label', labelClassName, { required })}>{label}</span>
        <div className={cx('field-wrapper', fieldWrapperClassName)}>
          {withoutProvider ? children : <FieldProvider {...fieldProviderProps}>{children}</FieldProvider>}
        </div>
        {customBlock && (
          <div className={cx('custom-block', customBlock.wrapperClassName)}>{customBlock.node}</div>
        )}
      </div>
    );
  }
}
