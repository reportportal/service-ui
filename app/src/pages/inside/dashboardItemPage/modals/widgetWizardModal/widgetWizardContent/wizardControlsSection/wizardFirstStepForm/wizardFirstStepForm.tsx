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

import { FC, useEffect } from 'react';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { createClassnames } from 'common/utils';
import { FieldProvider } from 'components/fields/fieldProvider';
import { DisabledButtons, Widget } from '../../../types';
import { WidgetTypeSelector } from './widgetTypeSelector';
import { WIDGET_WIZARD_FORM } from '../../../../common/constants';
import styles from './wizardFirstStepForm.scss';

const cx = createClassnames(styles);

interface FormValues {
  widgetType?: string;
}

interface OwnProps {
  widgets?: Widget[];
  onSubmit: (values: FormValues) => void;
  eventsInfo?: Record<string, unknown>;
  onDisableButtons?: (disabled: DisabledButtons) => void;
}

type Props = OwnProps & InjectedFormProps<FormValues, OwnProps>;

const WizardFirstStepFormBase: FC<Props> = ({
  handleSubmit,
  widgets = [],
  onSubmit,
  eventsInfo = {},
  onDisableButtons = () => {},
  valid = false,
}) => {
  useEffect(() => {
    onDisableButtons(valid ? null : 'add');
  }, [valid]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cx('wizard-first-step-form')}>
      <FieldProvider name="widgetType">
        <WidgetTypeSelector widgets={widgets} eventsInfo={eventsInfo} />
      </FieldProvider>
    </form>
  );
};

export const WizardFirstStepForm = reduxForm<FormValues, OwnProps>({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ widgetType }) => ({
    widgetType: !widgetType && 'error',
  }),
})(WizardFirstStepFormBase);
