/*
 * Copyright 2022 EPAM Systems
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
import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import BinIcon from 'common/img/newIcons/bin-inline.svg';
import PencilIcon from 'common/img/newIcons/pencil-inline.svg';
import CopyIcon from 'common/img/newIcons/copy-inline.svg';
import LocatorIcon from 'common/img/newIcons/locator-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withPopover } from 'componentLibrary/popover';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { showModalAction } from 'controllers/modal';
import { deleteDefectTypeAction, updateDefectTypeAction } from 'controllers/project';
import { PROJECT_SETTINGS_DEFECT_TYPES_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { defectTypeShape } from '../defectTypeShape';
import styles from './defectTypeRow.scss';

const cx = classNames.bind(styles);

const DefectLocatorPopoverContent = ({ locator }) => {
  const { trackEvent } = useTracking();

  return (
    <div className={cx('defect-locator-popover')}>
      Locator
      <span className={cx('locator')}>
        {locator}
        <CopyToClipboard
          text={locator}
          onCopy={() => trackEvent(PROJECT_SETTINGS_DEFECT_TYPES_EVENTS.CLICK_COPY_ID_LOCATOR_ICON)}
        >
          <i className={cx('icon', 'copy-button')} data-automation-id="defectTypeCopyLocatorIcon">
            {Parser(CopyIcon)}
          </i>
        </CopyToClipboard>
      </span>
    </div>
  );
};
DefectLocatorPopoverContent.propTypes = {
  locator: PropTypes.string.isRequired,
};

const DefectLocatorWithPopover = withPopover({
  ContentComponent: DefectLocatorPopoverContent,
  side: 'bottom',
  arrowPosition: 'right',
})(() => (
  <div className={cx('locator-wrapper')}>
    <i className={cx('icon', 'locator-icon')} data-automation-id="defectTypeLocatorIcon">
      {Parser(LocatorIcon)}
    </i>
  </div>
));
DefectLocatorWithPopover.propTypes = {
  locator: PropTypes.string.isRequired,
};

export const DefectTypeRow = ({
  data,
  data: { longName, shortName, locator, color },
  group,
  isPossibleUpdateSettings,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const deleteDefect = () => {
    dispatch(deleteDefectTypeAction(data));
  };

  const onDelete = () => {
    dispatch(
      showModalAction({
        id: 'deleteDefectModal',
        data: {
          onSave: deleteDefect,
          defectType: { name: longName },
        },
      }),
    );
  };

  const editDefect = (defectType) => {
    dispatch(updateDefectTypeAction(defectType));
  };

  const onEdit = () => {
    dispatch(
      showModalAction({
        id: 'addEditDefectTypeModal',
        data: {
          onSave: editDefect,
          defectType: { ...data },
          actionType: 'edit',
        },
      }),
    );
  };

  return (
    <div className={cx('defect-type')}>
      <div className={cx('defect-type-name-wrap')}>
        <div className={cx('color-cell')}>
          <span className={cx('color-marker')} style={{ backgroundColor: color }} />
        </div>
        <div className={cx('name-cell')}>
          <div className={cx('defect-type-name')}>{longName}</div>
        </div>
      </div>
      <div className={cx('defect-type-details-wrap')}>
        <div className={cx('abbr-cell')}>{shortName}</div>
        <div>
          <div className={cx('buttons-cell')}>
            {!group && isPossibleUpdateSettings && (
              <>
                <button
                  className={cx('icon', 'edit-button')}
                  aria-label={formatMessage(COMMON_LOCALE_KEYS.EDIT)}
                  title={formatMessage(COMMON_LOCALE_KEYS.EDIT)}
                  onClick={onEdit}
                  data-automation-id="editDefectTypeIcon"
                >
                  {Parser(PencilIcon)}
                </button>
                <button
                  className={cx('icon', 'delete-button')}
                  aria-label={formatMessage(COMMON_LOCALE_KEYS.DELETE)}
                  title={formatMessage(COMMON_LOCALE_KEYS.DELETE)}
                  onClick={onDelete}
                  data-automation-id="deleteDefectTypeIcon"
                >
                  {Parser(BinIcon)}
                </button>
              </>
            )}
          </div>
        </div>
        <DefectLocatorWithPopover locator={locator} />
      </div>
    </div>
  );
};
DefectTypeRow.propTypes = {
  data: defectTypeShape,
  parentType: defectTypeShape.isRequired,
  group: PropTypes.arrayOf(defectTypeShape),
  isPossibleUpdateSettings: PropTypes.bool.isRequired,
};
DefectTypeRow.defaultProps = {
  data: {},
  group: null,
};
