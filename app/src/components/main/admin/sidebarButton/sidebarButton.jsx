import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

export const SidebarButton = ({ clickHandler, icon, children, btnBottom }) => {
  const btnClasses = cx({
    btn: true,
    'btn-bottom': btnBottom,
  });
  let img;
  if (icon) {
    img = <img src={icon} className={cx('icon')} alt="menu icon" />;
  }
  return (
    <button onClick={clickHandler} className={btnClasses} >
      {img}
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

