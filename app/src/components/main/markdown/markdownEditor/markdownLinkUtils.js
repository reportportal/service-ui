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

export const isMarkdownLinkUrl = (text = '') => {
  const trimmed = text.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return false;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return /^(https?:\/\/|www\.)/i.test(trimmed);
  }
};

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
  const to = cm.getCursor('end');

  const applyLink = (url) => {
    cm.setSelection(from, to);
    insertMarkdownLink(cm, selectedText, from, url || DEFAULT_LINK_URL);
  };

  if (!navigator.clipboard?.readText) {
    applyLink(DEFAULT_LINK_URL);
    return;
  }

  navigator.clipboard
    .readText()
    .then((text) => {
      const trimmed = text.trim();
      applyLink(isMarkdownLinkUrl(trimmed) ? trimmed : DEFAULT_LINK_URL);
    })
    .catch(() => {
      applyLink(DEFAULT_LINK_URL);
    });
};

export const handleMarkdownUrlPaste = (cm, event) => {
  const selection = cm.getSelection();
  const pastedText = event.clipboardData?.getData('text/plain')?.trim();

  if (!selection || !isMarkdownLinkUrl(pastedText)) {
    return;
  }

  event.preventDefault();
  cm.replaceSelection(`[${selection}](${pastedText})`);
};
