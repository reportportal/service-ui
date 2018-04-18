import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from '../lineContainer.scss';
import { InputContainer } from '../../inputContainer';

const cx = classNames.bind(styles);

export const InputLine = ({ isLabelRequired, label, inputData, notification }) => (
  <label className={cx('container')}>
    <span
      className={cx({
        container__label: true,
        'container__label--required': isLabelRequired,
      })}
    >
      {label}
    </span>

    <InputContainer {...inputData} notification={notification} />
  </label>
);

InputLine.propTypes = {
  isLabelRequired: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  inputData: PropTypes.object.isRequired,
  notification: PropTypes.string.isRequired,
};
