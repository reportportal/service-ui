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

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SimpleMDE from 'simplemde';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import 'simplemde/dist/simplemde.min.css';
import { MarkdownViewer } from '../markdownViewer/markdownViewer';
import styles from './markdownEditor.scss';

const cx = classNames.bind(styles);
const toolbarTitles = defineMessages({
  heading1: {
    id: 'MarkdownEditor.heading1',
    defaultMessage: 'Big heading',
  },
  heading2: {
    id: 'MarkdownEditor.heading2',
    defaultMessage: 'Medium heading',
  },
  heading3: {
    id: 'MarkdownEditor.heading3',
    defaultMessage: 'Small heading',
  },
  cleanBlock: {
    id: 'MarkdownEditor.cleanBlock',
    defaultMessage: 'Clean block',
  },
  bold: {
    id: 'MarkdownEditor.bold',
    defaultMessage: 'Bold',
  },
  italic: {
    id: 'MarkdownEditor.italic',
    defaultMessage: 'Italic',
  },
  strikethrough: {
    id: 'MarkdownEditor.strikethrough',
    defaultMessage: 'Strikethrough',
  },
  unorderedList: {
    id: 'MarkdownEditor.unorderedList',
    defaultMessage: 'Generic list',
  },
  orderedList: {
    id: 'MarkdownEditor.orderedList',
    defaultMessage: 'Numbered list',
  },
  image: {
    id: 'MarkdownEditor.image',
    defaultMessage: 'Insert image',
  },
  link: {
    id: 'MarkdownEditor.link',
    defaultMessage: 'Create link',
  },
  quote: {
    id: 'MarkdownEditor.quote',
    defaultMessage: 'Quote',
  },
  code: {
    id: 'MarkdownEditor.code',
    defaultMessage: 'Code',
  },
  preview: {
    id: 'MarkdownEditor.preview',
    defaultMessage: 'Toggle preview',
  },
});

@injectIntl
export class MarkdownEditor extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    intl: intlShape.isRequired,
  };
  static defaultProps = {
    value: '',
    placeholder: '',
    onChange: () => {},
  };

  componentDidMount() {
    const { formatMessage } = this.props.intl;
    this.holder.value = this.props.value;
    this.simpleMDE = new SimpleMDE({
      element: this.holder,
      status: false,
      autoDownloadFontAwesome: false,
      toolbar: [
        {
          name: 'heading-1',
          action: SimpleMDE.toggleHeading1,
          className: 'icon-header-1',
          title: formatMessage(toolbarTitles.heading1),
        },
        {
          name: 'heading-2',
          action: SimpleMDE.toggleHeading2,
          className: 'icon-header-2',
          title: formatMessage(toolbarTitles.heading2),
        },
        {
          name: 'heading-3',
          action: SimpleMDE.toggleHeading3,
          className: 'icon-header-3',
          title: formatMessage(toolbarTitles.heading3),
        },
        {
          name: 'clean-block',
          action: SimpleMDE.cleanBlock,
          className: 'icon-clean-block',
          title: formatMessage(toolbarTitles.cleanBlock),
        },
        '|',
        {
          name: 'bold',
          action: SimpleMDE.toggleBold,
          className: 'icon-bold',
          title: formatMessage(toolbarTitles.bold),
        },
        {
          name: 'italic',
          action: SimpleMDE.toggleItalic,
          className: 'icon-italic',
          title: formatMessage(toolbarTitles.italic),
        },
        {
          name: 'strikethrough',
          action: SimpleMDE.toggleStrikethrough,
          className: 'icon-strikethrough',
          title: formatMessage(toolbarTitles.strikethrough),
        },
        '|',
        {
          name: 'unordered-list',
          action: SimpleMDE.toggleUnorderedList,
          className: 'icon-unordered-list',
          title: formatMessage(toolbarTitles.unorderedList),
        },
        {
          name: 'ordered-list',
          action: SimpleMDE.toggleOrderedList,
          className: 'icon-ordered-list',
          title: formatMessage(toolbarTitles.orderedList),
        },
        '|',
        {
          name: 'image',
          action: SimpleMDE.drawImage,
          className: 'icon-image',
          title: formatMessage(toolbarTitles.image),
        },
        {
          name: 'link',
          action: SimpleMDE.drawLink,
          className: 'icon-link',
          title: formatMessage(toolbarTitles.link),
        },
        '|',
        {
          name: 'quote',
          action: SimpleMDE.toggleBlockquote,
          className: 'icon-quote',
          title: formatMessage(toolbarTitles.quote),
        },
        {
          name: 'code',
          action: SimpleMDE.toggleCodeBlock,
          className: 'icon-code',
          title: formatMessage(toolbarTitles.code),
        },
        '|',
        {
          name: 'preview',
          action: SimpleMDE.togglePreview,
          className: 'icon-preview no-disable',
          title: formatMessage(toolbarTitles.preview),
        },
      ],
      placeholder: this.props.placeholder || '',
      spellChecker: false,
      blockStyles: {
        bold: '**',
        italic: '*',
        code: '`',
      },
      previewRender: plainText => ReactDOMServer.renderToStaticMarkup(
        <MarkdownViewer text={plainText} />,
      ),
    });
    this.simpleMDE.codemirror.on('change', this.onChangeHandler);
  }
  componentWillUnmount() {
    this.simpleMDE.codemirror.off('change', this.onChangeHandler);
  }
  onChangeHandler = () => {
    this.props.onChange(this.simpleMDE.value());
  };

  render() {
    return (
      <div className={cx('markdown-editor')}>
        <textarea
          ref={(holder) => { this.holder = holder; }}
          value={this.props.value}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}
