/*
 * Copyright 2019 EPAM Systems
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

import React from 'react';
import track from 'react-tracking';
import ReactDOMServer from 'react-dom/server';
import EasyMDE from 'easymde';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import 'easymde/dist/easymde.min.css';
import { MarkdownViewer } from '../markdownViewer/markdownViewer';
import { MODE_DEFAULT, MODE_DARK } from '../constants';
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
@track()
export class MarkdownEditor extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    eventsInfo: PropTypes.object,
    mode: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    manipulateEditorOutside: PropTypes.func,
    active: PropTypes.bool,
    touched: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.shape({
      hintText: PropTypes.func,
      hintCondition: PropTypes.func,
    }),
    provideErrorHint: PropTypes.bool,
    controlled: PropTypes.bool,
  };
  static defaultProps = {
    value: '',
    placeholder: '',
    onChange: () => {},
    eventsInfo: {},
    mode: MODE_DEFAULT,
    manipulateEditorOutside: () => {},
    active: false,
    touched: false,
    error: '',
    hint: { hintText: () => '', hintCondition: () => true },
    provideErrorHint: false,
    controlled: false,
  };

  state = {
    isPreview: false,
  };

  componentDidUpdate(prevProps) {
    if (this.props.controlled) {
      if (this.easyMDE.value() !== this.props.value && prevProps.value !== this.props.value) {
        this.easyMDE.value(this.props.value);
      }
    }
  }

  componentDidMount() {
    const {
      intl: { formatMessage },
      value,
      mode,
      manipulateEditorOutside,
      eventsInfo,
    } = this.props;
    this.holder.value = value;

    const toolbarActionWrapper =
      (action) =>
      (...args) => {
        action(...args);
        this.props.tracking.trackEvent(eventsInfo.onClickToolbarIcon);
      };

    let toolbar = [
      {
        name: 'heading-1',
        action: EasyMDE.toggleHeading1,
        className: 'icon-header-1',
        title: formatMessage(toolbarTitles.heading1),
      },
      {
        name: 'heading-2',
        action: EasyMDE.toggleHeading2,
        className: 'icon-header-2',
        title: formatMessage(toolbarTitles.heading2),
      },
      {
        name: 'heading-3',
        action: EasyMDE.toggleHeading3,
        className: 'icon-header-3',
        title: formatMessage(toolbarTitles.heading3),
      },
      {
        name: 'clean-block',
        action: EasyMDE.cleanBlock,
        className: 'icon-clean-block',
        title: formatMessage(toolbarTitles.cleanBlock),
      },
      '|',
      {
        name: 'bold',
        action: EasyMDE.toggleBold,
        className: 'icon-bold',
        title: formatMessage(toolbarTitles.bold),
      },
      {
        name: 'italic',
        action: EasyMDE.toggleItalic,
        className: 'icon-italic',
        title: formatMessage(toolbarTitles.italic),
      },
      {
        name: 'strikethrough',
        action: EasyMDE.toggleStrikethrough,
        className: 'icon-strikethrough',
        title: formatMessage(toolbarTitles.strikethrough),
      },
      '|',
      {
        name: 'unordered-list',
        action: EasyMDE.toggleUnorderedList,
        className: 'icon-unordered-list',
        title: formatMessage(toolbarTitles.unorderedList),
      },
      {
        name: 'ordered-list',
        action: EasyMDE.toggleOrderedList,
        className: 'icon-ordered-list',
        title: formatMessage(toolbarTitles.orderedList),
      },
      '|',
      {
        name: 'image',
        action: EasyMDE.drawImage,
        className: 'icon-image',
        title: formatMessage(toolbarTitles.image),
      },
      {
        name: 'link',
        action: EasyMDE.drawLink,
        className: 'icon-link',
        title: formatMessage(toolbarTitles.link),
      },
      '|',
      {
        name: 'quote',
        action: EasyMDE.toggleBlockquote,
        className: 'icon-quote',
        title: formatMessage(toolbarTitles.quote),
      },
      {
        name: 'code',
        action: EasyMDE.toggleCodeBlock,
        className: 'icon-code',
        title: formatMessage(toolbarTitles.code),
      },
      '|',
      {
        name: 'preview',
        action: (...props) => {
          this.setState((state) => ({
            isPreview: !state.isPreview,
          }));
          return EasyMDE.togglePreview(...props);
        },
        className: 'icon-preview no-disable',
        title: formatMessage(toolbarTitles.preview),
      },
    ];

    if (eventsInfo.onClickToolbarIcon) {
      toolbar = toolbar.map((item) =>
        typeof item === 'object' ? { ...item, action: toolbarActionWrapper(item.action) } : item,
      );
    }

    this.easyMDE = new EasyMDE({
      element: this.holder,
      status: false,
      autoDownloadFontAwesome: false,
      toolbar,
      placeholder: this.props.placeholder || '',
      spellChecker: false,
      minHeight: mode === MODE_DARK ? '30px' : '50px',
      blockStyles: {
        bold: '**',
        italic: '*',
        code: '`',
      },
      previewRender: (plainText) =>
        ReactDOMServer.renderToStaticMarkup(<MarkdownViewer value={plainText} mode={mode} />),
    });
    this.easyMDE.codemirror.on('change', this.onChangeHandler);
    manipulateEditorOutside(this.easyMDE.codemirror);
  }
  componentWillUnmount() {
    this.easyMDE.codemirror.off('change', this.onChangeHandler);
  }
  onChangeHandler = () => {
    this.props.onChange(this.easyMDE.value());
    this.props.eventsInfo.onChange &&
      this.props.tracking.trackEvent(this.props.eventsInfo.onChange);
    this.props.manipulateEditorOutside(this.easyMDE.codemirror);
  };

  render() {
    const {
      value,
      onChange,
      mode,
      active,
      error,
      touched,
      provideErrorHint,
      hint: { hintText, hintCondition },
    } = this.props;

    return (
      <>
        <div
          className={cx(
            'markdown-editor',
            { [`mode-${mode}`]: mode },
            { preview: this.state.isPreview },
            { invalid: error && (touched || active) },
          )}
        >
          <textarea
            ref={(holder) => {
              this.holder = holder;
            }}
            value={value}
            onChange={onChange}
          />
        </div>
        {provideErrorHint && error && (touched || active) ? (
          <div className={cx('error')}>{error}</div>
        ) : (
          hintText &&
          hintCondition(this.easyMDE ? this.easyMDE.value() : value) && (
            <div className={cx('hint')}>
              {hintText(this.easyMDE ? this.easyMDE.value() : value)}
            </div>
          )
        )}
      </>
    );
  }
}
