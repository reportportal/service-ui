/*
 * Copyright 2023 EPAM Systems
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

import React, { useEffect, useMemo } from 'react';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { addDefectTypeAction, defectTypesSelector } from 'controllers/project';
import { userRolesSelector } from 'controllers/pages';
import { canUpdateSettings } from 'common/utils/permissions';
import { DEFECT_TYPES_SEQUENCE } from 'common/constants/defectTypes';
import { Button } from '@reportportal/ui-kit';
import CreateDefectIcon from 'common/img/newIcons/create-subtype-inline.svg';
import DefectGroupIcon from 'common/img/newIcons/defect-group-inline.svg';
import { withTooltip } from 'componentLibrary/tooltip';
import { showModalAction } from 'controllers/modal';
import { SystemMessage } from 'componentLibrary/systemMessage';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PROJECT_SETTINGS_DEFECT_TYPES_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { docsReferences, createExternalLink } from 'common/utils';
import { Divider, TabDescription, MODAL_ACTION_TYPE_ADD, FormattedDescription } from '../elements';
import { MAX_DEFECT_TYPES_COUNT, WARNING_DEFECT_TYPES_COUNT } from './constants';
import { SettingsPageContent } from '../settingsPageContent';
import { DefectTypeRow } from './defectTypeRow';
import { messages } from './defectTypesMessages';
import styles from './defectTypes.scss';

const cx = classNames.bind(styles);

function CreateDefectTooltip({ formatMessage }) {
  return <span className={cx('create-tooltip')}>{formatMessage(messages.createDefectIcon)}</span>;
}
CreateDefectTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

const CreateDefect = withTooltip({
  ContentComponent: CreateDefectTooltip,
  side: 'bottom',
  dynamicWidth: true,
})(({ onClick, disabled }) => (
  <i
    className={cx('group-create', { disabled })}
    onClick={onClick}
    onKeyDown={onClick}
    data-automation-id="createDefectTypeIcon"
  >
    {Parser(CreateDefectIcon)}
  </i>
));
CreateDefect.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export function DefectTypes({ setHeaderTitleNode }) {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const defectTypes = useSelector(defectTypesSelector);
  const userRoles = useSelector(userRolesSelector);

  const addDefect = (data) => {
    dispatch(addDefectTypeAction({ ...data }));
  };
  const onAdd = (defectGroup, event) => {
    event();
    dispatch(
      showModalAction({
        id: 'addEditDefectTypeModal',
        data: {
          onSave: addDefect,
          actionType: MODAL_ACTION_TYPE_ADD,
          defectType: { color: defectGroup.color, typeRef: defectGroup.typeRef },
          defectTypes,
        },
      }),
    );
  };

  const defectTypesLength = useMemo(
    () => DEFECT_TYPES_SEQUENCE.reduce((acc, groupName) => defectTypes[groupName].length + acc, 0),
    [defectTypes],
  );
  const isEditable = canUpdateSettings(userRoles);
  const canAddNewDefectType = defectTypesLength < MAX_DEFECT_TYPES_COUNT;
  const isInformationMessage =
    defectTypesLength >= WARNING_DEFECT_TYPES_COUNT && canAddNewDefectType;

  const getSystemMessagesProps = !canAddNewDefectType
    ? {
        mode: 'warning',
        header: formatMessage(COMMON_LOCALE_KEYS.warning),
        caption: formatMessage(messages.warningSubMessage, { maxLength: MAX_DEFECT_TYPES_COUNT }),
      }
    : {
        mode: 'info',
        header: formatMessage(messages.informationTitle),
        caption: formatMessage(messages.informationSubMessage, {
          currentLength: defectTypesLength,
          maxLength: MAX_DEFECT_TYPES_COUNT,
        }),
      };

  useEffect(() => {
    setHeaderTitleNode(
      <>
        {isEditable && (
          <span className={cx('button')}>
            <Button
              disabled={!isEditable || !canAddNewDefectType}
              onClick={() =>
                onAdd(defectTypes[DEFECT_TYPES_SEQUENCE[0]][0], () =>
                  trackEvent(PROJECT_SETTINGS_DEFECT_TYPES_EVENTS.CLICK_CREATE_BUTTON),
                )
              }
              data-automation-id="createDefectTypeButton"
            >
              {formatMessage(messages.createDefectHeader)}
            </Button>
          </span>
        )}
      </>,
    );

    return () => setHeaderTitleNode(null);
  }, [defectTypes, canAddNewDefectType, isEditable]);

  return (
    <SettingsPageContent>
      <TabDescription>
        <FormattedDescription
          content={formatMessage(messages.description, {
            a: (data) => createExternalLink(data, docsReferences.workWithReports),
          })}
          event={PROJECT_SETTINGS_DEFECT_TYPES_EVENTS.CLICK_DOCUMENTATION_LINK}
        />
      </TabDescription>
      <Divider />
      {(isInformationMessage || !canAddNewDefectType) && (
        <div className={cx('system-message')}>
          <SystemMessage {...getSystemMessagesProps}>
            <span className={cx('system-message-description')}>
              {formatMessage(
                !canAddNewDefectType ? messages.warningMessage : messages.informationMessage,
                {
                  length: MAX_DEFECT_TYPES_COUNT - defectTypesLength,
                  slot:
                    MAX_DEFECT_TYPES_COUNT - defectTypesLength === 1
                      ? formatMessage(messages.informationMessageSingle)
                      : formatMessage(messages.informationMessageMultiply),
                },
              )}
            </span>
          </SystemMessage>
        </div>
      )}
      <div className={cx('defect-types-list')} data-automation-id="defectTypeGroupsList">
        {DEFECT_TYPES_SEQUENCE.map((groupName) => {
          return (
            <div key={groupName} className={cx('defect-type-group')}>
              <div className={cx('group-info')}>
                <div className={cx('group-type')}>
                  <i
                    className={cx('group-diagram', {
                      [`type-${groupName.toLowerCase()}`]: groupName,
                    })}
                  >
                    {Parser(DefectGroupIcon)}
                  </i>
                  <div className={cx('group-name')}>
                    {formatMessage(messages[groupName.toLowerCase()])}
                  </div>
                </div>
                {isEditable && (
                  <CreateDefect
                    formatMessage={formatMessage}
                    onClick={() =>
                      canAddNewDefectType &&
                      onAdd(defectTypes[groupName][0], () =>
                        trackEvent(PROJECT_SETTINGS_DEFECT_TYPES_EVENTS.CLICK_CREATE_ICON),
                      )
                    }
                    disabled={!canAddNewDefectType}
                  />
                )}
              </div>
              <div className={cx('group-field-list')}>
                <span>{formatMessage(messages.defectNameCol)}</span>
                <span>{formatMessage(messages.abbreviationCol)}</span>
              </div>
              <Divider />
              <div className={cx('group-content')} data-automation-id="defectTypesList">
                {defectTypes[groupName].map((defectType, i) => (
                  <div key={defectType.id} data-automation-id="listItem">
                    <DefectTypeRow
                      data={defectType}
                      parentType={defectTypes[groupName][0]}
                      group={i === 0 ? defectTypes[groupName] : null}
                      isPossibleUpdateSettings={isEditable}
                    />
                    <Divider />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SettingsPageContent>
  );
}
DefectTypes.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
};
