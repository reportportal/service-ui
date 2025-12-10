/*
 * Copyright 2025 EPAM Systems
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

import React, { Fragment, useMemo } from 'react';
import { defineMessages, IntlShape, useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import {
  actionMessages,
  objectTypesMessages,
} from 'common/constants/localization/eventsLocalization';
import { NoItemMessage } from 'components/main/noItemMessage';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  ENTITY_CREATED_AT,
  ENTITY_EVENTS_OBJECT_TYPE,
  ENTITY_EVENT_NAME,
  ENTITY_OBJECT_NAME,
  ENTITY_SUBJECT_NAME,
  ENTITY_PROJECT_NAME,
  ENTITY_SUBJECT_TYPE,
} from 'components/filterEntities/constants';

import styles from './eventsGrid.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  timeCol: { id: 'EventsGrid.timeCol', defaultMessage: 'Time' },
  projectNameCol: { id: 'EventsGrid.projectNameCol', defaultMessage: 'Project Name' },
  subjectTypeCol: { id: 'EventsGrid.subjectTypeCol', defaultMessage: 'Subject Type' },
  subjectNameCol: { id: 'EventsGrid.subjectNameCol', defaultMessage: 'Subject Name' },
  actionCol: { id: 'EventsGrid.actionCol', defaultMessage: 'Action' },
  objectTypeCol: { id: 'EventsGrid.objectTypeCol', defaultMessage: 'Object Type' },
  objectTypeColShort: { id: 'EventsGrid.objectTypeColShort', defaultMessage: 'Type' },
  objectNameCol: { id: 'EventsGrid.objectNameCol', defaultMessage: 'Object Name' },
  objectNameColShort: { id: 'EventsGrid.objectNameColShort', defaultMessage: 'Name' },
  oldValueCol: { id: 'EventsGrid.oldValueCol', defaultMessage: 'Old Value' },
  newValueCol: { id: 'EventsGrid.newValueCol', defaultMessage: 'New Value' },
});

interface EventValue {
  created_at?: string;
  subject_name?: string;
  event_name?: string;
  object_type?: string;
  object_name?: string;
  project_name?: string;
  subject_type?: string;
  details?: {
    history: Array<{
      field: string;
      oldValue?: string;
      newValue?: string;
    }>;
  };
}

type CustomPropsFormatMessage = {
  formatMessage: IntlShape['formatMessage'];
};

type CustomPropsValueType = {
  valueType: 'old_value' | 'new_value';
};

interface BaseColumnComponentProps {
  className: string;
  value: EventValue;
}

interface ColumnComponentProps<TCustomProps> extends BaseColumnComponentProps {
  customProps: TCustomProps;
}

const TimeColumn = ({ className, value = {} }: BaseColumnComponentProps) => (
  <div className={cx('time-col', className)}>
    <AbsRelTime startTime={value.created_at} />
  </div>
);

const ProjectNameColumn = ({ className, value = {} }: BaseColumnComponentProps) => (
  <div className={cx('project-name-col', className)}>{value.project_name}</div>
);

const SubjectTypeColumn = ({ className, value = {} }: BaseColumnComponentProps) => (
  <div className={cx('subject-type-col', className)}>{value.subject_type}</div>
);

const SubjectNameColumn = ({ className, value = {} }: BaseColumnComponentProps) => (
  <div className={cx('subject-name-col', className)}>{value.subject_name}</div>
);

const ActionColumn = ({
  className,
  value = {},
  customProps: { formatMessage },
}: ColumnComponentProps<CustomPropsFormatMessage>) => (
  <div className={cx('action-col', className)}>
    {value.event_name && actionMessages[value.event_name]
      ? formatMessage(actionMessages[value.event_name as keyof typeof actionMessages])
      : value.event_name}
  </div>
);

const ObjectTypeColumn = ({
  className,
  value = {},
  customProps: { formatMessage },
}: ColumnComponentProps<CustomPropsFormatMessage>) => (
  <div className={cx('object-type-col', className)}>
    {value.object_type && objectTypesMessages[value.object_type]
      ? formatMessage(objectTypesMessages[value.object_type as keyof typeof objectTypesMessages])
      : value.object_type}
  </div>
);

const ObjectNameColumn = ({ className, value = {} }: BaseColumnComponentProps) => (
  <div className={cx('object-name-col', className)}>{value.object_name}</div>
);

const ValueColumn = ({
  className,
  value = {},
  customProps: { valueType },
}: ColumnComponentProps<CustomPropsValueType>) => (
  <div className={cx('value-col', className)}>
    {value?.details?.history.map((item) => (
      <React.Fragment key={`${item.field}__${item.oldValue}__${item.newValue}`}>
        <div>{item.field}:</div>
        <div>{item[valueType]}</div>
      </React.Fragment>
    ))}
  </div>
);

interface EventsGridProps {
  data?: EventValue[];
  loading?: boolean;
  sortingColumn?: string | null;
  sortingDirection?: string | null;
  onChangeSorting?: (columnId: string, direction: string) => void;
}

export const EventsGrid: React.FC<EventsGridProps> = ({
  data = [],
  loading = false,
  sortingColumn = null,
  sortingDirection = null,
  onChangeSorting = () => {},
}) => {
  const intl = useIntl();

  const columns = useMemo(
    () => [
      {
        id: ENTITY_CREATED_AT,
        title: {
          full: intl.formatMessage(messages.timeCol),
        },
        sortable: true,
        maxHeight: 170,
        component: TimeColumn,
      },
      {
        id: ENTITY_PROJECT_NAME,
        title: {
          full: intl.formatMessage(messages.projectNameCol),
        },
        sortable: true,
        maxHeight: 170,
        component: ProjectNameColumn,
      },
      {
        id: ENTITY_SUBJECT_TYPE,
        title: {
          full: intl.formatMessage(messages.subjectTypeCol),
        },
        sortable: true,
        maxHeight: 170,
        component: SubjectTypeColumn,
      },
      {
        id: ENTITY_SUBJECT_NAME,
        title: {
          full: intl.formatMessage(messages.subjectNameCol),
        },
        sortable: true,
        component: SubjectNameColumn,
      },
      {
        id: ENTITY_EVENT_NAME,
        title: {
          full: intl.formatMessage(messages.actionCol),
        },
        sortable: true,
        component: ActionColumn,
        customProps: {
          formatMessage: intl.formatMessage,
        },
      },
      {
        id: ENTITY_EVENTS_OBJECT_TYPE,
        title: {
          full: intl.formatMessage(messages.objectTypeCol),
          short: intl.formatMessage(messages.objectTypeColShort),
        },
        sortable: true,
        component: ObjectTypeColumn,
        customProps: {
          formatMessage: intl.formatMessage,
        },
      },
      {
        id: ENTITY_OBJECT_NAME,
        title: {
          full: intl.formatMessage(messages.objectNameCol),
          short: intl.formatMessage(messages.objectNameColShort),
        },
        sortable: true,
        component: ObjectNameColumn,
      },
      {
        id: 'oldValue',
        title: {
          full: intl.formatMessage(messages.oldValueCol),
        },
        component: ValueColumn,
        customProps: {
          valueType: 'old_value',
        },
      },
      {
        id: 'newValue',
        title: {
          full: intl.formatMessage(messages.newValueCol),
        },
        component: ValueColumn,
        customProps: {
          valueType: 'new_value',
        },
      },
    ],
    [intl],
  );

  return (
    <Fragment>
      <Grid
        columns={columns}
        data={data}
        loading={loading}
        sortingColumn={sortingColumn}
        sortingDirection={sortingDirection}
        onChangeSorting={onChangeSorting}
        headerClassName={cx('events-grid-header')}
        gridRowClassName={cx('events-grid-row')}
        className={cx('events-grid')}
      />
      {!data.length && !loading && (
        <NoItemMessage message={intl.formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)} />
      )}
    </Fragment>
  );
};
