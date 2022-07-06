import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import informationImg from './img/information.png';
import systemErrorImg from './img/SytemError.png';
import warningImg from './img/warning.png';
import styles from './systemMessage.scss';

const cx = classNames.bind(styles);
const MODE_INFORMATION = 'info';
const MODE_WARNING = 'warning';
const MODE_SYS_ERROR = 'error';
let img = null;
export const SystemMessage = ({ message, textSolution, children, mode }) => {
  if (mode === MODE_INFORMATION) {
    img = informationImg;
  } else if (mode === MODE_WARNING) {
    img = warningImg;
  } else {
    img = systemErrorImg;
  }

  return (
    <div className={cx('system-message-container')}>
      <img src={img} alt={message} />
      <div className={cx('text-container')}>
        <h1 className={cx(`message-header-${mode}`)}>{message}</h1>
        <h2>{children}</h2>
        <p>{textSolution}</p>
      </div>
    </div>
  );
};

SystemMessage.propTypes = {
  message: PropTypes.string,
  textSolution: PropTypes.string,
  children: PropTypes.string,
  mode: PropTypes.oneOf([MODE_INFORMATION, MODE_WARNING, MODE_SYS_ERROR]),
};

SystemMessage.defaultProps = {
  message: '',
  textSolution: '',
  children: '',
  mode: MODE_INFORMATION,
};
