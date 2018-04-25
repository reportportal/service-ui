import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import SquarePlusIcon from 'common/img/square-plus-inline.svg';
import SquareMinusIcon from 'common/img/square-minus-inline.svg';

import styles from './toggler.scss';

const cx = classNames.bind(styles);

export const Toggler = ({ expanded, onToggleExpand }) => (
  <div className={cx('toggler')} onClick={onToggleExpand}>
    {Parser(expanded ? SquareMinusIcon : SquarePlusIcon)}
  </div>
);
Toggler.propTypes = {
  expanded: PropTypes.bool,
  onToggleExpand: PropTypes.func,
};
Toggler.defaultProps = {
  expanded: false,
  onToggleExpand: () => {},
};
