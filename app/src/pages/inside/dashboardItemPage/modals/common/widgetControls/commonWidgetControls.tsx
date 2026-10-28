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

import { useEffect } from 'react';
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl';
import { FieldText, FieldTextFlex } from '@reportportal/ui-kit';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { validate, composeBoundValidators, bindMessageToValidator } from 'common/utils/validation';
import { isEmptyObject } from 'common/utils/isEmptyObject';
import { DashboardControl } from './controls/dashboardControl';

const messages = defineMessages({
  widgetNameHint: {
    id: 'CommonWidgetControls.widgetNameHint',
    defaultMessage: 'Widget name should have size from 3 to 128',
  },
  widgetNameExistsHint: {
    id: 'CommonWidgetControls.widgetNameExistsHint',
    defaultMessage: 'This name is already in use',
  },
  nameLabel: {
    id: 'CommonWidgetControls.nameLabel',
    defaultMessage: 'Widget name',
  },
  namePlaceholder: {
    id: 'CommonWidgetControls.namePlaceholder',
    defaultMessage: 'Enter widget name',
  },
  descriptionLabel: {
    id: 'CommonWidgetControls.descriptionLabel',
    defaultMessage: 'Description',
  },
  descriptionPlaceholder: {
    id: 'CommonWidgetControls.descriptionPlaceholder',
    defaultMessage: 'Enter widget description',
  },
});

const widgetNameValidator = (formatMessage: (message: MessageDescriptor) => string, widgetId: number | null, widgets: object[] = []) =>
  composeBoundValidators([
    bindMessageToValidator(validate.widgetName, formatMessage(messages.widgetNameHint)),
    bindMessageToValidator(
      validate.createWidgetNameUniqueValidator(widgets, widgetId),
      formatMessage(messages.widgetNameExistsHint),
    ),
  ]);

interface ActiveDashboard {
  widgets?: object[];
  [key: string]: unknown;
}

interface CommonWidgetControlsProps {
  initializeControlsForm?: (() => void) | null;
  widgetId?: number | null;
  dashboards?: object[];
  activeDashboard?: ActiveDashboard;
  isMainControlsDisabled?: boolean;
}

export const CommonWidgetControls = ({
  initializeControlsForm = null,
  widgetId = null,
  dashboards = [],
  activeDashboard = {},
  isMainControlsDisabled = false,
}: CommonWidgetControlsProps) => {
  const { formatMessage } = useIntl();

  useEffect(() => {
    initializeControlsForm?.();
  }, []);

  const { widgets = [] } = activeDashboard;
  const showDashboardsList = activeDashboard && isEmptyObject(activeDashboard) && !widgetId;

  return (
    <>
      <FieldProvider name="name" validate={widgetNameValidator(formatMessage, widgetId, widgets)}>
        <FieldErrorHint provideHint={false}>
          <FieldText
            label={formatMessage(messages.nameLabel)}
            placeholder={formatMessage(messages.namePlaceholder)}
            maxLength={128}
            maxLengthDisplay={128}
            defaultWidth={false}
            disabled={isMainControlsDisabled}
          />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="description">
        <FieldErrorHint provideHint={false}>
          <FieldTextFlex
            label={formatMessage(messages.descriptionLabel)}
            placeholder={formatMessage(messages.descriptionPlaceholder)}
            maxLength={1500}
            maxLengthDisplay={1500}
            disabled={isMainControlsDisabled}
          />
        </FieldErrorHint>
      </FieldProvider>
      {showDashboardsList && (
        <FieldProvider name="selectedDashboard" dashboards={dashboards}>
          <DashboardControl />
        </FieldProvider>
      )}
    </>
  );
};
