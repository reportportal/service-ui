import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { columnPropTypes } from 'components/main/grid/propTypes';
import { ALIGN_LEFT } from 'components/main/grid';
import ArrowIcon from './img/arrow-down-inline.svg';
import styles from './headerCell.scss';

const cx = classNames.bind(styles);

export const HeaderCell = ({
  title,
  align,
  sortable,
  name,
  sortingActive,
  sortingDirection,
  onChangeSorting,
}) => {
  const computedClassName = {
    [`align-${align}`]: align,
    [`sorting-${sortingDirection}`]: sortingDirection,
    sortable,
    'sorting-active': sortingActive,
  };
  return (
    <div
      className={cx('header-cell', computedClassName)}
      onClick={() => onChangeSorting(name)}
    >
      <span className={cx('title-full')}>{title.full}</span>
      <span className={cx('title-short')}>{title.short || title.full}</span>
      <div className={cx('arrow')}>{Parser(ArrowIcon)}</div>
    </div>
  );
};
HeaderCell.propTypes = {
  ...columnPropTypes,
  sortingDirection: PropTypes.string,
  sortingActive: PropTypes.bool,
  onChangeSorting: PropTypes.func,
};
HeaderCell.defaultProps = {
  title: {
    full: '',
  },
  align: ALIGN_LEFT,
  sortable: false,
  name: '',
  sortingDirection: 'desc',
  sortingActive: false,
  onChangeSorting: () => {
  },
};
