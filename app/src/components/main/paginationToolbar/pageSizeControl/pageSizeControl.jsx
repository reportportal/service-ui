import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Input } from 'components/inputs/input';
import styles from './pageSizeControl.scss';

const cx = classNames.bind(styles);

const MAX_SIZE = 300;

export class PageSizeControl extends Component {
  static propTypes = {
    pageSize: PropTypes.number.isRequired,
    onChangePageSize: PropTypes.func,
  };

  static defaultProps = {
    onChangePageSize: () => {},
  };

  state = {
    inputVisible: false,
    inputValue: '',
  };

  inputRef = (node) => {
    this.inputNode = node;
  };

  showInput = () =>
    this.setState({ inputVisible: true }, () => {
      this.inputNode.focus();
    });

  handleChange = (e) => this.setState({ inputValue: e.target.value });

  normalizeInput = (value) => {
    if (Number(value) < 0 || isNaN(Number(value))) {
      return '0';
    } else if (Number(value) > MAX_SIZE) {
      return String(MAX_SIZE);
    }
    return value;
  };

  handleKeyPress = (e) => {
    const keyCode = e.keyCode || e.which;
    const keyValue = String.fromCharCode(keyCode);
    if (/([+-.e]|\D)/.test(keyValue)) {
      e.preventDefault();
    }
  };

  handleEnterKey = (e) => {
    const value = this.state.inputValue;
    if (e.keyCode === 13) {
      this.setState({ inputVisible: false, inputValue: '' });
      this.props.onChangePageSize(Number(this.normalizeInput(value)));
    }
  };

  render() {
    return (
      <div className={cx('page-size', { 'input-visible': this.state.inputVisible })}>
        {this.state.inputVisible ? (
          <SizeInput
            refFunction={this.inputRef}
            value={this.state.inputValue}
            onChange={this.handleChange}
            onKeyUp={this.handleEnterKey}
            onKeyPress={this.handleKeyPress}
          />
        ) : (
          <span className={cx('size-text')} onClick={this.showInput}>
            {this.props.pageSize}
          </span>
        )}{' '}
        per page
      </div>
    );
  }
}

const SizeInput = ({ ...props }) => (
  <div className={cx('size-input')}>
    <Input {...props} type="text" maxLength="3" />
  </div>
);
