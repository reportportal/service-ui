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
import { useIntl } from 'react-intl';
import { GhostButton } from 'components/buttons/ghostButton';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import CloneIcon from 'common/img/clone-inline.svg';
import DiscardIcon from 'common/img/discard-inline.svg';
import SaveIcon from 'common/img/save-inline.svg';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';
import styles from './filterControls.scss';

const cx = classNames.bind(styles);

export const FilterControls = ({
  discardDisabled,
  cloneDisabled,
  editDisabled,
  saveDisabled,
  isFilterLocked,
  onDiscard,
  onClone,
  onEdit,
  onSave,
}) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('filter-controls')}>
      <div className={cx('control-button')}>
        <GhostButton icon={DiscardIcon} disabled={discardDisabled} onClick={onDiscard}>
          {formatMessage(COMMON_LOCALE_KEYS.DISCARD)}
        </GhostButton>
      </div>
      <div className={cx('control-button')}>
        <GhostButton icon={CloneIcon} disabled={cloneDisabled} onClick={onClone}>
          {formatMessage(COMMON_LOCALE_KEYS.CLONE)}
        </GhostButton>
      </div>
      <div className={cx('control-button')}>
        <LockedDashboardTooltip locked={isFilterLocked} variant="filter">
          <GhostButton icon={PencilIcon} disabled={editDisabled} onClick={onEdit}>
            {formatMessage(COMMON_LOCALE_KEYS.EDIT)}
          </GhostButton>
        </LockedDashboardTooltip>
      </div>
      <div className={cx('control-button')}>
        <LockedDashboardTooltip locked={isFilterLocked} variant="filter">
          <GhostButton icon={SaveIcon} disabled={saveDisabled} onClick={onSave}>
            {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
          </GhostButton>
        </LockedDashboardTooltip>
      </div>
    </div>
  );
};

FilterControls.propTypes = {
  discardDisabled: PropTypes.bool,
  cloneDisabled: PropTypes.bool,
  editDisabled: PropTypes.bool,
  saveDisabled: PropTypes.bool,
  isFilterLocked: PropTypes.bool,
  onChangeSorting: PropTypes.func.isRequired,
  onDiscard: PropTypes.func.isRequired,
  onClone: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
FilterControls.defaultProps = {
  discardDisabled: false,
  isFilterLocked: false,
  cloneDisabled: false,
  editDisabled: false,
  saveDisabled: false,
};
