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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { SKIPPED, RESETED, FAILED, MANY, NOT_FOUND } from 'common/constants/launchStatuses';
import { COLOR_BLACK_2, COLOR_WHITE_TWO } from 'common/constants/colors';
import Parser from 'html-react-parser';
import styles from './historyLineItemBadges.scss';
import NoItemIcon from './img/noItem-inline.svg';
import EmptyItemIcon from './img/emptyItem-inline.svg';
import NotEyeIcon from './img/notEyeItem-inline.svg';
import DurationIcon from './img/duration-icon-inline.svg';
import InfoIcon from './img/info-icon-inline.svg';

const cx = classNames.bind(styles);

export class HistoryLineItemBadges extends Component {
  static propTypes = {
    active: PropTypes.bool,
    status: PropTypes.string,
    issue: PropTypes.object,
    growthDuration: PropTypes.string,
    defects: PropTypes.object,
    defectTypes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    active: false,
    status: '',
    issue: {},
    growthDuration: '',
    defects: {},
  };

  getDefectBadge = () => {
    const {
      defects,
      defectTypes,
      issue: { issueType: issueLocator },
    } = this.props;
    const defectType = Object.keys(defects).find((key) => defects[key].total);
    const allDefectsList = Object.values(defectTypes).reduce(
      (allDefects, nextGroup) => [...allDefects, ...nextGroup],
      [],
    );
    const { shortName, color: defectColor = COLOR_WHITE_TWO } =
      allDefectsList.find((el) => el.locator === issueLocator) || {};
    const fontColor = this.calculateFontColor(defectColor);

    return (
      defectType && (
        <div
          key={defectType}
          style={{ backgroundColor: defectColor }}
          className={cx('defect-badge')}
        >
          <span style={{ color: fontColor }}>{shortName}</span>
        </div>
      )
    );
  };

  getBadges = () => {
    const { status, growthDuration } = this.props;
    const badges = [];
    // eslint-disable-next-line default-case
    switch (status.toLowerCase()) {
      case FAILED:
      case SKIPPED: {
        badges.push(this.getDefectBadge());
        break;
      }
      case RESETED: {
        badges.push(
          <i key={status} className={cx('empty-item-icon')}>
            {Parser(EmptyItemIcon)}
          </i>,
        );
        break;
      }
      case MANY: {
        badges.push(
          <i key={status} className={cx('many-items-icon')}>
            {Parser(NotEyeIcon)}
          </i>,
        );
        break;
      }
      case NOT_FOUND: {
        badges.push(
          <i key={status} className={cx('no-item-icon')}>
            {Parser(NoItemIcon)}
          </i>,
        );
        break;
      }
    }

    growthDuration &&
      badges.push(
        <div key={growthDuration} title={growthDuration} className={cx('growth-duration')}>
          <i className={cx('duration-icon')}>{Parser(DurationIcon)}</i>
          <span className={cx('duration-text')}>{growthDuration}</span>
        </div>,
      );

    return badges;
  };

  // calculate contrast of background - foreground colors using algorithm recommended by w3c.org
  calculateFontColor = (color = '') => {
    const hexcolor = color.slice(1);

    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const bgBrightnessLevel = (r * 299 + g * 587 + b * 114) / 1000;

    return bgBrightnessLevel >= 125 ? COLOR_BLACK_2 : COLOR_WHITE_TWO;
  };

  render() {
    const { active, issue } = this.props;

    return (
      <Fragment>
        <div className={cx('badges-container')}>{this.getBadges()}</div>
        {(issue.comment || (issue.externalSystemIssues && issue.externalSystemIssues.length)) && (
          <i className={cx('info-icon', { 'active-icon': active })}>{Parser(InfoIcon)}</i>
        )}
      </Fragment>
    );
  }
}
