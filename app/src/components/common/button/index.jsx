import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './button.scss';

const cx = classNames.bind(styles);

function inputWithIcon(props) {
  const itemClasses = cx({
    button: true,
    blue: (props.color === 'blue'),
  });
  return (
    <button {...props} className={itemClasses}>
      {props.children}
    </button>
  );
}

inputWithIcon.propTypes = {
  color: PropTypes.string,
  children: PropTypes.node,
};

inputWithIcon.defaultProps = {
  color: 'gray',
  children: {},
};

export default inputWithIcon;
