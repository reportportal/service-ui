import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './btsAuthFieldsInfo.scss';

const cx = classNames.bind(styles);

export const BtsAuthFieldsInfo = ({ fieldsConfig = [] }) => (
  <div className={cx('bts-auth-fields-info')}>
    {fieldsConfig.map((item) => (
      <div key={item.value} className={cx('field-item')}>
        <span className={cx('field-item-title')}>{item.message}</span>
        <span className={cx('field-item-value')}>{item.value}</span>
      </div>
    ))}
  </div>
);

BtsAuthFieldsInfo.propTypes = {
  fieldsConfig: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      message: PropTypes.string,
    }),
  ).isRequired,
};
