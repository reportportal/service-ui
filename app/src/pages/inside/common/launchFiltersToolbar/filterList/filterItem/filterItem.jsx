import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import ShareIcon from 'common/img/share-icon-inline.svg';
import { FilterTooltipIcon } from './filterTooltipIcon';
import styles from './filterItem.scss';

const cx = classNames.bind(styles);

const stopPropagation = (func) => (e) => {
  e.stopPropagation();
  func(e);
};

export const FilterItem = ({ name, active, share, description, unsaved, onClick, onRemove }) => (
  <div className={cx('filter-item', { active })} onClick={onClick}>
    {share && <div className={cx('icon')}>{Parser(ShareIcon)}</div>}
    <span className={cx('name')}>
      {name}
      {unsaved && <span className={cx('unsaved')}>*</span>}
    </span>
    {description && (
      <div className={cx('icon')}>
        <FilterTooltipIcon tooltipContent={description} />
      </div>
    )}
    {active && (
      <div className={cx('icon')} onClick={stopPropagation(onRemove)}>
        {Parser(CrossIcon)}
      </div>
    )}
  </div>
);
FilterItem.propTypes = {
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  description: PropTypes.string,
  share: PropTypes.bool,
  unsaved: PropTypes.bool,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
};
FilterItem.defaultProps = {
  active: false,
  description: null,
  share: false,
  unsaved: false,
  onClick: () => {},
  onRemove: () => {},
};
