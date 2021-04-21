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
import { Issue } from './issue';
import styles from './issueList.scss';

const cx = classNames.bind(styles);

export const IssueList = ({ issues, onRemove, className, readOnly }) =>
  issues.map((issue) => (
    <div className={cx('issue-list-item')} key={`${issue.btsProject}_${issue.ticketId}`}>
      <Issue {...issue} showTooltip onRemove={onRemove} className={className} readOnly={readOnly} />
    </div>
  ));

IssueList.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      ticketId: PropTypes.string,
      url: PropTypes.string,
      btsProject: PropTypes.string,
      btsUrl: PropTypes.string,
    }),
  ),
  onRemove: PropTypes.func,
  className: PropTypes.string,
  readOnly: PropTypes.bool,
};
IssueList.defaultProps = {
  issues: [],
  onRemove: () => {},
  className: '',
  readOnly: false,
};
