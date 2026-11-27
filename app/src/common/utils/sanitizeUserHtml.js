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
 * Sanitiser for member-authored content (log messages, descriptions, comments, tooltips).
 * Other policies: sanitizePluginHtml (plugin metadata: text and http(s) links only),
 * sanitizeTemplateHtml (formatted notification/modal messages: inline formatting and links).
 *
 * One DOMPurify pass with an allow-list on a private instance: no <style> elements, no SVG/MathML,
 * inline styles filtered by property, classes limited to code-fence languages, ids/names prefixed
 * so user content cannot take over the app's root element ids.
 */
const purifier = DOMPurify(window);

export const USER_CONTENT_ALLOWED_TAGS = [
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'col',
  'colgroup',
  'dd',
  'del',
  'details',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'ins',
  'kbd',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  's',
  'samp',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'tt',
  'u',
  'ul',
  'var',
  'wbr',
];

export const USER_CONTENT_ALLOWED_ATTR = [
  'href',
  'title',
  'alt',
  'src',
  'width',
  'height',
  'align',
  'valign',
  'colspan',
  'rowspan',
  'start',
  'type',
  'open',
  'class',
  'id',
  'lang',
  'dir',
  'style',
];

const USER_CONTENT_CONFIG = {
  ALLOWED_TAGS: USER_CONTENT_ALLOWED_TAGS,
  ALLOWED_ATTR: USER_CONTENT_ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  // Pinned so a library upgrade cannot widen it; relative links stay allowed.
  // data: stays allowed on <img> only (DOMPurify DATA_URI_TAGS) for base64 screenshots.
  ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: [
    'style',
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
    'base',
    'meta',
    'link',
    'script',
    'svg',
    'math',
    'video',
    'audio',
    'source',
    'track',
    'picture',
    'template',
    'slot',
    'dialog',
  ],
  FORBID_ATTR: [
    'srcset',
    'sizes',
    'background',
    'ping',
    'formaction',
    'action',
    'poster',
    'usemap',
    'name',
    'xlink:href',
  ],
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
};

const ALLOWED_CSS_PROPERTIES = new Set([
  'color',
  'background-color',
  'font-weight',
  'font-style',
  'font-size',
  'font-family',
  'text-decoration',
  'text-align',
  'vertical-align',
  'white-space',
  'word-break',
  'overflow-wrap',
  'width',
  'height',
  'max-width',
  'max-height',
  'min-width',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-color',
  'border-width',
  'border-style',
  'border-radius',
  'border-collapse',
  'display',
  'float',
  'clear',
  'list-style-type',
  'text-transform',
  'line-height',
  'letter-spacing',
]);
const CSS_VALUE_RE = /^[\w\s#%.,()'"+-]+$/;
const CSS_VALUE_FORBIDDEN_RE = /url\s*\(|expression\s*\(|\/\*|@|\\|javascript|\bimage\s*\(/i;
const CSS_SIZE_PROPERTIES = new Set(['width', 'height', 'max-width', 'max-height', 'min-width']);
const CSS_SIZE_RE = /^\d+(\.\d+)?(px|%|em|rem)?$/;
const DISPLAY_ALLOWED = new Set([
  'inline',
  'block',
  'inline-block',
  'none',
  'table',
  'table-row',
  'table-cell',
  'list-item',
  'flex',
  'inline-flex',
]);
const CLASS_TOKEN_RE = /^language-[\w-]+$/;

export const sanitizeStyleAttribute = (value) =>
  String(value)
    .split(';')
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(':');
      if (separatorIndex < 0) {
        return null;
      }
      const name = declaration.slice(0, separatorIndex).trim().toLowerCase();
      const propertyValue = declaration
        .slice(separatorIndex + 1)
        .replace(/!important/gi, '')
        .trim();
      if (
        !ALLOWED_CSS_PROPERTIES.has(name) ||
        !propertyValue ||
        !CSS_VALUE_RE.test(propertyValue) ||
        CSS_VALUE_FORBIDDEN_RE.test(propertyValue)
      ) {
        return null;
      }
      if (name === 'display' && !DISPLAY_ALLOWED.has(propertyValue.toLowerCase())) {
        return null;
      }
      if (CSS_SIZE_PROPERTIES.has(name) && !CSS_SIZE_RE.test(propertyValue)) {
        return null;
      }
      return `${name}:${propertyValue}`;
    })
    .filter(Boolean)
    .join(';');

const sanitizeClassAttribute = (value) =>
  String(value)
    .split(/\s+/)
    .filter((token) => CLASS_TOKEN_RE.test(token))
    .join(' ');

purifier.setConfig(USER_CONTENT_CONFIG);

purifier.addHook('uponSanitizeAttribute', (_node, data) => {
  let sanitizedValue;
  if (data.attrName === 'style') {
    sanitizedValue = sanitizeStyleAttribute(data.attrValue);
  } else if (data.attrName === 'class') {
    sanitizedValue = sanitizeClassAttribute(data.attrValue);
  } else {
    return;
  }
  if (sanitizedValue) {
    data.attrValue = sanitizedValue;
  } else {
    data.keepAttr = false;
  }
});

purifier.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
  if (node.tagName === 'IMG') {
    node.setAttribute('referrerpolicy', 'no-referrer');
    node.setAttribute('loading', 'lazy');
  }
});

const CACHE_LIMIT = 1000;
// Values with embedded base64 screenshots can be megabytes long, so the cache is also bounded by
// the characters it retains (input plus output): larger values are not cached at all.
const CACHE_ENTRY_MAX_SIZE = 64 * 1024;
const CACHE_TOTAL_MAX_SIZE = 8 * 1024 * 1024;
const cache = new Map();
let cacheTotalSize = 0;

export const sanitizeUserHtml = (html) => {
  if (!html) {
    return '';
  }
  const cached = cache.get(html);
  if (cached !== undefined) {
    cache.delete(html);
    cache.set(html, cached);
    return cached;
  }
  const sanitized = purifier.sanitize(String(html));
  const size = String(html).length + sanitized.length;
  if (typeof html !== 'string' || size > CACHE_ENTRY_MAX_SIZE) {
    return sanitized;
  }
  // Map iterates in insertion order, so the least recently used entries come first
  for (const [key, value] of cache) {
    if (cache.size < CACHE_LIMIT && cacheTotalSize + size <= CACHE_TOTAL_MAX_SIZE) {
      break;
    }
    cache.delete(key);
    cacheTotalSize -= key.length + value.length;
  }
  cache.set(html, sanitized);
  cacheTotalSize += size;
  return sanitized;
};

export const getSanitizeUserHtmlCacheSize = () => cache.size;
export const getSanitizeUserHtmlCacheTotalSize = () => cacheTotalSize;
