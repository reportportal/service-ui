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

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues, initialize, InjectedFormProps, reduxForm } from 'redux-form';
import { createClassnames } from 'common/utils';
import { activeDashboardItemSelector } from 'controllers/dashboard';
import { CommonWidgetControls } from '../../../common/widgetControls';
import { WIDGET_WIZARD_FORM } from '../../../common/constants';
import { ContentParameters, DisabledButtons, Widget } from '../../../widgetWizardModal/types';
import styles from './editWidgetControlsForm.scss';

const cx = createClassnames(styles);

interface FormValues {
  filters?: { value?: string; name?: string }[];
  contentParameters?: ContentParameters;
  name?: string;
  description?: string;
  widgetType?: string;
  [key: string]: unknown;
}

interface FormAppearance {
  mode: string | false;
  isMainControlsLocked: boolean;
  filter: Record<string, unknown>;
  predefinedFilter: Record<string, unknown> | null;
}

interface OwnProps {
  widget: Widget;
  widgetId: number;
  onSubmit: (values: FormValues) => void;
  onDisableButtons: (disabled: DisabledButtons) => void;
}

type Props = OwnProps & InjectedFormProps<FormValues, OwnProps>;

const EditWidgetControlsFormBase = ({
  widget,
  widgetId,
  handleSubmit,
  onSubmit,
  onDisableButtons,
  valid = false,
}: Props) => {
  const dispatch = useDispatch();
  const widgetSettings = useSelector(getFormValues(WIDGET_WIZARD_FORM)) as FormValues;
  const activeDashboard = (useSelector(activeDashboardItemSelector) || {}) as {
    widgets?: object[];
    [key: string]: unknown;
  };

  const [formAppearance, setFormAppearance] = useState<FormAppearance>({
    mode: false,
    isMainControlsLocked: false,
    filter: {},
    predefinedFilter: null,
  });

  useEffect(() => {
    const isFilterEditorOpen = formAppearance.mode !== false;
    const disableButtons = valid ? null : 'add';
    onDisableButtons(isFilterEditorOpen ? 'all' : disableButtons);
  }, [valid, formAppearance.mode, onDisableButtons]);

  const handleFormAppearanceChange = (mode: string | false, filter: Record<string, unknown>) => {
    const isFilterEditorOpen = mode !== false;
    const disableButtons = valid ? null : 'add';
    setFormAppearance((prev) => ({
      ...prev,
      mode,
      filter,
      isMainControlsLocked: isFilterEditorOpen,
    }));
    onDisableButtons(isFilterEditorOpen ? 'all' : disableButtons);
  };

  const ControlsForm = widget.controls;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cx('form')}>
      {!formAppearance.isMainControlsLocked && (
        <CommonWidgetControls widgetId={widgetId} activeDashboard={activeDashboard} />
      )}
      {ControlsForm && (
        <ControlsForm
          widgetType={widget.id}
          formAppearance={formAppearance}
          onFormAppearanceChange={handleFormAppearanceChange}
          initializeControlsForm={(data: Record<string, unknown>) =>
            dispatch(initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }))
          }
          widgetSettings={widgetSettings}
        />
      )}
    </form>
  );
};

export const EditWidgetControlsForm = reduxForm<FormValues, OwnProps>({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ filters }) => ({
    filters: !filters?.length && 'error',
  }),
})(EditWidgetControlsFormBase);
