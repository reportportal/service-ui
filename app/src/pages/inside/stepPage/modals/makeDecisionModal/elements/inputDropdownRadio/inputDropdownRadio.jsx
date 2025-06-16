/*
 * Copyright 2021 EPAM Systems
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

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useOnClickOutside } from 'common/hooks';
import { InputRadioGroup } from 'components/inputs/inputRadioGroup';
import styles from './inputDropdownRadio.scss';

const cx = classNames.bind(styles);

export function InputDropdownRadio({
  outsideClickHandler,
  expanded,
  onToggle,
  selectedOption,
  loading,
  optionValue,
  onChangeOption,
  options,
  className,
}) {
  const ref = useRef();
  useOnClickOutside(ref, outsideClickHandler);

  return (
    <div ref={ref} className={cx('wrapper', { opened: expanded }, className.dropdownWrapper)}>
      <span className={cx('selected-option-block')}>
        <span className={cx('selected-option', className.selectedOption)} onClick={onToggle}>
          {selectedOption}
        </span>
        <span className={cx('arrow', { opened: expanded }, className.arrow)} />
      </span>
      {expanded && (
        <div
          className={cx('options', { loading }, className.options)}
          onClick={(e) => e.stopPropagation()}
        >
          <InputRadioGroup
            value={optionValue}
            onChange={onChangeOption}
            options={options}
            inputGroupClassName={cx('radio-input-group')}
            mode="dark"
            size="small"
          />
        </div>
      )}
    </div>
  );
}
InputDropdownRadio.propTypes = {
  outsideClickHandler: PropTypes.func,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  selectedOption: PropTypes.string.isRequired,
  optionValue: PropTypes.string.isRequired,
  onChangeOption: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.object,
};
InputDropdownRadio.defaultProps = {
  outsideClickHandler: () => {},
  expanded: false,
  onToggle: () => {},
  loading: false,
  className: {},
};
