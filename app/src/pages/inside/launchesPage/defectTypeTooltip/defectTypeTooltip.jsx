import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TO_INVESTIGATE } from 'common/constants/defectTypes';
import { projectConfigSelector } from 'controllers/project';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import styles from './defectTypeTooltip.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  product_bug_total: { id: 'DefectTypeTooltip.pb-total', defaultMessage: 'Total product bugs' },
  automation_bug_total: { id: 'DefectTypeTooltip.ab-total', defaultMessage: 'Total automation bugs' },
  system_issue_total: { id: 'DefectTypeTooltip.si-total', defaultMessage: 'Total system issues' },
  no_defect_total: { id: 'DefectTypeTooltip.nd-total', defaultMessage: 'Total no defects' },
});

@injectIntl
@connect(state => ({
  projectConfig: projectConfigSelector(state),
}))
export class DefectTypeTooltip extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    projectConfig: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };
  render() {
    const { formatMessage } = this.props.intl;
    const defectConfig = this.props.projectConfig.subTypes[this.props.type.toUpperCase()];

    return (
      <div className={cx('defect-type-tooltip')}>
        {
          (this.props.type !== TO_INVESTIGATE) &&
          <a href="/" className={cx('total-item')}>
            <div className={cx('name')}>
              <div className={cx('circle')} style={{ backgroundColor: defectConfig[0].color }} />
              { formatMessage(messages[`${this.props.type}_total`]) }
            </div>
            <span className={cx('value')}>
              { this.props.data.total }
            </span>
          </a>
        }
        {
          Object.keys(this.props.data).map((key) => {
            const defectType = defectConfig.find(item => item.locator === key);
            return (
              defectType &&
              <a key={key} href="/" className={cx('item')}>
                <div className={cx('name')}>
                  <div className={cx('circle')} style={{ backgroundColor: defectType.color }} />
                  { defectType.longName }
                </div>
                <span className={cx('value')}>
                  { this.props.data[defectType.locator] }
                </span>
              </a>
            );
          })
        }
      </div>
    );
  }
}
