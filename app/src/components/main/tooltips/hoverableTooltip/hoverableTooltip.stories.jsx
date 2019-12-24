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

import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';

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
  .addParameters({
    readme: {
      sidebar: README,
    },
  })
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
