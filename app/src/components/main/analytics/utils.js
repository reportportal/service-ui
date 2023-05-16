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

import GA4 from 'react-ga4';

// TODO: rewrite it after adding the GA4 e-commerce events
export const provideEcUniversalAnalytics = ({
  name,
  data,
  action,
  command = 'send',
  hitType = 'event',
  eventName = 'ecommerce',
  additionalData,
}) => {
  const ga = GA4.ga();

  if (Array.isArray(data)) {
    data.forEach((el) => {
      ga(`ec:${name}`, el);
    });
  } else {
    ga(`ec:${name}`, data);
  }
  if (additionalData) {
    ga('ec:setAction', action, additionalData);
  }
  ga(command, hitType, eventName, action);
};
//! Temporary solution. It allows us to avoid errors in the console.
//! Remove this code after adding all the e-commerce events to GA4
export const provideEcGA = () => {};

export const normalizeDimensionValue = (value) => {
  return value !== undefined ? value.toString() : undefined;
};

export const normalizeEventString = (string = '') =>
  string
    .trim()
    .replace(/\s+|-/g, '_')
    .toLowerCase();
