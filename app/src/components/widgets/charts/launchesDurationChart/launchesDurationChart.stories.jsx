/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import 'c3/c3.css';

import { LaunchesDurationChart } from './launchesDurationChart';
import README from './README.md';

const mockNode = document.createElement('node');
const mockObserver = {
  subscribe: () => {},
  unsubscribe: () => {},
};
const widgetData = {
  owner: 'just_an_owner',
  share: true,
  id: '7fjh37hfh3333ggdfs53',
  name: 'LAUNCHES DURATION CHART#sm',
  content_parameters: {
    type: 'column_chart',
    gadget: 'launches_duration_chart',
    metadata_fields: ['name', 'number', 'start_time'],
    content_fields: ['start_time', 'end_time', 'name', 'number', 'status'],
    itemsCount: 50,
  },
  filter_id: 'a5f5s8s65d429747f9hjvj4',
  content: {
    result: [
      {
        values: {
          duration: '4607',
          start_time: '1538474734721',
          end_time: '1538474739328',
          status: 'STOPPED',
        },
        name: 'Demo Api Tests__ncst',
        number: '6',
        id: '5bb342ee0274390001975997',
      },
      {
        values: {
          duration: '1526',
          start_time: '1538474726486',
          end_time: '1538474728012',
          status: 'FAILED',
        },
        name: 'Demo Api Tests__ncst',
        number: '3',
        id: '5bb342e60274390001974193',
      },
      {
        values: {
          duration: '360',
          start_time: '1538474725293',
          end_time: '1538474725653',
          status: 'FAILED',
        },
        name: 'Demo Api Tests__ncst',
        number: '1',
        id: '5bb342e50274390001973ec7',
      },
      {
        values: {
          duration: '831',
          start_time: '1538474725654',
          end_time: '1538474726485',
          status: 'PASSED',
        },
        name: 'Demo Api Tests__ncst',
        number: '2',
        id: '5bb342e50274390001973f69',
      },
      {
        values: {
          duration: '2848',
          start_time: '1538474728013',
          end_time: '1538474730861',
          status: 'FAILED',
        },
        name: 'Demo Api Tests__ncst',
        number: '4',
        id: '5bb342e80274390001974616',
      },
    ],
  },
};

storiesOf('Components/Widgets/Charts/LaunchesDurationChart', module)
  .addDecorator(
    host({
      title: 'Launch Duration Chart component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#ffffff',
      height: 360,
      width: 640,
    }),
  )
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <LaunchesDurationChart widget={widgetData} container={mockNode} observer={mockObserver} />
  ))
  .add('preview mode', () => (
    <LaunchesDurationChart
      widget={widgetData}
      container={mockNode}
      observer={mockObserver}
      preview
    />
  ));
