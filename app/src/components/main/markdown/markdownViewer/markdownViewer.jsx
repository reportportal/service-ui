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
