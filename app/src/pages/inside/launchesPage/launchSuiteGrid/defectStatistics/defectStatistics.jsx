import { Fragment } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { PieChart } from './pieChart';
import styles from './defectStatistics.scss';

const cx = classNames.bind(styles);

export const DefectStatistics = ({ type, data, customProps }) => (
  <div className={cx('defect-statistics')}>
    <span className={cx('title')}>
      <span className={cx('circle', { [`type-${type}`]: type })} />
      { customProps.abbreviation }
    </span>
    {
      !!data.total &&
      <Fragment>
        <div className={cx('desktop-visible')}>
          <PieChart data={data} type={type} />
        </div>
        <div className={cx('desktop-hidden')}>
          <a href="/">
            { data.total }
          </a>
        </div>
      </Fragment>
    }
  </div>
);
DefectStatistics.propTypes = {
  type: PropTypes.string,
  data: PropTypes.object.isRequired,
  customProps: PropTypes.object,
};
DefectStatistics.defaultProps = {
  type: '',
  customProps: {},
};
