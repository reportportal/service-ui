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

export const PROJECT_MANAGER = 'PROJECT_MANAGER';
export const MEMBER = 'MEMBER';
export const CUSTOMER = 'CUSTOMER';
export const OPERATOR = 'OPERATOR';
export const PROJECT_ROLES = [CUSTOMER, OPERATOR, MEMBER, PROJECT_MANAGER];
export const DEFAULT_PROJECT_ROLE = MEMBER;
export const ROLES_MAP = [
  { value: CUSTOMER, label: CUSTOMER },
  { value: OPERATOR, label: OPERATOR },
  { value: MEMBER, label: MEMBER },
  { value: PROJECT_MANAGER, label: PROJECT_MANAGER.split('_').join(' ') },
];
