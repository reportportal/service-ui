import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { messages } from 'components/widgets/common/messages';
import { groupItemPropTypes } from './propTypes';
import { GroupItem } from './groupItem';
import styles from './groupsSection.scss';

const cx = classNames.bind(styles);

export const GroupsSection = injectIntl(
  ({ intl: { formatMessage }, sectionTitle, itemsCount, groups, colorCalculator }) => (
    <div className={cx('groups-section')}>
      <h3 className={cx('section-title')}>
        <span className={cx('caption')}>{sectionTitle}</span>
        {` (${itemsCount} ${formatMessage(messages.cases)})`}
      </h3>
      <div className={cx('section-content')}>
        {groups.map((item) => (
          <div key={item.attributeValue} className={cx('group-item-wrapper')}>
            <GroupItem
              {...item}
              color={colorCalculator(item.passingRate)}
              formatMessage={formatMessage}
            />
          </div>
        ))}
      </div>
    </div>
  ),
);
GroupsSection.propTypes = {
  sectionTitle: PropTypes.string,
  itemsCount: PropTypes.number,
  groups: PropTypes.arrayOf(PropTypes.shape(groupItemPropTypes)),
  colorCalculator: PropTypes.func,
};
GroupsSection.defaultProps = {
  sectionTitle: '',
  itemsCount: 0,
  groups: [],
  colorCalculator: () => {},
};
