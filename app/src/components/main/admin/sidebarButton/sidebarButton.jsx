import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

const SidebarButton = ({ clickHandler, icon, children, btnBottom }) => {
  const btnClasses = cx({
    btn: true,
    'btn-bottom': btnBottom,
  });
  return (
    <button onClick={clickHandler} className={btnClasses} >
      <img src={icon} className={cx('icon')} alt="menu icon" />
      <span className={cx('btn-title')}>
        {children}
      </span>
    </button>
  );
};

SidebarButton.propTypes = {
  clickHandler: PropTypes.func,
  icon: PropTypes.string,
  btnBottom: PropTypes.bool,
  children: PropTypes.node,
};

SidebarButton.defaultProps = {
  clickHandler: () => {},
  icon: '',
  btnBottom: false,
  children: '',
};

export default SidebarButton;
