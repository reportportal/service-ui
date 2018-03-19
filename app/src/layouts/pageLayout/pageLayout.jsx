import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './pageLayout.scss';

const cx = classNames.bind(styles);

export const PageLayout = ({ title, children, fullMobileLayout }) => (
  <div className={cx({ 'page-layout': true, 'full-mobile-layout': fullMobileLayout })}>
    {title ? <PageTitle title={title} fullMobileLayout /> : null}
    <div className={cx('page-content')}>
      {children}
    </div>
  </div>
);
PageLayout.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  fullMobileLayout: PropTypes.bool,
};
PageLayout.defaultProps = {
  title: null,
  children: null,
  fullMobileLayout: false,
};

const PageTitle = ({ title, fullMobileLayout }) => (
  <div className={cx({ 'page-title': true, 'mobile-hide': fullMobileLayout })}>
    {title}
  </div>
);
PageTitle.propTypes = {
  title: PropTypes.node,
  fullMobileLayout: PropTypes.bool,
};
PageTitle.defaultProps = {
  title: null,
  fullMobileLayout: false,
};
