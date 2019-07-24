import { Component, Fragment } from 'react';
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
    itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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
    eventInfo: {},
    tooltipEventInfo: {},
    ownLinkParams: {},
  };

  render() {
    const {
      type,
      projectDefects,
      data,
      customProps,
      itemId,
      eventInfo,
      tooltipEventInfo,
      ownLinkParams,
    } = this.props;

    const defectsList = projectDefects[type.toUpperCase()].map((item) => item.locator);

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
                defects={defectsList}
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
                defects={defectsList}
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
