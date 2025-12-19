/*
 * Copyright 2025 EPAM Systems
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

import { ReactNode } from 'react';
import { createClassnames } from 'common/utils';
import { FieldProvider } from 'components/fields';

import styles from './fieldElement.scss';

const cx = createClassnames(styles);

interface FieldElementProps {
  children: ReactNode;
  label?: string;
  description?: string;
  descriptionSecondary?: string;
  additionalInfo?: ReactNode;
  className?: string;
  childrenClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  withoutProvider?: boolean;
  dataAutomationId?: string;
  isRequired?: boolean;
  [key: string]: unknown;
}

export const FieldElement = (props: FieldElementProps) => {
  const {
    label = '',
    description = '',
    descriptionSecondary = '',
    children,
    className = '',
    childrenClassName = '',
    labelClassName = '',
    descriptionClassName = '',
    withoutProvider = false,
    dataAutomationId,
    isRequired = false,
    additionalInfo = null,
    ...rest
  } = props;
  const getChildren = () =>
    withoutProvider ? children : <FieldProvider {...rest}>{children}</FieldProvider>;

  return (
    <div className={cx('wrapper', className)} data-automation-id={dataAutomationId}>
      {label ? (
        <>
          <span className={cx('label', labelClassName)}>
            {label}
            {isRequired && <span className={cx('asterisk')}>*</span>}
          </span>
          {description && (
            <span className={cx('description', descriptionClassName)}>{description}</span>
          )}
          <div className={cx(childrenClassName)}>{getChildren()}</div>
          {descriptionSecondary && (
            <span className={cx('description-alt', descriptionClassName)}>
              {descriptionSecondary}
            </span>
          )}
        </>
      ) : (
        <>
          {getChildren()}
          {description && (
            <span className={cx('description-alt', descriptionClassName)}>{description}</span>
          )}
        </>
      )}
      {additionalInfo}
    </div>
  );
};
