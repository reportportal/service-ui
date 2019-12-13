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
import { FormattedMessage } from 'react-intl';
import ArrowDownIcon from 'common/img/arrow-down-inline.svg';
import styles from './expandToggler.scss';

const cx = classNames.bind(styles);

export const ExpandToggler = ({ expanded, onToggleExpand }) => (
  <div className={cx('expand-toggler')} onClick={onToggleExpand}>
    {expanded ? (
      <FormattedMessage id="ExpandToggler.hideCriteria" defaultMessage="Hide Criteria" />
    ) : (
      <FormattedMessage id="ExpandToggler.showCriteria" defaultMessage="Show Criteria" />
    )}
    <div className={cx('icon', { expanded })}>{Parser(ArrowDownIcon)}</div>
  </div>
);
ExpandToggler.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
};
