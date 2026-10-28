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

import { forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { getFormInitialValues, submit } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showDefaultErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { fetchDashboardsAction } from 'controllers/dashboard';
import { analyticsEnabledSelector, baseEventParametersSelector } from 'controllers/appInfo';
import { getWidgets } from 'pages/inside/dashboardItemPage/modals/common/widgets';
import { provideEcGA } from 'components/main/analytics';
import { activeDashboardIdSelector, pageSelector } from 'controllers/pages';
import {
  getWidgetModeValuesString,
  getEcWidget,
} from 'components/main/analytics/events/common/widgetPages/utils';
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/messages';
import { WIDGETS_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import { WIDGET_WIZARD_FORM } from '../../common/constants';
import {
  getCreatedWidgetLevelsCount,
  getModifiedFieldsLabels,
  prepareWidgetDataForSubmit,
  getDefaultWidgetConfig,
  getIsExcludeSkipped,
} from '../../common/utils';
import { WizardInfoSection } from './wizardInfoSection';
import { WizardControlsSection } from './wizardControlsSection';
import { DisabledButtons, Widget } from '../types';
import styles from './widgetWizardContent.scss';

const cx = classNames.bind(styles);

interface ContentParameters {
  contentFields?: unknown;
  widgetOptions?: Record<string, unknown>;
}

interface FormValues {
  widgetType?: string;
  contentParameters?: ContentParameters;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

interface EventsInfo {
  nextStep?: unknown;
  prevStep?: unknown;
  selectCriteria?: (fields: unknown) => unknown;
  selectToggleButtons?: (mode: string) => unknown;
  [key: string]: unknown;
}

interface WidgetWizardContentProps {
  formValues?: FormValues;
  closeModal: () => void;
  onConfirm?: (newWidget: unknown, closeModal: () => void, selectedDashboard: unknown) => void | Promise<void>;
  eventsInfo?: EventsInfo;
  step: number;
  onStepChange: (step: number) => void;
  onButtonsDisabledChange: (disabled: DisabledButtons) => void;
}

export interface WidgetWizardContentHandle {
  onClickNextStep: () => void;
  onClickPrevStep: () => void;
  submitWidgetWizardForm: () => void;
}

const getWidgetTypeName = (widgetType?: string): string | undefined =>
  (widgetTypesMessages as Record<string, { defaultMessage?: string } | undefined>)[widgetType ?? '']
    ?.defaultMessage;


export const WidgetWizardContent = forwardRef<WidgetWizardContentHandle, WidgetWizardContentProps>(
({
  formValues = { widgetType: '' },
  closeModal,
  onConfirm = () => {},
  eventsInfo = {},
  step,
  onStepChange,
  onButtonsDisabledChange,
}, ref) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const projectKey = useSelector(projectKeySelector);
  const activeDashboardId = useSelector(activeDashboardIdSelector);
  const currentPage = useSelector(pageSelector);
  const isAnalyticsEnabled = useSelector(analyticsEnabledSelector);
  const baseEventParameters = useSelector(baseEventParametersSelector);
  const initialFormValues = useSelector(getFormInitialValues(WIDGET_WIZARD_FORM)) as FormValues;

  const widgets = useMemo(() => getWidgets(formatMessage), [formatMessage]) as Widget[];

  useEffect(() => {
    if (!activeDashboardId) {
      dispatch(fetchDashboardsAction());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitWidgetWizardForm = () => dispatch(submit(WIDGET_WIZARD_FORM));

  const onClickNextStep = () => {
    if (isAnalyticsEnabled) {
      provideEcGA({
        eventName: 'view_item',
        baseEventParameters,
        additionalParameters: {
          item_list_name: activeDashboardId || 'noID',
          items: [
            getEcWidget({
              itemId: undefined,
              itemName: getWidgetTypeName(formValues?.widgetType),
              index: undefined,
              itemVariant: currentPage,
              itemListName: activeDashboardId || 'noID',
            }),
          ],
        },
      });
    }

    if (eventsInfo?.nextStep) {
      trackEvent(eventsInfo.nextStep);
    }
    if (step === 1 && formValues?.contentParameters?.contentFields) {
      const ev = eventsInfo?.selectCriteria?.(formValues.contentParameters.contentFields);
      if (ev) {
        trackEvent(ev);
      }
    }

    const widgetMode =
      formValues?.contentParameters &&
      getWidgetModeValuesString(formValues.contentParameters.widgetOptions);
    if (step === 1 && widgetMode && eventsInfo?.selectToggleButtons) {
      trackEvent(eventsInfo.selectToggleButtons(widgetMode));
    }

    submitWidgetWizardForm();
  };

  const onClickPrevStep = () => {
    onStepChange(step - 1);
    if (eventsInfo?.prevStep) {
      trackEvent(eventsInfo.prevStep);
    }
  };

  const preprocessOutputData = (data: Record<string, unknown>) => {
    const widgetInfo = widgets.find((widget) => widget.id === data.widgetType);
    if (widgetInfo?.convertOutput) {
      return widgetInfo.convertOutput(data);
    }
    return data;
  };

  const nextStep = () => {
    onStepChange(step + 1);
  };

  useImperativeHandle(ref, () => ({
    onClickNextStep,
    onClickPrevStep,
    submitWidgetWizardForm,
  }));

  const onAddWidget = (formData: Record<string, unknown>) => {
    const { selectedDashboard, ...rest } = formData;
    const data = prepareWidgetDataForSubmit(preprocessOutputData(rest)) as FormValues;
    const { widgetType, name } = data;

    dispatch(showScreenLockAction());
    fetch(URLS.widget(projectKey) as string, {
      method: 'post',
      data,
    })
      .then(({ id }: { id: string | number }) => {
        const newWidget = {
          widgetId: id,
          widgetName: name,
          widgetType,
          ...getDefaultWidgetConfig(widgetType),
        };
        onConfirm(newWidget, closeModal, selectedDashboard);

        trackEvent(
          WIDGETS_EVENTS.clickOnSaveWidget({
            type: widgetType,
            dashboardId: activeDashboardId,
            modifiedFields: getModifiedFieldsLabels(initialFormValues, data),
            isWidgetNameChanged: name !== initialFormValues?.name,
            isWidgetDescriptionChanged: data?.description !== initialFormValues?.description,
            levelsCount: getCreatedWidgetLevelsCount(widgetType, data),
            isExcludeSkippedTests: getIsExcludeSkipped(widgetType, data),
            initialSeparateInterrupted:
              initialFormValues?.contentParameters?.widgetOptions?.separateInterrupted,
            finalSeparateInterrupted: data?.contentParameters?.widgetOptions?.separateInterrupted,
          }),
        );

        if (isAnalyticsEnabled) {
          provideEcGA({
            eventName: 'add_to_cart',
            baseEventParameters,
            additionalParameters: {
              item_list_name: (selectedDashboard as { id?: string | number }).id,
              items: [
                getEcWidget({
                  itemId: id,
                  itemName: getWidgetTypeName(widgetType),
                  index: 0,
                  itemVariant: currentPage,
                  itemListName: (selectedDashboard as { id?: string | number }).id,
                }),
              ],
            },
          });
        }
      })
      .catch((err: Error) => {
        dispatch(hideScreenLockAction());
        dispatch(showDefaultErrorNotification(err));
      });
  };

  const widgetType = formValues?.widgetType ?? '';

  return (
    <div className={cx('widget-wizard-content')}>
      <WizardInfoSection
        activeWidget={widgets.find((widget) => widgetType === widget.id)}
        projectKey={projectKey}
        widgetSettings={prepareWidgetDataForSubmit(preprocessOutputData(formValues ?? {}))}
        step={step}
      />
      <WizardControlsSection
        eventsInfo={eventsInfo}
        widgets={widgets}
        activeWidgetId={widgetType}
        step={step}
        nextStep={nextStep}
        onAddWidget={onAddWidget}
        onDisableButtons={onButtonsDisabledChange}
      />
    </div>
  );
});
