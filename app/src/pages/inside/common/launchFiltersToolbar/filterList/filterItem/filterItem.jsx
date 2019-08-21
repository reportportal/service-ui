import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { connect } from 'react-redux';
import { userIdSelector } from 'controllers/user';
import { defineMessages, intlShape } from 'react-intl';
import { FilterDescriptionTooltipIcon } from './filterDescriptionTooltipIcon';
import { FilterSharedTooltipIcon } from './filterSharedToolTipIcon';
import { FilterSharedByMeToolTipIcon } from './filterSharedByMeToolTipIcon';
import styles from './filterItem.scss';

const cx = classNames.bind(styles);

const stopPropagation = (func) => (e) => {
  e.stopPropagation();
  func(e);
};

const localMessages = defineMessages({
  filterSharedBy: {
    id: 'filterItem.sharedBy',
    defaultMessage: 'Filter is shared by {owner}',
  },
  filterIsShared: {
    id: 'filterItem.isShared',
    defaultMessage: 'Filter is shared.',
  },
});

const FilterItemBase = ({
  name,
  active,
  share,
  description,
  unsaved,
  onClick,
  onRemove,
  owner,
  userId,
  intl,
  className,
}) => (
  <div className={cx('filter-item', className, { active })} onClick={onClick}>
    {share &&
      (userId === owner || owner === undefined) && (
        <div className={cx('icon-holder')}>
          <FilterSharedByMeToolTipIcon
            tooltipContent={intl.formatMessage(localMessages.filterIsShared)}
          />
        </div>
      )}
    {share &&
      owner !== undefined &&
      userId !== owner && (
        <div className={cx('icon-holder')}>
          <FilterSharedTooltipIcon
            tooltipContent={intl.formatMessage(localMessages.filterSharedBy, { owner })}
          />
        </div>
      )}

    <span className={cx('name')}>
      {name}
      {unsaved && <span className={cx('unsaved')}>*</span>}
    </span>
    {description && (
      <div className={cx('icon')}>
        <FilterDescriptionTooltipIcon tooltipContent={description} />
      </div>
    )}
    {active && (
      <div className={cx('icon')} onClick={stopPropagation(onRemove)}>
        {Parser(CrossIcon)}
      </div>
    )}
  </div>
);

export const FilterItem = connect((state) => ({ userId: userIdSelector(state) }))(FilterItemBase);

FilterItemBase.propTypes = {
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  description: PropTypes.string,
  share: PropTypes.bool,
  unsaved: PropTypes.bool,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  owner: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  className: PropTypes.string,
};
FilterItemBase.defaultProps = {
  active: false,
  description: null,
  share: false,
  unsaved: false,
  onClick: () => {},
  onRemove: () => {},
  className: '',
};
