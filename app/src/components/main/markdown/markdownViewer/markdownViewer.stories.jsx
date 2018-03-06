/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { host } from 'storybook-host';
import { withReadme } from 'storybook-readme';
import { MarkdownViewer } from '../';
import README from './README.md';
import TestImage from './testImg/test-image.png';

const boldMock = '**bold**';
const italicMock = '*italic*';
const strikethroughMock = '~~strikethrough~~';
const unorderedListMock = '* Generic list item\n' +
  '* Generic list item\n' +
  '* Generic list item';
const orderedListMock = '1. Numbered list item\n' +
  '2. Numbered list item\n' +
  '3. Numbered list item';
const linkMock = '[Report portal](http://reportportal.io/)';
const quoteMock = '> This is a quote.';
const codeMock = '`var example = "hello!";`';
const imageMock = `![Yes](${TestImage})`;
const combinationMock = '# Intro\n' +
  'Go ahead, play around with the editor! Be sure to check out **bold** and *italic* styling, or even [links](https://google.com). You can type the Markdown syntax, use the toolbar, or use shortcuts like `cmd-b` or `ctrl-b`.\n' +
  '\n' +
  '## Lists\n' +
  'Unordered lists can be started using the toolbar or by typing `* `, `- `, or `+ `. Ordered lists can be started by typing `1. `.\n' +
  '\n' +
  '### Unordered\n' +
  '* Lists are a piece of cake\n' +
  '* They even auto continue as you type\n' +
  '* A double enter will end them\n' +
  '* Tabs and shift-tabs work too\n' +
  '\n' +
  '#### Ordered\n' +
  '1. Numbered lists...\n' +
  '2. ...work too!\n' +
  '\n' +
  '## What about images?\n' +
  `![Yes](${TestImage})\n`;

storiesOf('Components/Main/markdown/markdownViewer', module)
  .addDecorator(host({
    title: 'Markdown viewer component',
    align: 'center middle',
    backdrop: 'rgba(70, 69, 71, 0.2)',
    background: '#fff',
    height: 'auto',
    width: '70%',
  }))
  .addDecorator(withReadme(README))
  .add('default state', () => (
    <MarkdownViewer />
  ))
  .add('with bold markdown text', () => (
    <MarkdownViewer value={boldMock} />
  ))
  .add('with italic markdown text', () => (
    <MarkdownViewer value={italicMock} />
  ))
  .add('with strikethrough text', () => (
    <MarkdownViewer value={strikethroughMock} />
  ))
  .add('with unordered list', () => (
    <MarkdownViewer value={unorderedListMock} />
  ))
  .add('with ordered list', () => (
    <MarkdownViewer value={orderedListMock} />
  ))
  .add('with link', () => (
    <MarkdownViewer value={linkMock} />
  ))
  .add('with quote block', () => (
    <MarkdownViewer value={quoteMock} />
  ))
  .add('with code block', () => (
    <MarkdownViewer value={codeMock} />
  ))
  .add('with image', () => (
    <MarkdownViewer value={imageMock} onResize={action('block resized!')} />
  ))
  .add('different types of markdown', () => (
    <MarkdownViewer value={combinationMock} onResize={action('block resized!')} />
  ))
;
