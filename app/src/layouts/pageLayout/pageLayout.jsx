import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './pageLayout.scss';

const cx = classNames.bind(styles);

export const PageLayout = ({ title, children }) => (
  <div className={cx('page-layout')}>
    {title && <PageTitle title={title} /> }
    <div className={cx('page-content')}>
      {children}
    </div>
  </div>
);
PageLayout.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
};
PageLayout.defaultProps = {
  title: null,
  children: null,
};

const PageTitle = ({ title }) => (
  <div className={cx('page-title')}>
    {title}
  </div>
);
PageTitle.propTypes = {
  title: PropTypes.node,
};
PageTitle.defaultProps = {
  title: null,
};
