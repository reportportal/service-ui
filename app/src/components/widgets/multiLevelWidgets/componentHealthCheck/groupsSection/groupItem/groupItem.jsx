import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { messages } from 'components/widgets/common/messages';
import AnotherPageIcon from 'common/img/go-to-another-page-inline.svg';
import { groupItemPropTypes } from '../propTypes';
import styles from './groupItem.scss';

const cx = classNames.bind(styles);

export const GroupItem = ({
  formatMessage,
  attributeValue,
  passingRate,
  total,
  color,
  onClickGroupItem,
  onClickGroupIcon,
  isClickable,
}) => (
  <div
    className={cx('group-item', { 'group-item-clickable': isClickable })}
    style={{ borderTopColor: color }}
    onClick={isClickable ? () => onClickGroupItem(attributeValue, passingRate, color) : undefined}
  >
    <h4 className={cx('item-title')}>{attributeValue}</h4>
    <div className={cx('stat-wrapper')}>
      <div className={cx('stat-item')}>
        <span className={cx('stat-item-header')}>{formatMessage(messages.passingRate)}</span>
        <span className={cx('stat-item-value')}>{`${passingRate} %`}</span>
      </div>
      <div className={cx('stat-item')}>
        <span className={cx('stat-item-header')}>{formatMessage(messages.testCasesCaption)}</span>
        <span className={cx('stat-item-value')}>{total}</span>
      </div>
    </div>
    <div className={cx('icon')} onClick={() => onClickGroupIcon(attributeValue)}>
      {Parser(AnotherPageIcon)}
    </div>
  </div>
);
GroupItem.propTypes = {
  ...groupItemPropTypes,
  color: PropTypes.string,
  formatMessage: PropTypes.func,
};
GroupItem.defaultProps = {
  attributeValue: '',
  passingRate: 0,
  total: 0,
  color: '',
  formatMessage: () => {},
};
