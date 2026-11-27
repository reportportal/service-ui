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

import React, { Component } from 'react';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { sanitizeUserHtml } from 'common/utils/sanitizeUserHtml';
import { SingletonMarkdownObject } from '../singletonMarkdownObject';
import { MODE_DEFAULT } from '../constants';
import styles from './markdownViewer.scss';

const cx = classNames.bind(styles);

export class MarkdownViewer extends Component {
  static propTypes = {
    value: PropTypes.string,
    mode: PropTypes.string,
    onResize: PropTypes.func,
    className: PropTypes.string,
  };

  static defaultProps = {
    value: '',
    mode: MODE_DEFAULT,
    onResize: () => {},
    className: '',
  };

  constructor(props) {
    super(props);
    this.easyMDE = SingletonMarkdownObject.getInstance();
    this.container = React.createRef();
  }

  componentDidMount() {
    this.updateElements();
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value || this.props.onResize !== prevProps.onResize) {
      this.updateElements();
    }
  }

  updateElements = () => {
    if (!this.container.current) {
      return;
    }
    if (this.props.onResize) {
      this.container.current.querySelectorAll('img').forEach((elem) => {
        const img = elem;
        img.onload = () => {
          this.props.onResize();
        };
      });
    }
  };

  // Links get target/rel from the sanitiser hook; the parsed tree is reused while value is unchanged.
  getContent = (value) => {
    if (this.content === undefined || this.renderedValue !== value) {
      this.renderedValue = value;
      this.content = Parser(sanitizeUserHtml(this.easyMDE.markdown(value || '')).trim());
    }
    return this.content;
  };

  render() {
    const { value, mode } = this.props;

    return (
      <div className={cx('viewer-wrapper')}>
        <div
          ref={this.container}
          className={cx('markdown-viewer', { [`mode-${mode}`]: mode }, this.props.className)}
        >
          {this.getContent(value)}
        </div>
      </div>
    );
  }
}
