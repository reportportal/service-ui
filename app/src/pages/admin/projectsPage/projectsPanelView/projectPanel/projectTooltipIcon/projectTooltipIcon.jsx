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

import { Component } from 'react';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';

@withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    width: 180,
    noArrow: false,
  },
})
export class ProjectTooltipIcon extends Component {
  static propTypes = {
    children: PropTypes.node,
  };
  static defaultProps = {
    children: '',
  };

  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}
