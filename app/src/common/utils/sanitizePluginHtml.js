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
 * Sanitiser for plugin-authored metadata (plugin descriptions from jar manifests or REMOTE plugin
 * JSON manifests). The author is a third party, the text is shown to every member: text, basic
 * formatting and http(s)/mailto links only. No images, styles, classes or ids.
 */
const purifier = DOMPurify(window);

export const PLUGIN_HTML_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'a',
    'strong',
    'em',
    'b',
    'i',
    'code',
    'pre',
    'ul',
    'ol',
    'li',
    'span',
    'div',
  ],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
};

purifier.setConfig(PLUGIN_HTML_CONFIG);

purifier.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

export const sanitizePluginHtml = (html) => (html ? purifier.sanitize(String(html)) : '');

export const isHttpUrl = (value) => {
  if (typeof value !== 'string' || !value) {
    return false;
  }
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
