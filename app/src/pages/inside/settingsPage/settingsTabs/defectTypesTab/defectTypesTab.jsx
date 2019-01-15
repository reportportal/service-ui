/* eslint-disable guard-for-in */
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
import { Messages } from './defectTypesTabMessages';
import styles from './defectTypesTab.scss';
import { DefectTypesGroup } from './defectTypesGroup/defectTypesGroup';

const cx = classNames.bind(styles);

@connect((state) => ({
  subTypes: defectTypesSelector(state),
}))
@injectIntl
export class DefectTypesTab extends Component {
  static propTypes = {
    subTypes: PropTypes.object,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    subTypes: [],
    intl: {},
  };

  DEFECT_TYPE_GROUP_TITLES = {
    PRODUCT_BUG: this.props.intl.formatMessage(Messages.PRODUCT_BUG_MSG),
    SYSTEM_ISSUE: this.props.intl.formatMessage(Messages.SYSTEM_ISSUE_MSG),
    AUTOMATION_BUG: this.props.intl.formatMessage(Messages.AUTOMATION_BUG_MSG),
    NO_DEFECT: this.props.intl.formatMessage(Messages.NO_DEFECT_MSG),
    TO_INVESTIGATE: this.props.intl.formatMessage(Messages.TO_INVESTIGATE_MSG),
  };

  DefectTypesTableHeader = ({ formatMessage }) => (
    <div className={cx('table_header')}>
      <div className={cx('table_column', 'table_column--defect-name')}>
        {formatMessage(Messages.defectName)}
      </div>
      <div className={cx('table_column', 'table_column--shortName')}>
        {formatMessage(Messages.abbreviation)}
      </div>
      <div className={cx('table_column', 'table_column--color')}>
        {formatMessage(Messages.color)}
      </div>
      <div className={cx('table_column', 'table_column--diagram')}>
        {formatMessage(Messages.diagram)}
      </div>
    </div>
  );

  sortinSubTypes() {
    this.subTypes = this.props.subTypes;
    // eslint-disable-next-line guard-for-in
    // eslint-disable-next-line no-restricted-syntax
    for (const group in this.subTypes) {
      this.subTypes[group] = this.subTypes[group].sort((obj1, obj2) => obj1.id - obj2.id);
    }
  }

  render() {
    const SUBTYPES_GROUP_SEQUENCE = [
      PRODUCT_BUG,
      SYSTEM_ISSUE,
      AUTOMATION_BUG,
      NO_DEFECT,
      TO_INVESTIGATE,
    ];

    this.sortinSubTypes();
    return (
      <div className={cx('settings-tab-content')}>
        <this.DefectTypesTableHeader formatMessage={this.props.intl.formatMessage} />
        {SUBTYPES_GROUP_SEQUENCE.map((group) => group.toUpperCase()).map((group) => (
          <DefectTypesGroup
            cx={cx}
            key={group}
            title={this.DEFECT_TYPE_GROUP_TITLES[group]}
            group={group}
            subType={this.subTypes[group]}
          />
        ))}
      </div>
    );
  }
}
