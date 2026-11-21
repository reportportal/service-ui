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

// Kill switch of the flat (virtualised) log rows. When false the logs grid renders the recursive
// nested rows of the shared grid, as before.
// It is kept until the virtualised grid passes browser QA and the perf protocol, then the switch
// and the old path are to be removed.
// Known limitation of the virtualised grid: only the rendered rows are in the DOM, so the browser
// find (Ctrl+F) finds the text of these rows only.
export const LOGS_VIRTUALIZATION_ENABLED = true;
