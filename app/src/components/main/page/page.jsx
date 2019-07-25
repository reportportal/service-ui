import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './page.scss';

const cx = classNames.bind(styles);

export const Page = ({ title, children }) => (
  <div className={cx('page')}>
    {title ? <PageTitle title={title} /> : null}
    {children}
  </div>
);
Page.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
};
Page.defaultProps = {
  title: null,
  children: null,
};

const PageTitle = ({ title }) => <div className={cx('page-title')}>{title}</div>;
PageTitle.propTypes = {
  title: PropTypes.node,
};
PageTitle.defaultProps = {
  title: null,
};
