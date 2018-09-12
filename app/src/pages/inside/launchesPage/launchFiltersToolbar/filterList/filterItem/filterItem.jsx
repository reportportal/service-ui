import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import TooltipIcon from 'common/img/tooltip-icon-inline.svg';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import ShareIcon from 'common/img/share-icon-inline.svg';
import styles from './filterItem.scss';

const cx = classNames.bind(styles);

const stopPropagation = (func) => (e) => {
  e.stopPropagation();
  func(e);
};

export const FilterItem = ({ name, active, shared, description, onClick, onRemove }) => (
  <div className={cx('filter-item', { active })} onClick={onClick}>
    {shared && <div className={cx('icon')}>{Parser(ShareIcon)}</div>}
    <span className={cx('name')}>{name}</span>
    {description && <div className={cx('icon')}>{Parser(TooltipIcon)}</div>}
    <div className={cx('icon')} onClick={stopPropagation(onRemove)}>
      {Parser(CrossIcon)}
    </div>
  </div>
);
FilterItem.propTypes = {
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  description: PropTypes.string,
  shared: PropTypes.bool,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
};
FilterItem.defaultProps = {
  active: false,
  description: null,
  shared: false,
  onClick: () => {},
  onRemove: () => {},
};
