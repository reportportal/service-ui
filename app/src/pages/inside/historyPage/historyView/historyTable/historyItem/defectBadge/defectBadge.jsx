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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { DefectTypeTooltip } from 'pages/inside/common/defectTypeTooltip';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './defectBadge.scss';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: DefectTypeTooltip,
  data: {
    width: 235,
    placement: 'left',
    noArrow: true,
    desktopOnly: true,
  },
})
export class DefectBadge extends Component {
  static propTypes = {
    defectTitle: PropTypes.string,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    type: PropTypes.string,
    data: PropTypes.object,
  };

  static defaultProps = {
    defectTitle: '',
    color: '',
    backgroundColor: '',
    type: '',
    data: {},
  };

  render() {
    const { defectTitle, color, backgroundColor } = this.props;

    return (
      <div className={cx('defect-badge', defectTitle)} style={{ backgroundColor }}>
        <span className={cx('defect-title')} style={{ color }}>
          {defectTitle}
        </span>
      </div>
    );
  }
}
