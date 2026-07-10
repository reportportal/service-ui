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

const STYLE_TAG_REGEX = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

const USER_CONTENT_FORBIDDEN_TAGS = [
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'option',
  'fieldset',
  'legend',
  'iframe',
  'object',
  'embed',
];

const UNSAFE_CSS_PROPERTY = /\b(?:position|z-index)\s*:[^;}]*/gi;

const normalizeCss = (value) =>
  value
    .replace(/(?:;\s*){2,}/g, ';')
    .replace(/\{\s*;/g, '{')
    .replace(/;\s*}/g, '}')
    .replace(/;\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const sanitizeCssValue = (value) => normalizeCss(value.replace(UNSAFE_CSS_PROPERTY, ''));

const splitHtmlByStyleBlocks = (html) => {
  const parts = [];
  let lastIndex = 0;
  let match = STYLE_TAG_REGEX.exec(html);

  while (match) {
    if (match.index > lastIndex) {
      parts.push({ type: 'html', value: html.slice(lastIndex, match.index) });
    }

    parts.push({ type: 'style', value: match[1] });
    lastIndex = STYLE_TAG_REGEX.lastIndex;
    match = STYLE_TAG_REGEX.exec(html);
  }

  STYLE_TAG_REGEX.lastIndex = 0;

  if (lastIndex < html.length) {
    parts.push({ type: 'html', value: html.slice(lastIndex) });
  }

  return parts;
};

const removeUnsafeStyleAttribute = (_node, data) => {
  if (data.attrName !== 'style') {
    return;
  }

  const sanitizedStyle = sanitizeCssValue(data.attrValue);

  if (!sanitizedStyle) {
    data.keepAttr = false;
    return;
  }

  data.attrValue = sanitizedStyle;
};

const sanitizeHtmlPart = (htmlPart, config) =>
  DOMPurify.sanitize(htmlPart, {
    FORBID_TAGS: USER_CONTENT_FORBIDDEN_TAGS,
    ...config,
  });

const sanitizeStylePart = (styleContent) => {
  const sanitized = sanitizeCssValue(styleContent);

  return sanitized ? `<style>${sanitized}</style>` : '';
};

export const sanitizeUserHtml = (html, config = {}) => {
  const parts = splitHtmlByStyleBlocks(html);

  if (!parts.length) {
    return '';
  }

  DOMPurify.addHook('uponSanitizeAttribute', removeUnsafeStyleAttribute);

  const sanitized = parts
    .map((part) =>
      part.type === 'style' ? sanitizeStylePart(part.value) : sanitizeHtmlPart(part.value, config),
    )
    .join('');

  DOMPurify.removeHook('uponSanitizeAttribute', removeUnsafeStyleAttribute);

  return sanitized;
};
