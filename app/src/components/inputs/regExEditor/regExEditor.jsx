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
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import classNames from 'classnames/bind';
import { regExpMode } from './codemirror-regex-mode';
import styles from './regExEditor.scss';

CodeMirror.defineMode('regexp', regExpMode);

const cx = classNames.bind(styles);

export class RegExEditor extends Component {
  static propTypes = {
    options: PropTypes.object,
    value: PropTypes.string,
    error: PropTypes.string,
    touched: PropTypes.bool,
    readonly: PropTypes.bool,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    options: {
      mode: 'regexp',
      lineWrapping: true,
    },
    value: '',
    error: '',
    touched: false,
    readonly: false,
    onChange: () => {},
    onBlur: () => {},
  };

  constructor(props) {
    super(props);
    this.textareaNode = React.createRef();
    this.state = {
      value: props.value,
    };
  }

  componentDidMount() {
    const { options, readonly } = this.props;
    this.codeMirror = CodeMirror.fromTextArea(this.textareaNode.current, {
      ...options,
      readOnly: readonly,
    });
    this.codeMirror.on('change', this.onChangeHandler);
    this.codeMirror.on('blur', this.onBlurHandler);
    this.codeMirror.setValue(this.state.value);
  }

  onChangeHandler = (instance, changes) => {
    this.setState({
      value: instance.getValue(),
    });
    if (changes.origin !== 'setValue') {
      this.props.onChange(instance.getValue());
    }
  };

  onBlurHandler = (instance) => {
    this.props.onBlur(instance.getValue());
  };

  render() {
    const { error, touched } = this.props;
    return (
      <div
        className={cx('code-editor', {
          error,
          touched,
        })}
      >
        <textarea ref={this.textareaNode} defaultValue={this.state.value} autoComplete="off" />
      </div>
    );
  }
}
