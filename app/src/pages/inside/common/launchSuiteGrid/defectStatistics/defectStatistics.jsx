import { Fragment } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { DefectLink } from 'pages/inside/common/defectLink';
import { DonutChart } from './donutChart';
import styles from './defectStatistics.scss';

const cx = classNames.bind(styles);

export const DefectStatistics = ({ type, data, customProps, itemId, eventInfo }) => (
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
            viewBox={64}
            strokeWidth={13}
            eventInfo={eventInfo}
          />
        </div>
        <div className={cx('desktop-hidden')}>
          <DefectLink itemId={itemId} defects={Object.keys(data)} eventInfo={eventInfo}>
            {data.total}
          </DefectLink>
        </div>
      </Fragment>
    )}
  </div>
);
DefectStatistics.propTypes = {
  type: PropTypes.string,
  data: PropTypes.object,
  customProps: PropTypes.object,
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  eventInfo: PropTypes.object,
};
DefectStatistics.defaultProps = {
  type: '',
  customProps: {},
  data: {},
  eventInfo: {},
};
