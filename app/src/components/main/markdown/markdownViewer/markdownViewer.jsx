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
import styles from './markdownViewer.scss';
import { SingletonMarkdownObject } from '../singletonMarkdownObject';

const cx = classNames.bind(styles);

export class MarkdownViewer extends Component {
  static propTypes = {
    value: PropTypes.string,
    onResize: PropTypes.func,
  };
  static defaultProps = {
    value: '',
    onResize: () => {},
  };
  constructor(props) {
    super(props);
    this.simpleMDE = SingletonMarkdownObject.getInstance();
  }
  componentDidMount() {
    this.updateElements();
  }
  componentDidUpdate() {
    this.updateElements();
  }
  updateElements = () => {
    this.container.querySelectorAll('img').forEach((elem) => {
      const img = elem;
      img.onload = () => {
        this.props.onResize();
      };
    });
    this.container.querySelectorAll('a').forEach((elem) => {
      elem.setAttribute('target', '_blank');
    });
    this.container.querySelectorAll('code').forEach((elem) => {
      const element = elem;
      element.innerHTML = elem.textContent;
    });
  };
  escapeHtml = (string) => string.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  indentSpaces = (string) => string.replace(/^ +/gm, (str) => str.replace(/ /g, '&nbsp;'));

  render() {
    return (
      <div
        ref={(container) => {
          this.container = container;
        }}
        className={cx('markdown-viewer')}
      >
        {Parser(
          this.simpleMDE.markdown(
            this.indentSpaces(this.escapeHtml(this.props.value)).replace('_', '&#95;'),
          ),
        )}
      </div>
    );
  }
}
