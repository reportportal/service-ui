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

const DEFAULT_LINK_URL = 'http://';

export const normalizeMarkdownLinkUrl = (text = '') => {
  const trimmed = text.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return null;
  }

  const candidate = /^www\./i.test(trimmed) ? `http://${trimmed}` : trimmed;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    if (!url.hostname || url.hostname === 'www.') {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
};

export const isMarkdownLinkUrl = (text) => Boolean(normalizeMarkdownLinkUrl(text));

const insertMarkdownLink = (cm, selectedText, from, url) => {
  const linkText = selectedText || 'link';
  const prefix = `[${linkText}](`;
  const insertion = `${prefix}${url})`;

  cm.replaceSelection(insertion);

  if (!selectedText.includes('\n')) {
    const urlStart = from.ch + prefix.length;
    cm.setSelection(
      { line: from.line, ch: urlStart },
      { line: from.line, ch: urlStart + url.length },
    );
  }

  cm.focus();
};

export const drawMarkdownLink = (editor) => {
  const cm = editor.codemirror;
  if (!cm || editor.isPreviewActive()) {
    return;
  }

  const selectedText = cm.getSelection();
  const from = cm.getCursor('start');

  insertMarkdownLink(cm, selectedText, from, DEFAULT_LINK_URL);

  if (!navigator.clipboard?.readText || selectedText.includes('\n')) {
    return;
  }

  const urlFrom = cm.getCursor('start');
  const urlTo = cm.getCursor('end');
  const generation = cm.changeGeneration(true);

  navigator.clipboard
    .readText()
    .then((text) => {
      if (!cm.isClean(generation)) {
        return;
      }

      const normalized = normalizeMarkdownLinkUrl(text);
      if (!normalized) {
        return;
      }

      cm.replaceRange(normalized, urlFrom, urlTo);
      cm.setSelection(urlFrom, {
        line: urlFrom.line,
        ch: urlFrom.ch + normalized.length,
      });
      cm.focus();
    })
    .catch(() => {});
};

export const handleMarkdownUrlPaste = (cm, event) => {
  const selection = cm.getSelection();
  const normalized = normalizeMarkdownLinkUrl(event.clipboardData?.getData('text/plain'));

  if (!selection || !normalized) {
    return;
  }

  event.preventDefault();
  cm.replaceSelection(`[${selection}](${normalized})`);
};
