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
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { connect } from 'react-redux';
import { userIdSelector } from 'controllers/user';
import { SharedFilterIcon } from 'pages/inside/common/sharedFilterIcon';
import { FilterDescriptionTooltipIcon } from './filterDescriptionTooltipIcon';
import styles from './filterItem.scss';

const cx = classNames.bind(styles);

const stopPropagation = (func) => (e) => {
  e.stopPropagation();
  func(e);
};

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
  className,
}) => (
  <div className={cx('filter-item', className, { active })} onClick={onClick}>
    {share && (
      <div className={cx('icon-holder')}>
        <SharedFilterIcon share={share} currentUser={userId} owner={owner} />
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
