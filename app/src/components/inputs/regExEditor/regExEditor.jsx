import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import classNames from 'classnames/bind';
import { regExpMode } from './coremirror-regex-mode';
import styles from './regExEditor.scss';

CodeMirror.defineMode('regexp', regExpMode);

const cx = classNames.bind(styles);

export class RegExEditor extends Component {
  static propTypes = {
    options: PropTypes.object,
    value: PropTypes.string,
    error: PropTypes.string,
    touched: PropTypes.bool,
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
    this.codeMirror = CodeMirror.fromTextArea(this.textareaNode.current, this.props.options);
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
