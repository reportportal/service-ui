import React, { Component, Fragment } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
    intl: intlShape.isRequired,
    tooltipEventInfo: PropTypes.object,
    itemId: PropTypes.number,
  };

  static defaultProps = {
    itemId: null,
    tooltipEventInfo: {},
  };

  getFilteredBodyData = (config) => {
    const { data = [] } = this.props;

    return Object.keys(data)
      .map((key) => config.find((item) => item.locator === key))
      .filter((item) => item)
      .sort((a, b) => a.id - b.id)
      .filter(({ locator }, i) => i === 0 || data[locator] > 0);
  };

  render() {
    const {
      data,
      itemId,
      tooltipEventInfo,
      type,
      projectConfig,
      intl: { formatMessage },
    } = this.props;

    const defectConfig = projectConfig.subTypes && projectConfig.subTypes[type.toUpperCase()];

    const filteredBodyData = this.getFilteredBodyData(defectConfig);

    return (
      <div className={cx('defect-type-tooltip')}>
        {defectConfig && (
          <Fragment>
            {filteredBodyData.length > 1 && (
              <DefectLink
                itemId={itemId}
                defects={Object.keys(data)}
                className={cx('total-item')}
                eventInfo={tooltipEventInfo}
              >
                <div className={cx('name')}>
                  <div
                    className={cx('circle')}
                    style={{ backgroundColor: defectConfig[0].color }}
                  />
                  {formatMessage(messages[`${type}_total`])}
                </div>
                <span className={cx('value')}>{data.total}</span>
              </DefectLink>
            )}
            {/**
             * Display defect types in a proper order,
             * the first is the system type (Product Bug, To investigate, etc.)
             * that is way they are sorted by ID
             * Don't display defect sub types with zero defect's amount,
             * except system types (i.e. with index=0)
             */
            filteredBodyData.map(({ locator, color, longName }) => (
              <DefectLink key={locator} itemId={itemId} defects={[locator]} className={cx('item')}>
                <div className={cx('name')}>
                  <div className={cx('circle')} style={{ backgroundColor: color }} />
                  {longName}
                </div>
                <span className={cx('value')}>{data[locator]}</span>
              </DefectLink>
            ))}
          </Fragment>
        )}
      </div>
    );
  }
}
