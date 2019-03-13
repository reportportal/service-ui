import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './integrationBreadcrumb.scss';

const cx = classNames.bind(styles);

export const IntegrationBreadcrumb = ({ descriptor: { title }, active, onClick }) => (
  <div className={cx('integration-breadcrumb', { active })} onClick={active ? onClick : null}>
    {title}
  </div>
);
IntegrationBreadcrumb.propTypes = {
  descriptor: PropTypes.object.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
IntegrationBreadcrumb.defaultProps = {
  active: false,
  onClick: () => {},
};
