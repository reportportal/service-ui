/*
 * Copyright 2023 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FieldProvider } from 'components/fields';
import styles from './fieldElement.scss';

const cx = classNames.bind(styles);

export const FieldElement = (props) => {
  const {
    label,
    description,
    descriptionSecondary,
    children,
    className,
    childrenClassName,
    labelClassName,
    descriptionClassName,
    withoutProvider,
    dataAutomationId,
    isRequired,
    additionalInfo,
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
FieldElement.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  descriptionSecondary: PropTypes.string,
  additionalInfo: PropTypes.node,
  className: PropTypes.string,
  childrenClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  descriptionClassName: PropTypes.string,
  withoutProvider: PropTypes.bool,
  dataAutomationId: PropTypes.string,
  isRequired: PropTypes.bool,
};
FieldElement.defaultProps = {
  label: '',
  description: '',
  descriptionSecondary: '',
  additionalInfo: null,
  className: '',
  childrenClassName: '',
  labelClassName: '',
  descriptionClassName: '',
  withoutProvider: false,
  dataAutomationId: null,
  isRequired: false,
};
