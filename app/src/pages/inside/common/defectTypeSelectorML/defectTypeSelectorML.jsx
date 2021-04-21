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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import { DefectTypeItemML } from 'pages/inside/common/defectTypeItemML';
import styles from './defectTypeSelectorML.scss';

const cx = classNames.bind(styles);

export const DefectTypeSelectorML = ({ selectDefectType, selectedItem }) => {
  const defectTypes = useSelector(defectTypesSelector);

  return (
    <>
      {Object.keys(defectTypes).length > 0 && (
        <div className={cx('defect-options')}>
          {DEFECT_TYPES_SEQUENCE.map((option) => (
            <div key={option} className={cx('select-option-group')}>
              {defectTypes[option].map((defectType) => (
                <div key={defectType.locator} className={cx('select-option')}>
                  <DefectTypeItemML
                    defectType={defectType}
                    isSelected={defectType.locator === selectedItem}
                    onClick={() => selectDefectType(defectType.locator)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
DefectTypeSelectorML.propTypes = {
  selectDefectType: PropTypes.func,
  selectedItem: PropTypes.string,
};
DefectTypeSelectorML.defaultProps = {
  selectDefectType: null,
  selectedItem: '',
};
