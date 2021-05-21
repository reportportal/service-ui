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
import { showModalAction } from 'controllers/modal';
import { MAKE_DECISION_MODAL } from 'pages/inside/stepPage/modals/editDefectModals/constants';

export const ignoreInAA = (items, { fetchFunc, eventsInfo }) =>
  showModalAction({ id: 'ignoreInAAModal', data: { items, fetchFunc, eventsInfo } });

export const includeInAA = (items, { fetchFunc, eventsInfo }) =>
  showModalAction({ id: 'includeInAAModal', data: { items, fetchFunc, eventsInfo } });

export const linkIssue = (items, { currentModal, fetchFunc, eventsInfo }) =>
  showModalAction({ id: currentModal || 'linkIssueModal', data: { items, fetchFunc, eventsInfo } });

export const unlinkIssue = (items, { currentModal, fetchFunc, eventsInfo }) =>
  showModalAction({
    id: currentModal || 'unlinkIssueModal',
    data: { items, fetchFunc, eventsInfo },
  });

export const postIssue = (items, { currentModal, fetchFunc, eventsInfo }) =>
  showModalAction({ id: currentModal || 'postIssueModal', data: { items, fetchFunc, eventsInfo } });

export const editDefect = (items, { fetchFunc, debugMode, eventsInfo }) =>
  showModalAction({ id: MAKE_DECISION_MODAL, data: { items, fetchFunc, debugMode, eventsInfo } });
