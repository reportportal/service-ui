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
import Link from 'redux-first-router-link';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { connect } from 'react-redux';
import { getLaunchFilterLinkSelector } from 'controllers/launch';
import { urlOrganizationSlugSelector } from 'controllers/pages';
import { FilterDescriptionTooltipIcon } from './filterDescriptionTooltipIcon';
import styles from './filterItem.scss';

const cx = classNames.bind(styles);

const stopPropagation = (func) => (e) => {
  e.stopPropagation();
  func(e);
};

const handleClick = (e) => {
  e.preventDefault();
};

const FilterItemBase = ({
  id,
  name,
  active,
  description,
  unsaved,
  onRemove,
  className,
  isDisabled,
  getLaunchFilterLink,
  organizationSlug,
}) => (
  <Link
    className={cx('filter-item', className, { active })}
    onClick={isDisabled && handleClick}
    to={getLaunchFilterLink(id, active, organizationSlug)}
  >
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
  </Link>
);

export const FilterItem = connect((state) => ({
  organizationSlug: urlOrganizationSlugSelector(state),
  getLaunchFilterLink: getLaunchFilterLinkSelector(state),
}))(FilterItemBase);

FilterItemBase.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  description: PropTypes.string,
  unsaved: PropTypes.bool,
  onRemove: PropTypes.func,
  getLaunchFilterLink: PropTypes.func.isRequired,
  className: PropTypes.string,
  isDisabled: PropTypes.bool,
  organizationSlug: PropTypes.string.isRequired,
};
FilterItemBase.defaultProps = {
  active: false,
  description: null,
  unsaved: false,
  onRemove: () => {},
  className: '',
  isDisabled: false,
};
