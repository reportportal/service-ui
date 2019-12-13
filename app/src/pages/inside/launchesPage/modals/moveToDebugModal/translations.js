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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  moveToDebugHeader: {
    id: 'MoveToDebugModal.moveToDebugHeader',
    defaultMessage: 'Move to debug',
  },
  moveToDebugText: {
    id: 'MoveToDebugModal.moveToDebug',
    defaultMessage: 'Are you sure you want to move launch to Debug?',
  },
  moveToDebugMultipleText: {
    id: 'MoveToDebugModal.moveToDebugMultiple',
    defaultMessage: 'Are you sure you want to move selected launches to Debug?',
  },
  moveToDebugFailedMessage: {
    id: 'MoveToDebugModal.moveToDebugFailedMessage',
    defaultMessage: 'Failed to move to debug the launch: {message}',
  },
  moveToDebugMultipleFailedMessage: {
    id: 'MoveToDebugModal.moveToDebugMultipleFailedMessage',
    defaultMessage: 'Failed to move to debug the launches: {message}',
  },
  moveToDebugSuccessMessage: {
    id: 'MoveToDebugModal.moveToDebugSuccessMessage',
    defaultMessage: 'Launch has been successfully shifted to debug',
  },
  moveToDebugMultipleSuccessMessage: {
    id: 'MoveToDebugModal.moveToDebugMultipleSuccessMessage',
    defaultMessage: 'Launches have been successfully shifted to debug',
  },
  moveToAllHeader: {
    id: 'MoveToDebugModal.moveToAllHeader',
    defaultMessage: 'Move to all launches',
  },
  moveToAllText: {
    id: 'MoveToDebugModal.moveToAllText',
    defaultMessage: 'Are you sure you want to move launch to All launches?',
  },
  moveToAllMultipleText: {
    id: 'MoveToDebugModal.moveToAllMultipleText',
    defaultMessage: 'Are you sure you want to move selected launches to All launches?',
  },
  moveToAllFailedMessage: {
    id: 'MoveToDebugModal.moveToAllFailedMessage',
    defaultMessage: 'Failed to move to All launches the launch: {message}',
  },
  moveToAllMultipleFailedMessage: {
    id: 'MoveToDebugModal.moveToAllMultipleFailedMessage',
    defaultMessage: 'Failed to move to All launches the launches: {message}',
  },
  moveToAllSuccessMessage: {
    id: 'MoveToDebugModal.moveToAllSuccessMessage',
    defaultMessage: 'Launch has been successfully shifted to All launches',
  },
  moveToAllMultipleSuccessMessage: {
    id: 'MoveToDebugModal.moveToAllMultipleSuccessMessage',
    defaultMessage: 'Launches have been successfully shifted to All launches',
  },
});
