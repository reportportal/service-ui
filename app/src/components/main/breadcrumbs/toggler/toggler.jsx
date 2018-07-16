import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import SquarePlusIcon from 'common/img/square-plus-inline.svg';
import SquareMinusIcon from 'common/img/square-minus-inline.svg';

import styles from './toggler.scss';

const cx = classNames.bind(styles);

export const Toggler = ({ disabled, expanded, onToggleExpand }) => (
  <div className={cx('toggler', { disabled })} onClick={onToggleExpand}>
    {!disabled && Parser(expanded ? SquareMinusIcon : SquarePlusIcon)}
  </div>
);
Toggler.propTypes = {
  expanded: PropTypes.bool,
  onToggleExpand: PropTypes.func,
  disabled: PropTypes.bool,
};
Toggler.defaultProps = {
  expanded: false,
  onToggleExpand: () => {},
  disabled: false,
};
