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

import PropTypes from 'prop-types';
import moment from 'moment/moment';
import { FormattedMessage } from 'react-intl';
import { getMinutesFromTimestamp, parseDateTimeRange } from 'common/utils';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputTimeDateRange } from 'components/inputs/inputTimeDateRange';
import { CONDITION_BETWEEN } from 'components/filterEntities/constants';

const endOfToday = moment()
  .add(1, 'days')
  .startOf('day')
  .valueOf();

export const getTimeDateRangePresets = () => [
  {
    label: <FormattedMessage id="EntityItemStartTime.today" defaultMessage="Today" />,
    getValue: () => ({
      start: moment()
        .startOf('day')
        .valueOf(),
      end: endOfToday,
      dynamic: true,
    }),
  },
  {
    label: <FormattedMessage id="EntityItemStartTime.last2days" defaultMessage="Last 2 days" />,
    getValue: () => ({
      start: moment()
        .startOf('day')
        .subtract(1, 'days')
        .valueOf(),
      end: endOfToday,
      dynamic: true,
    }),
  },
  {
    label: <FormattedMessage id="EntityItemStartTime.last7days" defaultMessage="Last 7 days" />,
    getValue: () => ({
      start: moment()
        .startOf('day')
        .subtract(7, 'days')
        .valueOf(),
      end: endOfToday,
      dynamic: true,
    }),
  },
  {
    label: <FormattedMessage id="EntityItemStartTime.last30days" defaultMessage="Last 30 days" />,
    getValue: () => ({
      start: moment()
        .startOf('day')
        .subtract(30, 'days')
        .valueOf(),
      end: endOfToday,
      dynamic: true,
    }),
  },
];

const utcString = moment().format('ZZ');

const formatValue = ({ start, end, dynamic }) => {
  if (!dynamic) {
    return `${start},${end}`;
  }
  return `${getMinutesFromTimestamp(start)};${getMinutesFromTimestamp(end)};${utcString}`;
};

export const EntityItemStartTime = ({
  onRemove,
  onChange,
  removable,
  title,
  smallSize,
  value,
  vertical,
  customProps,
}) => (
  <FieldFilterEntity
    title={title}
    smallSize={smallSize}
    removable={removable}
    onRemove={onRemove}
    vertical={vertical}
  >
    <InputTimeDateRange
      presets={getTimeDateRangePresets()}
      onChange={(val) => {
        onChange({ condition: CONDITION_BETWEEN, value: formatValue({ ...val }) });
      }}
      value={parseDateTimeRange(value)}
      withoutDynamic={customProps.withoutDynamic}
    />
  </FieldFilterEntity>
);
EntityItemStartTime.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  title: PropTypes.string,
  smallSize: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  onChange: PropTypes.func,
  vertical: PropTypes.bool,
  customProps: PropTypes.object,
};
EntityItemStartTime.defaultProps = {
  value: {},
  removable: true,
  title: '',
  smallSize: false,
  onRemove: () => {},
  onChange: () => {},
  vertical: false,
  customProps: {},
};
