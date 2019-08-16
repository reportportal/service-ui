import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const columns = {
  name: {
    header: <FormattedMessage id="FlakyTests.table.header.testCase" defaultMessage="Test case" />,
    nameKey: 'itemName',
  },
  count: {
    header: <FormattedMessage id="FlakyTests.table.header.switches" defaultMessage="Switches" />,
    headerShort: (
      <FormattedMessage id="FlakyTests.table.header.switchesShort" defaultMessage="Swtchs" />
    ),
    countKey: 'flakyCount',
    matrixKey: 'statuses',
  },
  percents: {
    header: (
      <FormattedMessage id="FlakyTests.table.header.ofSwitches" defaultMessage="% of switches" />
    ),
    headerShort: (
      <FormattedMessage id="FlakyTests.table.header.ofSwitchesShort" defaultMessage="% swtchs" />
    ),
  },
  date: {
    header: (
      <FormattedMessage id="FlakyTests.table.header.lastSwitch" defaultMessage="Last switch" />
    ),
    dateKey: 'startTime',
  },
};

export { columns };
