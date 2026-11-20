/*
 * Copyright 2026 EPAM Systems
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

import { forwardRef, HTMLAttributes, useCallback, useImperativeHandle, useMemo } from 'react';
import { useTracking } from 'react-tracking';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'fast-deep-equal';
import { getFormInitialValues, submit } from 'redux-form';
import { Scrollbars } from 'rc-scrollbars';
import { createClassnames, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { activeDashboardIdSelector } from 'controllers/pages';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { WIDGETS_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import { WidgetInfoBlock } from '../../common/widgetInfoBlock';
import { WIDGET_WIZARD_FORM } from '../../common/constants';
import {
  getCreatedWidgetLevelsCount,
  getIsExcludeSkipped,
  getModifiedFieldsLabels,
  prepareWidgetDataForSubmit,
} from '../../common/utils';
import { ContentParameters, DisabledButtons, Filter, Widget } from '../../widgetWizardModal/types';
import { EditWidgetControlsForm } from './editWidgetControlsForm';
import styles from './editWidgetContent.scss';

const cx = createClassnames(styles);

const SCROLLBAR_TRACK_Z_INDEX = 'auto';

const messages = defineMessages({
  editWidgetSuccess: {
    id: 'EditWidgetModal.editWidgetSuccess',
    defaultMessage: 'Widget has been updated successfully',
  },
});

const renderScrollTrack = ({ style, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} style={{ ...style, zIndex: SCROLLBAR_TRACK_Z_INDEX }} />
);

export interface EditableWidget {
  id: number;
  widgetType: string;
  name?: string;
  description?: string;
  appliedFilters?: Filter[];
  contentParameters?: ContentParameters;
  content?: unknown;
  [key: string]: unknown;
}

interface FormValues {
  widgetType?: string;
  name?: string;
  description?: string;
  contentParameters?: ContentParameters;
  filterIds?: string[];
  filters?: { value?: string; name?: string }[];
  [key: string]: unknown;
}

interface WidgetDefinition extends Widget {
  convertInput?: (data: Record<string, unknown>) => Record<string, unknown>;
}

interface EditWidgetContentProps {
  sourceWidget: EditableWidget;
  formValues?: FormValues;
  closeModal: () => void;
  onConfirm: (isForceUpdateNeeded: boolean) => void;
  onButtonsDisabledChange: (disabled: DisabledButtons) => void;
}

export interface EditWidgetContentHandle {
  submit: () => void;
}

export const EditWidgetContent = forwardRef<EditWidgetContentHandle, EditWidgetContentProps>(
  ({ sourceWidget, formValues = {}, closeModal, onConfirm, onButtonsDisabledChange }, ref) => {
    const { formatMessage } = useIntl();
    const dispatch = useDispatch();
    const { trackEvent } = useTracking();
    const projectKey = useSelector(projectKeySelector);
    const activeDashboardId = useSelector(activeDashboardIdSelector);
    const initialFormValues = useSelector(getFormInitialValues(WIDGET_WIZARD_FORM)) as FormValues;

    const widgets = useMemo(() => getWidgets(formatMessage), [formatMessage]) as WidgetDefinition[];
    const widgetInfo = widgets.find((item) => item.id === sourceWidget.widgetType);

    const preprocessInputData = useCallback(
      (inputData: Record<string, unknown>) =>
        widgetInfo?.convertInput ? widgetInfo.convertInput(inputData) : inputData,
      [widgetInfo],
    );

    const preprocessOutputData = useCallback(
      (outputData: Record<string, unknown>) =>
        widgetInfo?.convertOutput ? widgetInfo.convertOutput(outputData) : outputData,
      [widgetInfo],
    );

    const initialValues = useMemo(() => {
      const base = {
        ...sourceWidget,
        ...(sourceWidget.appliedFilters && {
          filters: sourceWidget.appliedFilters.map((filter) => ({
            ...filter,
            value: filter.id,
          })),
        }),
      };
      const result = { ...preprocessInputData(base) };
      delete result.appliedFilters;
      delete result.content;
      delete result.id;
      return result;
    }, [sourceWidget, preprocessInputData]);

    const widgetSettings = prepareWidgetDataForSubmit(
      preprocessOutputData(formValues),
    ) as FormValues;

    const onSave = (formData: Record<string, unknown>) => {
      const submitData = prepareWidgetDataForSubmit(preprocessOutputData(formData)) as FormValues;
      const { widgetType, contentParameters, filterIds } = submitData;
      const isForceUpdateNeeded =
        !isEqual(sourceWidget.contentParameters, contentParameters) ||
        !isEqual(
          sourceWidget.appliedFilters?.map((filter) => filter.id),
          filterIds,
        );

      dispatch(showScreenLockAction());
      fetch(URLS.widget(projectKey, String(sourceWidget.id)) as string, {
        method: 'put',
        data: submitData,
      })
        .then(() => {
          trackEvent(
            WIDGETS_EVENTS.clickOnSaveWidget({
              type: widgetType,
              dashboardId: activeDashboardId,
              modifiedFields: getModifiedFieldsLabels(initialFormValues, submitData),
              isWidgetNameChanged: submitData.name !== initialFormValues?.name,
              isWidgetDescriptionChanged: submitData.description !== initialFormValues?.description,
              levelsCount: getCreatedWidgetLevelsCount(widgetType, submitData),
              isExcludeSkippedTests: getIsExcludeSkipped(widgetType, submitData),
              isEditModal: true,
              initialSeparateInterrupted:
                initialFormValues?.contentParameters?.widgetOptions?.separateInterrupted,
              finalSeparateInterrupted:
                submitData.contentParameters?.widgetOptions?.separateInterrupted,
            }),
          );
          dispatch(hideScreenLockAction());
          closeModal();
          onConfirm(isForceUpdateNeeded);
          dispatch(showSuccessNotification({ message: formatMessage(messages.editWidgetSuccess) }));
        })
        .catch((err: Error) => {
          dispatch(hideScreenLockAction());
          dispatch(showErrorNotification({ message: err.message }));
        });
    };

    useImperativeHandle(ref, () => ({
      submit: () => dispatch(submit(WIDGET_WIZARD_FORM)),
    }));

    return (
      <div className={cx('content')}>
        <div className={cx('info')}>
          <Scrollbars hideTracksWhenNotNeeded>
            <div className={cx('info-content')}>
              <WidgetInfoBlock
                projectKey={projectKey}
                widgetSettings={widgetSettings}
                activeWidget={widgetInfo}
              />
            </div>
          </Scrollbars>
        </div>
        <div className={cx('controls')}>
          <Scrollbars
            hideTracksWhenNotNeeded
            renderTrackHorizontal={renderScrollTrack}
            renderTrackVertical={renderScrollTrack}
          >
            <div className={cx('controls-wrapper')}>
              {widgetInfo && (
                <EditWidgetControlsForm
                  initialValues={initialValues}
                  widget={widgetInfo}
                  widgetId={sourceWidget.id}
                  onSubmit={onSave}
                  onDisableButtons={onButtonsDisabledChange}
                />
              )}
            </div>
          </Scrollbars>
        </div>
      </div>
    );
  },
);
