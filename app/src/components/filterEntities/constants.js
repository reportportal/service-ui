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

export const CONDITION_CNT = 'cnt';
export const CONDITION_NOT_CNT = '!cnt';
export const CONDITION_NOT_CNT_KEY = 'not_cnt';
export const CONDITION_NOT_CNT_EVENTS = 'non_cnt';
export const CONDITION_EQ = 'eq';
// TODO export const CONDITION_NOT_EQ = '!eq';
export const CONDITION_NOT_EQ = 'ne';
export const CONDITION_GREATER_EQ = 'gte';
export const CONDITION_LESS_EQ = 'lte';
export const CONDITION_BETWEEN = 'btw';
export const CONDITION_HAS = 'has';
export const CONDITION_NOT_HAS = '!has';
export const CONDITION_IN = 'in';
export const CONDITION_NOT_IN = '!in';
export const CONDITION_ANY = 'any';
export const CONDITION_NOT_ANY = '!any';

export const ENTITY_NAME = 'name';
export const ACTIVITIES = 'activities';
export const ENTITY_NUMBER = 'number';
export const ENTITY_USER = 'user';
export const ENTITY_ACTION = 'action';
export const ENTITY_OBJECT_TYPE = 'entity';
export const ENTITY_OBJECT_NAME = 'objectName';
export const ENTITY_START_TIME = 'startTime';
export const ENTITY_DESCRIPTION = 'description';
export const ENTITY_ATTRIBUTE = 'compositeAttribute';
export const ENTITY_STATUS = 'status';
export const ENTITY_METHOD_TYPE = 'type';
export const ENTITY_DEFECT_TYPE = 'issueType';
export const ENTITY_DEFECT_COMMENT = 'issueComment';
export const ENTITY_BTS_ISSUES = 'ticketId';
export const ENTITY_IGNORE_ANALYZER = 'ignoreAnalyzer';
export const ENTITY_AUTO_ANALYZED = 'autoAnalyzed';
export const ENTITY_CREATION_DATE = 'creationDate';
export const ENTITY_PATTERN_NAME = 'patternName';
export const ENTITY_RETRY = 'hasRetries';
export const ENTITY_NEW_FAILURE = 'newFailure';

export const ENTITY_CREATED_AT = 'createdAt';
export const ENTITY_EVENT_NAME = 'eventName';
export const ENTITY_EVENTS_OBJECT_TYPE = 'objectType';
export const ENTITY_SUBJECT_NAME = 'subjectName';
export const ENTITY_SUBJECT_TYPE = 'subjectType';
export const ENTITY_PROJECT_NAME = 'projectName';

export const reMappedOperationValuesMap = {
  [CONDITION_NOT_CNT]: CONDITION_NOT_CNT_KEY,
};
