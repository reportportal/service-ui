import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './statusPageItem.scss';

const cx = classNames.bind(styles);

export const StatusPageItem = ({ title, children }) => (
  <div className={cx('status-page-item')}>
    <h4 className={cx('item-title')}>{title}</h4>
    {children}
  </div>
);
StatusPageItem.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
StatusPageItem.defaultProps = {
  title: '',
  children: null,
};
