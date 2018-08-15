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
import { withHoverableTooltip } from './withHoverableTooltip';
import README from './README.md';

const StoryBookTooltip = () => (
  <div>
    <span>Read a story</span>
  </div>
);
const TargetComponent = () => (
  <div>
    <span>Hover me</span>
  </div>
);

storiesOf('Components/Main/Tooltips/HoverableTooltip', module)
  .addDecorator(
    host({
      title: 'Hoverable tooltip component',
      align: 'center middle',
      backdrop: 'rgba(70, 69, 71, 0.2)',
      background: '#fff',
      height: 200,
      width: 200,
    }),
  )
  .addDecorator(withReadme(README))
  .add('with align = right', () => {
    const data = {
      width: 130,
      align: 'right',
      noArrow: true,
      desktopOnly: true,
    };
    const Wrapper = withHoverableTooltip({ TooltipComponent: StoryBookTooltip, data })(
      TargetComponent,
    );
    return (
      <div>
        <Wrapper />
      </div>
    );
  })
  .add('with align = left', () => {
    const data = {
      width: 130,
      align: 'left',
      noArrow: true,
      desktopOnly: true,
    };
    const Wrapper = withHoverableTooltip({ TooltipComponent: StoryBookTooltip, data })(
      TargetComponent,
    );
    return (
      <div>
        <Wrapper />
      </div>
    );
  })
  .add('with noArrow = false & desktopOnly = false', () => {
    const data = {
      width: 130,
      align: 'left',
      noArrow: false,
      desktopOnly: false,
    };
    const Wrapper = withHoverableTooltip({ TooltipComponent: StoryBookTooltip, data })(
      TargetComponent,
    );
    return (
      <div>
        <Wrapper />
      </div>
    );
  });
