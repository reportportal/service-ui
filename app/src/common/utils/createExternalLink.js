/*
 * Copyright 2023 EPAM Systems
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

import DOMPurify from 'dompurify';
import { escapeHtml } from './escapeHtml';

const HTTP_URL = /^https?:\/\//i;

// data and icon are app-provided markup (translation chunk text, bundled SVG icons); href may come
// from plugin metadata, so it is scheme-checked, quoted and escaped. Non-http(s) links render as text.
export const createExternalLink = (data, href, dataAutomationId, icon) => {
  const content = `${data}${icon || ''}`;

  if (typeof href !== 'string' || !HTTP_URL.test(href)) {
    return DOMPurify.sanitize(`<span>${content}</span>`, { ALLOWED_ATTR: ['d', 'fill'] });
  }

  const automationIdAttribute = dataAutomationId
    ? ` data-automation-id="${escapeHtml(dataAutomationId)}"`
    : '';

  return DOMPurify.sanitize(
    `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener"${automationIdAttribute}>${content}</a>`,
    {
      ALLOWED_ATTR: ['target', 'href', 'rel', 'data-automation-id', 'd', 'fill'],
      // DOMPurify also tests non-URL attribute values (target, rel, d) against this pattern
      ALLOWED_URI_REGEXP: /^(?:https?:|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    },
  );
};
