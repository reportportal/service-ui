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
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { defectTypesSelector } from 'controllers/project';
import { DefectLink } from 'pages/inside/common/defectLink';
import { DonutChart } from './donutChart';
import styles from './defectStatistics.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  projectDefects: defectTypesSelector(state),
}))
export class DefectStatistics extends Component {
  static propTypes = {
    type: PropTypes.string,
    projectDefects: PropTypes.object,
    data: PropTypes.object,
    customProps: PropTypes.object,
    target: PropTypes.string,
    listViewLinkParams: PropTypes.shape({
      launchesLimit: PropTypes.number,
      compositeAttribute: PropTypes.string,
      isLatest: PropTypes.bool,
      filterType: PropTypes.bool,
    }),
    itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    eventInfo: PropTypes.object,
    tooltipEventInfo: PropTypes.object,
    ownLinkParams: PropTypes.shape({
      payload: PropTypes.object,
      page: PropTypes.string,
    }),
  };

  static defaultProps = {
    type: '',
    projectDefects: {},
    customProps: {},
    data: {},
    target: '',
    listViewLinkParams: {},
    eventInfo: {},
    tooltipEventInfo: {},
    ownLinkParams: {},
  };

  getDefectList = () => {
    const { projectDefects, type } = this.props;
    const defects = projectDefects[type.toUpperCase()];
    if (!defects) {
      return [];
    }
    return defects.map((item) => item.locator);
  };

  render() {
    const {
      type,
      data,
      customProps,
      itemId,
      eventInfo,
      tooltipEventInfo,
      ownLinkParams,
      target,
      listViewLinkParams,
    } = this.props;

    const defectList = this.getDefectList();

    return (
      <div className={cx('defect-statistics')}>
        <span className={cx('title')}>
          <span className={cx('circle', { [`type-${type}`]: type })} />
          {customProps.abbreviation}
        </span>
        {!!data.total && (
          <Fragment>
            <div className={cx('desktop-visible')}>
              <DonutChart
                itemId={itemId}
                data={data}
                type={type}
                defects={defectList}
                target={target}
                listViewLinkParams={listViewLinkParams}
                viewBox={64}
                strokeWidth={13}
                eventInfo={eventInfo}
                ownLinkParams={ownLinkParams}
                tooltipEventInfo={tooltipEventInfo}
              />
            </div>
            <div className={cx('desktop-hidden')}>
              <DefectLink
                itemId={itemId}
                defects={defectList}
                target={target}
                listViewLinkParams={listViewLinkParams}
                ownLinkParams={ownLinkParams}
                eventInfo={eventInfo}
              >
                {data.total}
              </DefectLink>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
