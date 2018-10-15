import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  TO_INVESTIGATE,
  PRODUCT_BUG,
  AUTOMATION_BUG,
  SYSTEM_ISSUE,
} from 'common/constants/defectTypes';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import { projectConfigSelector } from 'controllers/project';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
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
});
const EVENTS_MAP = {
  [PRODUCT_BUG]: LAUNCHES_PAGE_EVENTS.CLICK_TOOLTIP_TTL_PB,
  [AUTOMATION_BUG]: LAUNCHES_PAGE_EVENTS.CLICK_TOOLTIP_TTL_AB,
  [SYSTEM_ISSUE]: LAUNCHES_PAGE_EVENTS.CLICK_TOOLTIP_TTL_SI,
};

@injectIntl
@connect((state) => ({
  projectConfig: projectConfigSelector(state),
}))
export class DefectTypeTooltip extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    projectConfig: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    itemId: PropTypes.string,
  };

  static defaultProps = {
    itemId: null,
  };

  render() {
    const { formatMessage } = this.props.intl;
    const eventInfo = EVENTS_MAP[this.props.type];
    const defectConfig =
      this.props.projectConfig.subTypes &&
      this.props.projectConfig.subTypes[this.props.type.toUpperCase()];

    return (
      <div className={cx('defect-type-tooltip')}>
        {defectConfig && (
          <Fragment>
            {this.props.type !== TO_INVESTIGATE && (
              <DefectLink
                itemId={this.props.itemId}
                defects={Object.keys(this.props.data)}
                className={cx('total-item')}
                eventInfo={eventInfo}
              >
                <div className={cx('name')}>
                  <div
                    className={cx('circle')}
                    style={{ backgroundColor: defectConfig[0].color }}
                  />
                  {formatMessage(messages[`${this.props.type}_total`])}
                </div>
                <span className={cx('value')}>{this.props.data.total}</span>
              </DefectLink>
            )}
            {Object.keys(this.props.data).map((key) => {
              const defectType = defectConfig.find((item) => item.locator === key);
              return (
                defectType && (
                  <DefectLink
                    key={key}
                    itemId={this.props.itemId}
                    defects={[key]}
                    className={cx('item')}
                  >
                    <div className={cx('name')}>
                      <div className={cx('circle')} style={{ backgroundColor: defectType.color }} />
                      {defectType.longName}
                    </div>
                    <span className={cx('value')}>{this.props.data[defectType.locator]}</span>
                  </DefectLink>
                )
              );
            })}
          </Fragment>
        )}
      </div>
    );
  }
}
