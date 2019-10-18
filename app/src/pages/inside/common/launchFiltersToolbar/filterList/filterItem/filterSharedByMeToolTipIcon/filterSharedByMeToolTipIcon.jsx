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

import { ALIGN_LEFT } from 'components/main/tooltips/constants';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import React from 'react';
import { Icon } from 'components/main/icon';

export const FilterSharedByMeToolTipIcon = withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    align: ALIGN_LEFT,
    leftOffset: -50,
    noArrow: true,
    dynamicWidth: true,
  },
})(() => <Icon type="icon-tables" />);
