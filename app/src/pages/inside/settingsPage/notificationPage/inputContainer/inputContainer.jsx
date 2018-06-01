import PropTypes from 'prop-types';

import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { InputCheckbox } from 'components/inputs/inputCheckbox';

import classNames from 'classnames/bind';
import styles from '../lineContainer/lineContainer.scss';

const cx = classNames.bind(styles);

export const InputContainer = ({ options, checkboxText, notification }) => (
  <div className={cx('input-part')}>
    <div className={cx('input-part--left')}>
      {options ? <InputDropdown options={options} value={'ON'} /> : <InputTagsSearch />}
      {checkboxText && <InputCheckbox>{checkboxText}</InputCheckbox>}
    </div>

    <p className={cx('input-part__notification')}>{notification}</p>
  </div>
);

InputContainer.propTypes = {
  options: PropTypes.array.isRequired,
  checkboxText: PropTypes.string.isRequired,
  notification: PropTypes.string.isRequired,
};
