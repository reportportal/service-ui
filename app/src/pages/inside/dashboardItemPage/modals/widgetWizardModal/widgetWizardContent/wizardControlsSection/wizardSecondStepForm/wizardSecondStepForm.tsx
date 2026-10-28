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

import { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { reduxForm, InjectedFormProps, initialize, change, getFormValues } from 'redux-form';
import { defineMessages, useIntl } from 'react-intl';
import { createClassnames } from 'common/utils';
import { activeFilterSelector } from 'controllers/filter';
import {
  dashboardItemsSelector,
  activeDashboardItemSelector,
  loadingSelector,
} from 'controllers/dashboard';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { CommonWidgetControls } from '../../../../common/widgetControls';
import { WIDGET_WIZARD_FORM } from '../../../../common/constants';
import { DisabledButtons, Widget } from '../../../types';
import styles from './wizardSecondStepForm.scss';

const cx = createClassnames(styles);

const WIDGET_NAME_PART_LIMIT = 124;

const messages = defineMessages({
  newDashboardName: {
    id: 'dashboardControl.dashboardName',
    defaultMessage: 'My first dashboard',
  },
});

interface Filter {
  name: string;
  [key: string]: unknown;
}

interface FormValues {
  filters?: Filter[];
  contentParameters?: {
    widgetOptions?: {
      launchNameFilter?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  name?: string;
  description?: string;
  selectedDashboard?: Record<string, unknown>;
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
  onSubmit: (values: FormValues) => void;
  onDisableButtons: (disabled: DisabledButtons) => void;
  eventsInfo?: Record<string, unknown>;
}

type Props = OwnProps & InjectedFormProps<FormValues, OwnProps>;

const WizardSecondStepFormBase: FC<Props> = ({
  widget,
  handleSubmit,
  onSubmit,
  onDisableButtons,
  eventsInfo = {},
  valid = false,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const widgetSettings = useSelector(getFormValues(WIDGET_WIZARD_FORM)) as FormValues;
  const activeLaunchFilter = useSelector(activeFilterSelector) as Record<string, unknown> | null;
  const dashboards = useSelector(dashboardItemsSelector) as Record<string, unknown>[];
  const activeDashboard = useSelector(activeDashboardItemSelector) as Record<string, unknown>;
  const loading = useSelector(loadingSelector) as boolean;

  const [formAppearance, setFormAppearance] = useState<FormAppearance>({
    mode: false,
    isMainControlsLocked: false,
    filter: {},
    predefinedFilter: activeLaunchFilter,
  });

  const getUniqPostfix = () => new Date().valueOf().toString().slice(-3);

  const generateWidgetName = () => {
    const { filters, contentParameters: { widgetOptions: { launchNameFilter } = {} } = {} } =
      widgetSettings || {};
    const filterBasedName =
      (filters?.length &&
        filters.reduce((acc: string, item: Filter) => `${acc}${acc.length ? '.' : ''}${item.name}`, '')) ||
      '';
    let generatedName = (filterBasedName || launchNameFilter || widget.title);
    if (generatedName.length > WIDGET_NAME_PART_LIMIT) {
      generatedName = generatedName.substring(0, WIDGET_NAME_PART_LIMIT);
    }
    return `${generatedName}_${getUniqPostfix()}`;
  };

  useEffect(() => {
    const newDashboard = { name: formatMessage(messages.newDashboardName), description: '' };
    const selectedDashboard = dashboards.length > 0 ? dashboards[0] : newDashboard;
    dispatch(change(WIDGET_WIZARD_FORM, 'name', generateWidgetName()));
    dispatch(change(WIDGET_WIZARD_FORM, 'description', ''));
    dispatch(change(WIDGET_WIZARD_FORM, 'selectedDashboard', selectedDashboard));
  }, []);

  useEffect(() => {
    const isLocked = formAppearance.mode !== false;
    const disableButtons = !valid ? 'add' : null;
    onDisableButtons(isLocked ? 'all' : disableButtons);
  }, [valid, formAppearance.mode, onDisableButtons]);

  const handleFormAppearanceChange = (mode: string | false, filter: Record<string, unknown>) => {
    const isLocked = mode !== false;
    const disableButtons = !valid ? 'add' : null;
    setFormAppearance((prev) => ({ ...prev, mode, filter, isMainControlsLocked: isLocked }));
    onDisableButtons(isLocked ? 'all' : disableButtons);
  };

  const ControlsForm = widget.controls;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cx('wizard-second-step-form')}>
      {loading ? (
        <SpinningPreloader />
      ) : (
        <>
          <CommonWidgetControls dashboards={dashboards} activeDashboard={activeDashboard || {}} />
          {ControlsForm && (
            <ControlsForm
              widgetType={widget.id}
              formAppearance={formAppearance}
              onFormAppearanceChange={handleFormAppearanceChange}
              initializeControlsForm={(data: unknown) =>
                dispatch(initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }))
              }
              widgetSettings={widgetSettings}
              eventsInfo={eventsInfo}
            />
          )}
        </>
      )}
    </form>
  );
};

export const WizardSecondStepForm = reduxForm<FormValues, OwnProps>({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ filters }) => ({
    filters: !filters?.length && 'error',
  }),
})(WizardSecondStepFormBase);
