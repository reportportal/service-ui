import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './pageLayout.scss';
import { PageBreadcrumbs } from './pageBreadcrumbs';

const cx = classNames.bind(styles);

export const PageLayout = ({ children }) => <div className={cx('page-layout')}>{children}</div>;

PageLayout.propTypes = {
  children: PropTypes.node,
};
PageLayout.defaultProps = {
  children: null,
};

export const PageHeader = ({ children, breadcrumbs }) => (
  <div className={cx('page-header')}>
    <PageBreadcrumbs data={breadcrumbs} />
    <div className={cx('children-container')}>{children}</div>
  </div>
);
PageHeader.propTypes = {
  breadcrumbs: PropTypes.array,
  children: PropTypes.node,
};
PageHeader.defaultProps = {
  breadcrumbs: [],
  children: null,
};

export const PageSection = ({ children }) => <div className={cx('page-content')}>{children}</div>;
PageSection.propTypes = {
  children: PropTypes.node,
};
PageSection.defaultProps = {
  children: null,
};
