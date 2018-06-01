import PropTypes from 'prop-types';

import { GhostButton } from 'components/buttons/ghostButton/ghostButton';
import { BigButton } from 'components/buttons/bigButton';

import classNames from 'classnames/bind';

import styles from '../lineContainer.scss';

const cx = classNames.bind(styles);

export const ButtonLine = ({ label, isSubmitButton }) => (
  <div className={cx('container')}>
    <span className={cx('container__label')} />
    <div className={cx('input-part')}>
      <div
        className={cx({
          'input-part--left': true,
          'input-part--rigth-aligment': isSubmitButton,
        })}
      >
        {isSubmitButton ? <BigButton>{label}</BigButton> : <GhostButton>{label}</GhostButton>}
      </div>
    </div>
  </div>
);

ButtonLine.propTypes = {
  label: PropTypes.string.isRequired,
  isSubmitButton: PropTypes.bool.isRequired,
};
