import PropTypes from 'prop-types';
import moment from 'moment/moment';
import { FormattedMessage } from 'react-intl';
import { getMinutesFromTimestamp, parseDateTimeRange } from 'common/utils';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { InputTimeDateRange } from 'components/inputs/inputTimeDateRange';
import { CONDITION_BETWEEN } from 'components/filterEntities/constants';

const presets = [
  {
    label: <FormattedMessage id="EntityItemStartTime.today" defaultMessage="Today" />,
    value: {
      start: moment()
        .startOf('day')
        .valueOf(),
      end: moment(),
      dynamic: true,
    },
  },
  {
    label: <FormattedMessage id="EntityItemStartTime.last2days" defaultMessage="Last 2 days" />,
    value: {
      start: moment()
        .startOf('day')
        .subtract(1, 'days')
        .valueOf(),
      end: moment(),
      dynamic: true,
    },
  },
  {
    label: <FormattedMessage id="EntityItemStartTime.last7days" defaultMessage="Last 7 days" />,
    value: {
      start: moment()
        .startOf('day')
        .subtract(7, 'days')
        .valueOf(),
      end: moment(),
      dynamic: true,
    },
  },
  {
    label: <FormattedMessage id="EntityItemStartTime.last30days" defaultMessage="Last 30 days" />,
    value: {
      start: moment()
        .startOf('day')
        .subtract(30, 'days')
        .valueOf(),
      end: moment(),
      dynamic: true,
    },
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
      presets={presets}
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
