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

import DOMPurify from 'dompurify';

/*
 * Sanitiser for app-authored message templates rendered as markup (notifications, confirmation and
 * delete modals). Templates only need inline emphasis and links; anything interpolated into them
 * (entity names, server error text) is reduced to that subset. Escape reporter-controlled values
 * with escapeHtml before interpolating them so they render as text.
 */
const purifier = DOMPurify(window);

export const TEMPLATE_HTML_CONFIG = {
  ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'span', 'p', 'code', 'a'],
  ALLOWED_ATTR: ['href'],
  ALLOWED_URI_REGEXP: /^(?:https?:|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
};

purifier.setConfig(TEMPLATE_HTML_CONFIG);

purifier.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export const sanitizeTemplateHtml = (html) =>
  html === null || html === undefined || html === '' ? '' : purifier.sanitize(String(html));
