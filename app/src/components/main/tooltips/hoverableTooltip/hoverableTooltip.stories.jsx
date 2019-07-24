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
// eslint-disable-next-line import/extensions, import/no-unresolved
import { withTooltipRoot } from 'storybook-decorators';
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
  .addDecorator(withTooltipRoot)
  .add('with placement = bottom', () => {
    const data = {
      placement: 'bottom',
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
  .add('with placement = bottom-start', () => {
    const data = {
      placement: 'bottom-start',
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
  .add('with placement = bottom-end', () => {
    const data = {
      placement: 'bottom-end',
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
  .add('with placement = top', () => {
    const data = {
      placement: 'top',
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
  .add('with placement = left', () => {
    const data = {
      placement: 'left',
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
  .add('with placement = right', () => {
    const data = {
      placement: 'right',
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
  .add('with width=300px noArrow = true & desktopOnly = true & noMobile = true', () => {
    const data = {
      width: 300,
      placement: 'right',
      noArrow: true,
      noMobile: true,
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
  .add('with offset modifier', () => {
    const data = {
      placement: 'right',
      modifiers: {
        offset: { offset: '50, 50' },
      },
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
