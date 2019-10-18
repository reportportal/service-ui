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

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { getDefectTypeSelector } from 'controllers/project';
import styles from './defectTypeItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  getDefectType: getDefectTypeSelector(state),
}))
export class DefectTypeItem extends Component {
  static propTypes = {
    getDefectType: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    noBorder: PropTypes.bool,
    lesserFont: PropTypes.bool,
  };

  static defaultProps = {
    onClick: () => {},
    noBorder: false,
    lesserFont: false,
  };

  handleChange = () => {
    const { type, onClick } = this.props;
    onClick(type);
  };

  render() {
    const { noBorder, lesserFont, onClick } = this.props;
    const defectType = this.props.getDefectType(this.props.type);
    if (!defectType) {
      return null;
    }
    return (
      <div
        className={cx('defect-type-item', { 'no-border': noBorder, 'lesser-Font': lesserFont })}
        title={defectType.longName}
        onClick={onClick}
      >
        <div className={cx('defect-type-circle')} style={{ backgroundColor: defectType.color }} />
        <div className={cx('defect-type-name')}>{defectType.longName}</div>
      </div>
    );
  }
}
