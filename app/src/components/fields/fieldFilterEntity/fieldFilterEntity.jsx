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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import styles from './fieldFilterEntity.scss';

const cx = classNames.bind(styles);

export const FieldFilterEntity = ({
  title,
  children,
  removable,
  stretchable,
  smallSize,
  onRemove,
  vertical,
}) => (
  <div className={cx('field-filter-entity', { stretchable, small: smallSize, vertical })}>
    <span className={cx('entity-name', { vertical })}>{title}</span>
    {removable && (
      <i className={cx('close-icon')} onClick={onRemove}>
        {Parser(CrossIcon)}
      </i>
    )}
    <div className={cx('entity-input-holder', { vertical })}>{children}</div>
  </div>
);
FieldFilterEntity.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  smallSize: PropTypes.bool,
  removable: PropTypes.bool,
  stretchable: PropTypes.bool,
  vertical: PropTypes.bool,
  onRemove: PropTypes.func,
};
FieldFilterEntity.defaultProps = {
  children: null,
  title: '',
  smallSize: false,
  removable: true,
  stretchable: false,
  vertical: false,
  onRemove: () => {},
};
