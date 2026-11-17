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

import {
  drawMarkdownLink,
  handleMarkdownUrlPaste,
  isMarkdownLinkUrl,
  normalizeMarkdownLinkUrl,
} from './markdownLinkUtils';

describe('markdownLinkUtils', () => {
  describe('normalizeMarkdownLinkUrl', () => {
    test('normalizes valid http(s) and www urls', () => {
      expect(normalizeMarkdownLinkUrl('https://reportportal.io')).toBe('https://reportportal.io');
      expect(normalizeMarkdownLinkUrl('http://example.com/path')).toBe('http://example.com/path');
      expect(normalizeMarkdownLinkUrl('www.example.com')).toBe('http://www.example.com');
    });

    test('rejects incomplete and invalid values', () => {
      expect(normalizeMarkdownLinkUrl('https://')).toBeNull();
      expect(normalizeMarkdownLinkUrl('www.')).toBeNull();
      expect(normalizeMarkdownLinkUrl('not a url')).toBeNull();
      expect(normalizeMarkdownLinkUrl('')).toBeNull();
      expect(normalizeMarkdownLinkUrl('ftp://example.com')).toBeNull();
    });
  });

  describe('isMarkdownLinkUrl', () => {
    test('accepts http and https urls', () => {
      expect(isMarkdownLinkUrl('https://reportportal.io')).toBe(true);
      expect(isMarkdownLinkUrl('http://example.com/path')).toBe(true);
      expect(isMarkdownLinkUrl('www.example.com')).toBe(true);
    });

    test('rejects non-url text', () => {
      expect(isMarkdownLinkUrl('not a url')).toBe(false);
      expect(isMarkdownLinkUrl('')).toBe(false);
      expect(isMarkdownLinkUrl('ftp://example.com')).toBe(false);
      expect(isMarkdownLinkUrl('https://')).toBe(false);
      expect(isMarkdownLinkUrl('www.')).toBe(false);
    });
  });

  describe('handleMarkdownUrlPaste', () => {
    test('wraps selection with pasted url', () => {
      const replaceSelection = jest.fn();
      const preventDefault = jest.fn();
      const cm = {
        getSelection: () => 'docs',
        replaceSelection,
      };
      const event = {
        preventDefault,
        clipboardData: {
          getData: () => 'https://reportportal.io',
        },
      };

      handleMarkdownUrlPaste(cm, event);

      expect(preventDefault).toHaveBeenCalled();
      expect(replaceSelection).toHaveBeenCalledWith('[docs](https://reportportal.io)');
    });

    test('prefixes www urls on paste', () => {
      const replaceSelection = jest.fn();
      const preventDefault = jest.fn();
      const cm = {
        getSelection: () => 'docs',
        replaceSelection,
      };
      const event = {
        preventDefault,
        clipboardData: {
          getData: () => 'www.example.com',
        },
      };

      handleMarkdownUrlPaste(cm, event);

      expect(replaceSelection).toHaveBeenCalledWith('[docs](http://www.example.com)');
    });

    test('does not handle incomplete urls', () => {
      const replaceSelection = jest.fn();
      const preventDefault = jest.fn();
      const cm = {
        getSelection: () => 'docs',
        replaceSelection,
      };
      const event = {
        preventDefault,
        clipboardData: {
          getData: () => 'https://',
        },
      };

      handleMarkdownUrlPaste(cm, event);

      expect(preventDefault).not.toHaveBeenCalled();
      expect(replaceSelection).not.toHaveBeenCalled();
    });

    test('does not handle paste without selection', () => {
      const replaceSelection = jest.fn();
      const preventDefault = jest.fn();
      const cm = {
        getSelection: () => '',
        replaceSelection,
      };
      const event = {
        preventDefault,
        clipboardData: {
          getData: () => 'https://reportportal.io',
        },
      };

      handleMarkdownUrlPaste(cm, event);

      expect(preventDefault).not.toHaveBeenCalled();
      expect(replaceSelection).not.toHaveBeenCalled();
    });
  });

  describe('drawMarkdownLink', () => {
    test('inserts link and selects url placeholder', () => {
      const replaceSelection = jest.fn();
      const setSelection = jest.fn();
      const focus = jest.fn();
      const cm = {
        getSelection: () => 'docs',
        getCursor: (type) => (type === 'start' ? { line: 0, ch: 0 } : { line: 0, ch: 4 }),
        setSelection,
        replaceSelection,
        focus,
      };
      const editor = {
        codemirror: cm,
        isPreviewActive: () => false,
      };

      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: undefined,
      });

      drawMarkdownLink(editor);

      expect(replaceSelection).toHaveBeenCalledWith('[docs](http://)');
      expect(setSelection).toHaveBeenCalledWith({ line: 0, ch: 7 }, { line: 0, ch: 14 });
      expect(focus).toHaveBeenCalled();

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard,
      });
    });

    test('replaces placeholder with clipboard url when document is unchanged', async () => {
      const replaceSelection = jest.fn();
      const replaceRange = jest.fn();
      const setSelection = jest.fn();
      const focus = jest.fn();
      let cursorStart = { line: 0, ch: 0 };
      let cursorEnd = { line: 0, ch: 4 };
      const cm = {
        getSelection: () => 'docs',
        getCursor: (type) => (type === 'start' ? cursorStart : cursorEnd),
        setSelection: (from, to) => {
          setSelection(from, to);
          cursorStart = from;
          cursorEnd = to;
        },
        replaceSelection,
        replaceRange,
        changeGeneration: () => 1,
        isClean: () => true,
        focus,
      };
      const editor = {
        codemirror: cm,
        isPreviewActive: () => false,
      };

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          readText: () => Promise.resolve('www.example.com'),
        },
      });

      drawMarkdownLink(editor);
      await Promise.resolve();
      await Promise.resolve();

      expect(replaceSelection).toHaveBeenCalledWith('[docs](http://)');
      expect(replaceRange).toHaveBeenCalledWith(
        'http://www.example.com',
        { line: 0, ch: 7 },
        { line: 0, ch: 14 },
      );
    });

    test('skips clipboard url when document changed after placeholder insert', async () => {
      const replaceRange = jest.fn();
      let cursorStart = { line: 0, ch: 0 };
      let cursorEnd = { line: 0, ch: 4 };
      const cm = {
        getSelection: () => 'docs',
        getCursor: (type) => (type === 'start' ? cursorStart : cursorEnd),
        setSelection: (from, to) => {
          cursorStart = from;
          cursorEnd = to;
        },
        replaceSelection: jest.fn(),
        replaceRange,
        changeGeneration: () => 1,
        isClean: () => false,
        focus: jest.fn(),
      };
      const editor = {
        codemirror: cm,
        isPreviewActive: () => false,
      };

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          readText: () => Promise.resolve('https://reportportal.io'),
        },
      });

      drawMarkdownLink(editor);
      await Promise.resolve();
      await Promise.resolve();

      expect(replaceRange).not.toHaveBeenCalled();
    });
  });
});
