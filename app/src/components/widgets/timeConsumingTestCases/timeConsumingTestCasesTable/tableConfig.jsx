import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const columns = {
  name: {
    header: (
      <FormattedMessage id="MostConsuming.table.header.testCase" defaultMessage="Test case" />
    ),
    nameKey: 'name',
  },
  status: {
    header: <FormattedMessage id="MostConsuming.table.header.status" defaultMessage="Status" />,
    statusKey: 'status',
  },
  duration: {
    header: <FormattedMessage id="MostConsuming.table.header.duration" defaultMessage="Duration" />,
    durationKey: 'duration',
  },
  date: {
    header: (
      <FormattedMessage id="MostConsuming.table.header.startTime" defaultMessage="Start time" />
    ),
    dateKey: 'startTime',
  },
};

export { columns };
