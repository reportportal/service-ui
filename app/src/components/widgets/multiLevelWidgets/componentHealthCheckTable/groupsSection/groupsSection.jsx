/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { messages } from 'components/widgets/common/messages';
import { groupItemPropTypes } from './propTypes';
import { GroupItem } from './groupItem';
import styles from './groupsSection.scss';

const cx = classNames.bind(styles);

export const GroupsSection = injectIntl(
  ({
    intl: { formatMessage },
    sectionTitle,
    itemsCount,
    groups,
    colorCalculator,
    onClickGroupItem,
    getSpecificTestListLink,
    isClickable,
  }) => (
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
              onClickGroupItem={onClickGroupItem}
              getSpecificTestListLink={getSpecificTestListLink}
              isClickable={isClickable}
            />
          </div>
        ))}
      </div>
    </div>
  ),
);
GroupsSection.propTypes = {
  getSpecificTestListLink: PropTypes.func.isRequired,
  sectionTitle: PropTypes.string,
  itemsCount: PropTypes.number,
  groups: PropTypes.arrayOf(PropTypes.shape(groupItemPropTypes)),
  colorCalculator: PropTypes.func,
  onClickGroupItem: PropTypes.func,
  isClickable: PropTypes.bool,
};
GroupsSection.defaultProps = {
  sectionTitle: '',
  itemsCount: 0,
  groups: [],
  colorCalculator: () => {},
  onClickGroupItem: () => {},
  isClickable: true,
};
