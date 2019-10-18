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

import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { projectConfigSelector } from 'controllers/project';
import { DefectTypeTooltip } from 'pages/inside/common/defectTypeTooltip';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import styles from './defectTypeBlock.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: DefectTypeTooltip,
  data: {
    width: 235,
    placement: 'bottom-end',
    noArrow: true,
    desktopOnly: true,
  },
})
@connect((state) => ({
  projectConfig: projectConfigSelector(state),
}))
export class DefectTypeBlock extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    projectConfig: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
  };

  render() {
    const defectType =
      this.props.projectConfig.subTypes &&
      this.props.projectConfig.subTypes[this.props.type.toUpperCase()][0];
    return (
      <div className={cx('defect-type-block')}>
        {defectType && (
          <Fragment>
            <div className={cx('circle')} style={{ backgroundColor: defectType.color }} />
            <span className={cx('title')}>{defectType.shortName}</span>
            <div className={cx('value')} style={{ borderColor: defectType.color }}>
              {this.props.data.total}
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
