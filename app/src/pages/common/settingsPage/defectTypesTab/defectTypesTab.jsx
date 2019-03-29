import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';

import { defectTypesSelector } from 'controllers/project';
import {
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
  NO_DEFECT,
} from 'common/constants/defectTypes';

import { DefectTypesGroup } from './defectTypesGroup';
import { defectTypeShape } from './defectTypeShape';
import { messages } from './defectTypesMessages';

import styles from './defectTypesTab.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  subTypes: defectTypesSelector(state),
}))
@injectIntl
export class DefectTypesTab extends Component {
  static propTypes = {
    subTypes: PropTypes.objectOf(PropTypes.arrayOf(defectTypeShape)).isRequired,
    intl: intlShape.isRequired,
  };

  groupNames = [PRODUCT_BUG, SYSTEM_ISSUE, AUTOMATION_BUG, NO_DEFECT, TO_INVESTIGATE];

  render() {
    const { subTypes, intl } = this.props;
    return (
      <div className={cx('defect-types-list')}>
        <div className={cx('header')}>
          <div className={cx('header-cell', 'name-cell')}>
            {intl.formatMessage(messages.defectNameCol)}
          </div>
          <div className={cx('header-cell', 'abbr-cell')}>
            {intl.formatMessage(messages.abbreviationCol)}
          </div>
          <div className={cx('header-cell', 'color-cell')}>
            {intl.formatMessage(messages.colorCol)}
          </div>
          <div className={cx('header-cell', 'diagram-cell')}>
            {intl.formatMessage(messages.diagramCol)}
          </div>
        </div>
        {this.groupNames.map((groupName) => (
          <React.Fragment key={groupName}>
            <div className={cx('group-name')}>{intl.formatMessage(messages[groupName])}</div>
            <DefectTypesGroup group={subTypes[groupName.toUpperCase()]} />
          </React.Fragment>
        ))}
      </div>
    );
  }
}
