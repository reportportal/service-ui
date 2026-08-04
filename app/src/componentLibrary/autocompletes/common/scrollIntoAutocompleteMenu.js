/*
 * Copyright 2026 EPAM Systems
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

import computeScrollIntoView from 'compute-scroll-into-view';

/*
Custom scrollIntoView for Downshift.
rc-scrollbars / ScrollWrapper hide the native scrollbar via an `overflow: hidden` clip wrapper
around an inner `overflow: scroll` view. By spec those hidden wrappers count as scrollable,
so the default behavior scrolls them too - which shifts the modal content
sideways and reveals the native scrollbar. `skipOverflowHiddenElements` skips
`overflow: hidden` nodes and scrolls only genuinely scrollable ancestors.
Docs: https://github.com/scroll-into-view/compute-scroll-into-view#skipoverflowhiddenelements
Downshift scrollIntoView prop: https://github.com/downshift-js/downshift#scrollintoview
*/
export const scrollIntoAutocompleteMenu = (node, menuNode) => {
  if (!node) {
    return;
  }
  const actions = computeScrollIntoView(node, {
    boundary: menuNode,
    block: 'nearest',
    scrollMode: 'if-needed',
    skipOverflowHiddenElements: true,
  });
  actions.forEach(({ el, top, left }) => {
    el.scrollTop = top;
    el.scrollLeft = left;
  });
};
