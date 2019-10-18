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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FIELD_LABEL_WIDTH } from './constants';
import styles from './inputControl.scss';

const cx = classNames.bind(styles);

export const InputControl = ({ fieldLabel, inputWidth, tip, inputBadge, ...rest }) => (
  <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH} tip={tip}>
    <div style={{ width: inputWidth || 'unset' }}>
      <FieldErrorHint {...rest}>
        <Fragment>
          <Input {...rest} />
          {inputBadge && <span className={cx('input-badge')}>{inputBadge}</span>}
        </Fragment>
      </FieldErrorHint>
    </div>
  </ModalField>
);
InputControl.propTypes = {
  fieldLabel: PropTypes.string,
  tip: PropTypes.string,
  inputWidth: PropTypes.number,
  inputBadge: PropTypes.string,
};
InputControl.defaultProps = {
  fieldLabel: '',
  tip: '',
  inputWidth: null,
  inputBadge: '',
};
