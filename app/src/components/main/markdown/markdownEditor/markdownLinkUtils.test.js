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
} from './markdownLinkUtils';

describe('markdownLinkUtils', () => {
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
  });
});
