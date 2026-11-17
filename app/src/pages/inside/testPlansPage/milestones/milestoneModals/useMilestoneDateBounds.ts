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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { parseDateOnly } from '../milestoneDateUtils';

const toDateBound = (value: string | undefined): Date | undefined => {
  if (!value?.trim()) return undefined;
  return parseDateOnly(value) ?? undefined;
};

export const useMilestoneDateBounds = (formName: string) => {
  const selector = useMemo(() => formValueSelector(formName), [formName]);

  const startDate = useSelector((state) => selector(state, 'startDate') as string | undefined);
  const endDate = useSelector((state) => selector(state, 'endDate') as string | undefined);

  const startDateAsDate = useMemo(() => toDateBound(startDate), [startDate]);
  const endDateAsDate = useMemo(() => toDateBound(endDate), [endDate]);

  return { startDate, endDate, startDateAsDate, endDateAsDate };
};

