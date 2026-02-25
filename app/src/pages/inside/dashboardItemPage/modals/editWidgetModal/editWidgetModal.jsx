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

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { destroy, getFormInitialValues, getFormValues, isDirty, isValid } from 'redux-form';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { activeProjectSelector } from 'controllers/user';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { getWidgetModeValuesString } from 'components/main/analytics/events/common/widgetPages/utils';
import { WIDGETS_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import { activeDashboardIdSelector } from 'controllers/pages';
import { useCanLockDashboard } from 'common/hooks';
import { LockedDashboardTooltip } from 'pages/inside/common/lockedDashboardTooltip';
import { LockedIcon } from 'pages/inside/common/lockedIcon';
import { EditWidgetControlsSectionForm } from './editWidgetControlsSectionForm';
import { EditWidgetInfoSection } from './editWidgetInfoSection';
import { WIDGET_WIZARD_FORM } from '../common/constants';
import {
  getCreatedWidgetLevelsCount,
  getIsExcludeSkipped,
  getModifiedFieldsLabels,
  prepareWidgetDataForSubmit,
} from '../common/utils';
import { FORM_APPEARANCE_MODE_LOCKED } from '../common/widgetControls/controls/filtersControl/common/constants';
import styles from './editWidgetModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  headerText: {
    id: 'EditWidgetModal.headerText',
    defaultMessage: 'Edit widget',
  },
  editWidgetSuccess: {
    id: 'EditWidgetModal.editWidgetSuccess',
    defaultMessage: 'Widget has been updated successfully',
  },
  lockedWidget: {
    id: 'EditWidgetModal.lockedWidget',
    defaultMessage: 'The widget is locked. Only filters can be changed.',
  },
});

const EditWidgetModalComponent = ({ data: { widget, onConfirm, eventsInfo } }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const projectId = useSelector(activeProjectSelector);
  const widgetSettings = useSelector((state) => getFormValues(WIDGET_WIZARD_FORM)(state) || {});
  const initiallyFilledWidgetSettings = useSelector(getFormInitialValues(WIDGET_WIZARD_FORM));
  const activeDashboardId = useSelector(activeDashboardIdSelector);
  const dirty = useSelector(isDirty(WIDGET_WIZARD_FORM));
  const valid = useSelector(isValid(WIDGET_WIZARD_FORM));
  const canLock = useCanLockDashboard();
  const isLocked = widget?.locked && !canLock;

  const widgetInfo = useMemo(
    () => getWidgets(formatMessage).find((item) => item.id === widget.widgetType),
    [widget.widgetType, formatMessage],
  );

  const preprocessInputData = useCallback(
    (inputData) => (widgetInfo?.convertInput ? widgetInfo.convertInput(inputData) : inputData),
    [widgetInfo],
  );

  const preprocessOutputData = useCallback(
    (outputData) => (widgetInfo?.convertOutput ? widgetInfo.convertOutput(outputData) : outputData),
    [widgetInfo],
  );

  const initialValues = useMemo(() => {
    const base = {
      ...widget,
      ...(widget.appliedFilters && {
        filters: widget.appliedFilters.map(({ id, name }) => ({ value: id.toString(), name })),
      }),
    };
    const result = { ...preprocessInputData(base) };
    delete result?.appliedFilters;
    delete result.content;
    delete result.id;
    return result;
  }, [widget, preprocessInputData]);

  const [formAppearance, setFormAppearance] = useState({
    mode: FORM_APPEARANCE_MODE_LOCKED,
    isMainControlsLocked: false,
    filter: {},
    predefinedFilter: widget.appliedFilters?.[0] || null,
  });
  const [previousFilter, setPreviousFilter] = useState(initialValues?.filters);

  useEffect(() => {
    return () => dispatch(destroy(WIDGET_WIZARD_FORM));
  }, [dispatch]);

  const onSave = useCallback(
    (closeModal) => {
      const submitData = prepareWidgetDataForSubmit(preprocessOutputData(widgetSettings));
      const { widgetType, contentParameters, filterIds } = submitData;

      const isForceUpdateNeeded =
        !isEqual(widget.contentParameters, contentParameters) ||
        !isEqual(
          widget.appliedFilters?.map((filter) => filter.id.toString()),
          filterIds,
        );

      dispatch(showScreenLockAction());
      fetch(URLS.widget(projectId, widget.id), {
        method: 'put',
        data: submitData,
      })
        .then(() => {
          trackEvent(
            WIDGETS_EVENTS.clickOnSaveWidget({
              type: widgetType,
              dashboardId: activeDashboardId,
              modifiedFields: getModifiedFieldsLabels(
                initiallyFilledWidgetSettings,
                submitData,
              ),
              isWidgetNameChanged: submitData.name !== initiallyFilledWidgetSettings?.name,
              isWidgetDescriptionChanged:
                submitData?.description !== initiallyFilledWidgetSettings?.description,
              levelsCount: getCreatedWidgetLevelsCount(widgetType, submitData),
              isExcludeSkippedTests: getIsExcludeSkipped(widgetType, submitData),
              isEditModal: true,
              isLocked: isLocked,
            }),
          );

          dispatch(hideScreenLockAction());
          closeModal();
          onConfirm(isForceUpdateNeeded);
          dispatch(
            showNotification({
              message: formatMessage(messages.editWidgetSuccess),
              type: NOTIFICATION_TYPES.SUCCESS,
            }),
          );
        })
        .catch((err) => {
          dispatch(hideScreenLockAction());
          dispatch(showNotification({ message: err.message, type: NOTIFICATION_TYPES.ERROR }));
        });

      if (widgetSettings?.contentParameters) {
        trackEvent(eventsInfo.selectCriteria(widgetSettings.contentParameters.contentFields));
      }
      const widgetMode =
        widgetSettings.contentParameters?.widgetOptions &&
        getWidgetModeValuesString(widgetSettings.contentParameters.widgetOptions);
      if (widgetMode) {
        trackEvent(eventsInfo.selectToggleButtons(widgetMode));
      }
    },
    [
      widget,
      widgetSettings,
      projectId,
      initiallyFilledWidgetSettings,
      activeDashboardId,
      onConfirm,
      formatMessage,
      trackEvent,
      eventsInfo,
      preprocessOutputData,
      dispatch,
      isLocked,
    ],
  );

  const getCloseConfirmationConfig = useCallback(() => {
    if (!dirty) {
      return null;
    }
    return {
      confirmationWarning: formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
      confirmationWarningClassName: cx('confirmation-warning-wrapper'),
    };
  }, [dirty, formatMessage]);

  const handleFormAppearanceChange = useCallback(
    (mode, filter) => {
      setFormAppearance((prev) => ({
        ...prev,
        mode,
        filter,
        isMainControlsLocked: mode !== FORM_APPEARANCE_MODE_LOCKED,
      }));
      setPreviousFilter((prev) => (!mode ? widgetSettings.filters : prev));
    },
    [widgetSettings?.filters],
  );

  const renderHeaderElements = useCallback(() => {
    if (!isLocked) return null;

    return (
      <div className={cx('locked-widget-hint')}>
        <LockedDashboardTooltip locked={widget.locked} variant="widget">
          <LockedIcon />
        </LockedDashboardTooltip>
        {formatMessage(messages.lockedWidget)}
      </div>
    );
  }, [isLocked, widget.locked, formatMessage]);

  const buttonsMessages = {
    cancel: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    submit: formatMessage(COMMON_LOCALE_KEYS.SUBMIT),
  };
  const okButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    onClick: onSave,
    disabled: formAppearance.isMainControlsLocked || !valid,
    eventInfo: eventsInfo.okBtn,
  };
  const cancelButton = {
    text: buttonsMessages.cancel,
    disabled: formAppearance.isMainControlsLocked,
    eventInfo: eventsInfo.cancelBtn,
  };

  return (
    <ModalLayout
      title={formatMessage(messages.headerText)}
      renderHeaderElements={renderHeaderElements}
      okButton={okButton}
      cancelButton={cancelButton}
      className={cx('edit-widget-modal')}
      closeConfirmation={getCloseConfirmationConfig()}
      closeIconEventInfo={eventsInfo.closeIcon}
    >
      <div className={cx('edit-widget-modal-content')}>
        <EditWidgetInfoSection
          projectId={projectId}
          widgetSettings={prepareWidgetDataForSubmit(preprocessOutputData(widgetSettings))}
          activeWidget={widgetInfo}
        />
        <EditWidgetControlsSectionForm
          initialValues={initialValues}
          previousFilter={previousFilter}
          widget={widgetInfo}
          widgetId={widget.id}
          widgetSettings={widgetSettings}
          formAppearance={formAppearance}
          handleFormAppearanceChange={handleFormAppearanceChange}
          buttonsMessages={buttonsMessages}
          eventsInfo={eventsInfo}
          isMainControlsDisabled={isLocked}
        />
      </div>
    </ModalLayout>
  );
};

EditWidgetModalComponent.propTypes = {
  data: PropTypes.shape({
    onConfirm: PropTypes.func,
    widget: PropTypes.object,
    eventsInfo: PropTypes.object,
  }),
};
EditWidgetModalComponent.defaultProps = {
  data: {
    onConfirm: () => {},
    widget: {},
    eventsInfo: {},
  },
};
export const EditWidgetModal = withModal('editWidgetModal')(EditWidgetModalComponent);
