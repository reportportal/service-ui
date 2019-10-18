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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils/timeDateUtils';
import { TooltipContent } from 'components/widgets/common/tooltip';
import { getItemName } from 'components/widgets/common/utils';
import styles from './issueTypeStatTooltip.scss';

const cx = classNames.bind(styles);

export const IssueTypeStatTooltip = ({
  itemName,
  itemsCount,
  startTime,
  color,
  issueStatNameProps,
  itemCases,
  wrapperClassName,
}) => {
  const issueStatName = issueStatNameProps.defectTypes
    ? getItemName(issueStatNameProps)
    : issueStatNameProps.itemName;

  return (
    <TooltipContent itemName={itemName} wrapperClassName={wrapperClassName}>
      {startTime && <div className={cx('start-time')}>{dateFormat(startTime)}</div>}
      {itemsCount && <div className={cx('items-count')}>{itemsCount}</div>}
      <div>
        <span className={cx('color-mark')} style={{ backgroundColor: color }} />
        {issueStatName}
        {itemCases && <span className={cx('item-cases')}>{`: ${itemCases}`}</span>}
      </div>
    </TooltipContent>
  );
};
IssueTypeStatTooltip.propTypes = {
  color: PropTypes.string.isRequired,
  itemName: PropTypes.string,
  itemsCount: PropTypes.string,
  startTime: PropTypes.number,
  itemCases: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  issueStatNameProps: PropTypes.shape({
    itemName: PropTypes.string,
    defectTypes: PropTypes.object,
  }),
  wrapperClassName: PropTypes.string,
};
IssueTypeStatTooltip.defaultProps = {
  itemName: '',
  itemsCount: '',
  startTime: null,
  itemCases: '',
  issueStatNameProps: {
    itemName: '',
    defectTypes: null,
  },
  wrapperClassName: '',
};
