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
import { injectIntl, defineMessages } from 'react-intl';
import { DefectLink } from 'pages/inside/common/defectLink';
import styles from './defectTypeTooltip.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  product_bug_total: { id: 'DefectTypeTooltip.pb-total', defaultMessage: 'Total product bugs' },
  automation_bug_total: {
    id: 'DefectTypeTooltip.ab-total',
    defaultMessage: 'Total automation bugs',
  },
  system_issue_total: { id: 'DefectTypeTooltip.si-total', defaultMessage: 'Total system issues' },
  no_defect_total: { id: 'DefectTypeTooltip.nd-total', defaultMessage: 'Total no defects' },
  to_investigate_total: {
    id: 'DefectTypeTooltip.ti-total',
    defaultMessage: 'Total to investigate',
  },
});

@injectIntl
@connect((state) => ({
  projectConfig: projectConfigSelector(state),
}))
export class DefectTypeTooltip extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    projectConfig: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    tooltipEventInfo: PropTypes.object,
    itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ownLinkParams: PropTypes.object,
    detailedView: PropTypes.bool,
    detailedData: PropTypes.object,
    isStepLevel: PropTypes.bool,
    singleDefectView: PropTypes.bool,
    target: PropTypes.string,
    listViewLinkParams: PropTypes.shape({
      launchesLimit: PropTypes.number,
      compositeAttribute: PropTypes.string,
      isLatest: PropTypes.bool,
      filterType: PropTypes.bool,
    }),
  };

  static defaultProps = {
    itemId: null,
    tooltipEventInfo: {},
    ownLinkParams: null,
    detailedView: false,
    detailedData: {},
    isStepLevel: false,
    singleDefectView: false,
    target: '',
    listViewLinkParams: {},
  };

  getFilteredBodyData = (config) => {
    const { data = [] } = this.props;

    return Object.keys(data)
      .map((key) => config.find((item) => item.locator === key))
      .filter((item) => item)
      .sort((a, b) => a.id - b.id)
      .filter(({ locator }, i) => i === 0 || data[locator] > 0);
  };

  hasTotal = (defectTypesConfig, defectTypes) => {
    if (defectTypes.length > 1) {
      return true;
    }
    return (
      defectTypesConfig.findIndex((defectType) => defectType.locator === defectTypes[0].locator) > 0
    );
  };

  renderDefectItem = (color, name, defects, className, dataKey) => {
    const {
      data,
      itemId,
      ownLinkParams,
      target,
      listViewLinkParams,
      tooltipEventInfo,
      detailedView,
      detailedData,
      isStepLevel,
    } = this.props;

    return detailedView ? (
      <div key={dataKey} className={className}>
        <div className={cx('name')}>
          <div className={cx('circle')} style={{ backgroundColor: color }} />
          {name}
        </div>
        <span className={cx('value-container')}>
          <DefectLink
            itemId={itemId}
            ownLinkParams={ownLinkParams}
            target={target}
            listViewLinkParams={listViewLinkParams}
            defects={defects}
            className={cx('value')}
            eventInfo={tooltipEventInfo}
          >
            {data[dataKey]}
          </DefectLink>
          {detailedData[dataKey] && isStepLevel ? (
            <DefectLink
              itemId={itemId}
              ownLinkParams={ownLinkParams}
              defects={defects.filter((defectKey) => !!detailedData[defectKey])}
              target={target}
              listViewLinkParams={listViewLinkParams}
              keepFilterParams
              className={cx('value', 'detailed')}
              eventInfo={tooltipEventInfo}
            >
              {detailedData[dataKey]}
            </DefectLink>
          ) : (
            <span className={cx('value', 'detailed', 'disabled')}>
              {detailedData[dataKey] || 0}
            </span>
          )}
        </span>
      </div>
    ) : (
      <DefectLink
        key={dataKey}
        itemId={itemId}
        ownLinkParams={ownLinkParams}
        defects={defects}
        target={target}
        listViewLinkParams={listViewLinkParams}
        className={cx('item')}
        eventInfo={tooltipEventInfo}
      >
        <div className={cx('name')}>
          <div className={cx('circle')} style={{ backgroundColor: color }} />
          {name}
        </div>
        <span className={cx('value')}>{data[dataKey]}</span>
      </DefectLink>
    );
  };

  render() {
    const {
      data,
      type,
      projectConfig,
      singleDefectView,
      intl: { formatMessage },
    } = this.props;

    const defectConfig = projectConfig.subTypes && projectConfig.subTypes[type.toUpperCase()];

    const filteredBodyData = this.getFilteredBodyData(defectConfig);

    return (
      <div className={cx('defect-type-tooltip')}>
        {defectConfig && (
          <Fragment>
            {!singleDefectView &&
              this.hasTotal(defectConfig, filteredBodyData) &&
              this.renderDefectItem(
                defectConfig[0].color,
                formatMessage(messages[`${type.toLowerCase()}_total`]),
                Object.keys(data),
                cx('total-item'),
                'total',
              )}
            {/**
             * Display defect types in a proper order,
             * the first is the system type (Product Bug, To investigate, etc.)
             * that is way they are sorted by ID
             * Don't display defect sub types with zero defect's amount,
             * except system types (i.e. with index=0)
             */
            filteredBodyData.map(({ locator, color, longName }) => {
              return this.renderDefectItem(color, longName, [locator], cx('item'), locator);
            })}
          </Fragment>
        )}
      </div>
    );
  }
}
