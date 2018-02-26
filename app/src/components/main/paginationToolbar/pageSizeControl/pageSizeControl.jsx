import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Input } from 'components/inputs/input';
import styles from './pageSizeControl.scss';

const cx = classNames.bind(styles);

export class PageSizeControl extends Component {
  static propTypes = {
    pageSize: PropTypes.number.isRequired,
    onChangePageSize: PropTypes.func,
  };

  static defaultProps = {
    onChangePageSize: () => {
    },
  };

  state = {
    inputVisible: false,
    inputValue: '',
  };

  showInput = () =>
    this.setState({ inputVisible: true }, () => {
      this.inputNode.focus();
    });

  handleChange = e => this.setState({ inputValue: e.target.value });

  handleEnterKey = (e) => {
    const value = this.state.inputValue;
    if (e.keyCode === 13 && value !== '') {
      this.setState({ inputVisible: false, inputValue: '' });
      this.props.onChangePageSize(Number(value));
    }
  };

  render() {
    return (
      <div className={cx('page-size', { 'input-visible': this.state.inputVisible })}>
        {this.state.inputVisible
          ? <SizeInput
            inputRef={(node) => { this.inputNode = node; }}
            value={this.state.inputValue}
            onChange={this.handleChange}
            onKeyUp={this.handleEnterKey}
          />
          : <span className={cx('size-text')} onClick={this.showInput}>{this.props.pageSize}</span>
        } per page
      </div>
    );
  }
}

const SizeInput = ({ value, onChange, onKeyUp, inputRef }) => (
  <div className={cx('size-input')}>
    <Input
      refFunction={inputRef}
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      type="number"
      maxLength="3"
    />
  </div>
);
SizeInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  inputRef: PropTypes.func.isRequired,
};
SizeInput.defaultProps = {
  value: '',
  onChange: () => {},
  onKeyUp: () => {},
};
