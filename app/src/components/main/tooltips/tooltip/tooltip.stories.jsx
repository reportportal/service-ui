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
import { withTooltip } from './withTooltip';
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

storiesOf('Components/Main/Tooltips/Tooltip', module)
  .addDecorator(
    host({
      title: 'Tooltip component',
      placement: 'center middle',
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
  .add('with placement = right', () => {
    const data = {
      width: 130,
      placement: 'right',
      noArrow: true,
      desktopOnly: true,
    };
    const Wrapper = withTooltip({ TooltipComponent: StoryBookTooltip, data })(TargetComponent);
    return (
      <div>
        <Wrapper />
      </div>
    );
  })
  .add('with placement = left', () => {
    const data = {
      width: 130,
      placement: 'left',
      noArrow: true,
      desktopOnly: true,
    };
    const Wrapper = withTooltip({ TooltipComponent: StoryBookTooltip, data })(TargetComponent);
    return (
      <div>
        <Wrapper />
      </div>
    );
  })
  .add('with noArrow = false & desktopOnly = false', () => {
    const data = {
      width: 130,
      placement: 'left',
      noArrow: false,
      desktopOnly: false,
    };
    const Wrapper = withTooltip({ TooltipComponent: StoryBookTooltip, data })(TargetComponent);
    return (
      <div>
        <Wrapper />
      </div>
    );
  });
