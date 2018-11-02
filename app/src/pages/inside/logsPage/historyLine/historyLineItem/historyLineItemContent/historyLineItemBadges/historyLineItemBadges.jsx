import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import {
  AUTOMATION_BUG,
  NO_DEFECT,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';
import { SKIPPED, RESETED, FAILED, MANY, NOT_FOUND } from 'common/constants/launchStatuses';
import Parser from 'html-react-parser';
import styles from './historyLineItemBadges.scss';
import NoItemIcon from './img/noItem-inline.svg';
import EmptyItemIcon from './img/emptyItem-inline.svg';
import NotEyeIcon from './img/notEyeItem-inline.svg';
import DurationIcon from './img/duration-icon-inline.svg';
import InfoIcon from './img/info-icon-inline.svg';

const cx = classNames.bind(styles);

const defectsTitleMap = {
  [AUTOMATION_BUG]: 'ab',
  [NO_DEFECT]: 'nd',
  [PRODUCT_BUG]: 'pb',
  [SYSTEM_ISSUE]: 'si',
  [TO_INVESTIGATE]: 'ti',
};

export class HistoryLineItemBadges extends Component {
  static propTypes = {
    active: PropTypes.bool,
    status: PropTypes.string,
    issue: PropTypes.object,
    growthDuration: PropTypes.string,
    defects: PropTypes.object,
  };

  static defaultProps = {
    active: false,
    status: '',
    issue: {},
    growthDuration: '',
    defects: {},
  };

  getDefectBadge = () => {
    const { defects } = this.props;
    const defectType = Object.keys(defects).find((key) => defects[key].total);

    return (
      defectType && (
        <div key={defectType} className={cx('defect-badge', `type-${defectsTitleMap[defectType]}`)}>
          <span>{defectsTitleMap[defectType]}</span>
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
        <div key={growthDuration} title={growthDuration} className={cx('growth-duration', 'hide')}>
          <i className={cx('duration-icon')}>{Parser(DurationIcon)}</i>
          <span className={cx('duration-text')}>{growthDuration}</span>
        </div>,
      );

    return badges;
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
