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
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import {
  ORGANIZATION_EXTERNAL_TYPE,
  ORGANIZATION_INTERNAL_TYPE,
} from 'common/constants/organizationTypes';
import Parser from 'html-react-parser';
import { Tooltip } from '@reportportal/ui-kit';
import SynchedIcon from './img/synched-organization-inline.svg';
import OutdatedIcon from './img/outdated-inline.svg';
import PersonalIcon from './img/personal-organization-inline.svg';
import { messages } from '../../messages';
import styles from './iconsBlock.scss';

const cx = classNames.bind(styles);
const THREE_MONTHS_IN_MS = 1000 * 60 * 60 * 24 * 30 * 3;

export const IconsBlock = ({ lastLaunchDate, hasPermission, organizationType }) => {
  const { formatMessage } = useIntl();
  const isOutdated =
    lastLaunchDate && Date.now() - new Date(lastLaunchDate).getTime() > THREE_MONTHS_IN_MS;

  return (
    <>
      {hasPermission &&
        (organizationType === ORGANIZATION_EXTERNAL_TYPE ? (
          <Tooltip
            content={formatMessage(messages.synchedOrganization)}
            placement={'top'}
            wrapperClassName={cx('tooltip-wrapper')}
          >
            <i className={cx('icon')}>{Parser(SynchedIcon)}</i>
          </Tooltip>
        ) : (
          organizationType !== ORGANIZATION_INTERNAL_TYPE && (
            <Tooltip
              content={formatMessage(messages.personalOrganization)}
              placement={'top'}
              wrapperClassName={cx('tooltip-wrapper')}
            >
              <i className={cx('icon')}>{Parser(PersonalIcon)}</i>
            </Tooltip>
          )
        ))}
      {hasPermission && isOutdated && (
        <Tooltip
          content={formatMessage(messages.lastLaunch)}
          placement={'top'}
          wrapperClassName={cx('tooltip-wrapper')}
        >
          <i className={cx('icon')}>{Parser(OutdatedIcon)}</i>
        </Tooltip>
      )}
    </>
  );
};

IconsBlock.propTypes = {
  organizationType: PropTypes.string.isRequired,
  lastLaunchDate: PropTypes.string.isRequired,
  hasPermission: PropTypes.bool.isRequired,
};
