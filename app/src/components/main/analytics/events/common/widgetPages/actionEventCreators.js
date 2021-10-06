/*
 * Copyright 2021 EPAM Systems
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

import { getSelectCriteriaFields, SORTING_ENTITY_MAP } from './utils';

export const getSelectSortingFilterAddWidgetModal = (category) => (value, tab) => ({
  category,
  action: 'Select Parameters of Sorting in Filter on Modal Add New Widget',
  label: `${tab} ${SORTING_ENTITY_MAP[value]}`,
});

export const getSortingForNewFilterEditWidgetModal = (category) => (value, tab) => ({
  category,
  action: 'Select parameters of sorting in filter in Modal Edit Widget',
  label: `${tab} ${SORTING_ENTITY_MAP[value]}`,
});

export const getClickZoomAddWidgetArea = (category) => (value) => ({
  category,
  action: 'Click on checkbox Zoom widget area in Modal Add Widget',
  label: value ? 'Add check mark' : 'Remove check mark',
});

export const getClickZoomEditWidgetArea = (category) => (value) => ({
  category,
  action: 'Click on checkbox Zoom widget area in Modal Edit Widget',
  label: value ? 'Add check mark' : 'Remove check mark',
});

export const getSelectCriteriaNewWidget = (category) => (values) => ({
  category,
  action: 'Select criteria for widget in Modal New Widget',
  label: getSelectCriteriaFields(values),
});

export const getSelectCriteriaEditWidget = (category) => (values) => ({
  category,
  action: 'Select criteria for widget in Modal Edit Widget',
  label: getSelectCriteriaFields(values),
});

export const getChooseRadioBtnShareWidget = (category) => (value) => ({
  category,
  action: 'Choose Radio Btn of Widget Type in Modal Add Shared Widget',
  label: value,
});

export const getChooseFilterAddWidgetModal = (category) => ({
  category,
  action: 'Click on radio Btn of Filter in Modal Add New Widget',
  label: 'Choose filter',
});

export const getAddFilterBtnAddWidgetModal = (category) => ({
  category,
  action: 'Click on Btn Add Filter in Modal Add New Widget',
  label: 'Arise fields for adding new filter',
});

export const getAddBtnAddNewFilterAddWidgetModal = (category) => ({
  category,
  action: 'Click on Btn Add in Add new filter in Modal Add New Widget',
  label: 'Add new filter in Modal Add New Widget',
});

export const getCancelBtnAddNewFilterAddWidgetModal = (category) => ({
  category,
  action: 'Click on Btn Cancel in Add new filter in Modal Add New Widget',
  label: 'Cancel adding new filter in Modal Add New Widget',
});
