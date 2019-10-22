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
