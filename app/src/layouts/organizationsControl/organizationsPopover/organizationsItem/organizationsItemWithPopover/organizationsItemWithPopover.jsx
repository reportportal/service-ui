/*
 * Copyright 2024 EPAM Systems
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

import classNames from 'classnames/bind';
import { useIntl, defineMessages } from 'react-intl';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './organizationsItemWithPopover.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  noProjectAssignments: {
    id: 'NoProjectAssignments.noProjectAssignments',
    defaultMessage: 'No project assignments',
  },
});

const NoProjectAssignments = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('no-project-assignments')}>
      {formatMessage(messages.noProjectAssignments)}
    </div>
  );
};

export const OrganizationsItemWithPopover = withTooltip({
  TooltipComponent: NoProjectAssignments,
  data: {
    tooltipTriggerClass: cx('tooltip'),
    customClassName: cx('custom'),
    placement: 'left',
    dark: true,
    topOffset: -10,
    leftOffset: 170,
    width: 165,
  },
})(({ children }) => children);
