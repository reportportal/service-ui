import PropTypes from 'prop-types';
import moment from 'moment/moment';
import { utcOffset, getMinutesFromTimestamp, parseDateTimeRange } from 'common/utils';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputTimeDateRange } from 'components/inputs/inputTimeDateRange';
import { CONDITION_BETWEEN } from 'components/filterEntities/constants';

const presets = [
  {
    label: 'Today',
    value: {
      start: moment()
        .startOf('day')
        .valueOf(),
      end:
        moment()
          .endOf('day')
          .valueOf() + 1,
      dynamic: true,
    },
  },
  {
    label: 'Last 2 days',
    value: {
      start: moment()
        .startOf('day')
        .subtract(1, 'days')
        .valueOf(),
      end:
        moment()
          .endOf('day')
          .valueOf() + 1,
      dynamic: true,
    },
  },
  {
    label: 'Last 7 days',
    value: {
      start: moment()
        .startOf('day')
        .subtract(1, 'weeks')
        .valueOf(),
      end:
        moment()
          .endOf('day')
          .valueOf() + 1,
      dynamic: true,
    },
  },
  {
    label: 'Last 30 days',
    value: {
      start: moment()
        .startOf('day')
        .subtract(1, 'months')
        .valueOf(),
      end:
        moment()
          .endOf('day')
          .valueOf() + 1,
      dynamic: true,
    },
  },
];

const utcString = `${utcOffset > -1 ? `+${utcOffset}` : utcOffset}`;

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
}) => (
  <FieldFilterEntity
    title={title}
    smallSize={smallSize}
    removable={removable}
    onRemove={onRemove}
    vertical={vertical}
  >
    <InputTimeDateRange
      presets={presets}
      onChange={(val) => {
        onChange({ condition: CONDITION_BETWEEN, value: formatValue({ ...val }) });
      }}
      value={parseDateTimeRange(value)}
      withoutDynamic
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
};
EntityItemStartTime.defaultProps = {
  value: {},
  removable: true,
  title: '',
  smallSize: false,
  onRemove: () => {},
  onChange: () => {},
  vertical: false,
};
