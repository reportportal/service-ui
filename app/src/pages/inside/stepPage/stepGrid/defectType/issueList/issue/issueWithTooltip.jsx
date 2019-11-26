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
import { withTooltip } from 'components/main/tooltips/tooltip';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { IssueInfoTooltip } from './issueInfoTooltip';
import styles from './issueWithTooltip.scss';

const cx = classNames.bind(styles);

export const IssueWithTooltip = withTooltip({
  TooltipComponent: IssueInfoTooltip,
})(({ ticketId, url, onRemove }) => (
  <a href={url} className={cx('issue')}>
    <div className={cx('title')}>{ticketId}</div>
    <div
      className={cx('cross')}
      onClick={(event) => {
        event.preventDefault();
        onRemove(ticketId);
      }}
    >
      {Parser(CrossIcon)}
    </div>
  </a>
));
IssueWithTooltip.propTypes = {
  ticketId: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  btsProject: PropTypes.string.isRequired,
  btsUrl: PropTypes.string.isRequired,
  onRemove: PropTypes.func,
};
IssueWithTooltip.defaultProps = {
  onRemove: () => {},
};
