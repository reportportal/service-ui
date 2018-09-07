import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { NavLink } from 'redux-first-router-link';
import styles from './pageBreadcrumbs.scss';

const cx = classNames.bind(styles);
export const PageBreadcrumbs = ({ data }) => (
  <ul className={cx('page-breadcrumbs')}>
    {data.map(({ title, link }, i) => (
      <li key={title} className={cx('page-breadcrumbs-item')}>
        {i === data.length - 1 ? (
          <span>{title}</span>
        ) : (
          <NavLink to={link} className={cx('page-breadcrumbs-link')}>
            {title}
          </NavLink>
        )}
      </li>
    ))}
  </ul>
);
PageBreadcrumbs.propTypes = {
  data: PropTypes.array,
};
PageBreadcrumbs.defaultProps = {
  data: [],
};
