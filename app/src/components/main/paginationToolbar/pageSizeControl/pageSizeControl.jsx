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

  handleChange = (e) => this.setState({ inputValue: this.normalizeInput(e.target.value) });

  normalizeInput = (value) => (Number(value) < 0 || isNaN(Number(value)) ? '0' : value);

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
        {this.state.inputVisible ? (
          <SizeInput
            refFunction={this.inputRef}
            value={this.state.inputValue}
            onChange={this.handleChange}
            onKeyUp={this.handleEnterKey}
            type="number"
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

const SizeInput = ({ value, onChange, onKeyUp, refFunction }) => (
  <div className={cx('size-input')}>
    <Input
      refFunction={refFunction}
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
  refFunction: PropTypes.func.isRequired,
};
SizeInput.defaultProps = {
  value: '',
  onChange: () => {},
  onKeyUp: () => {},
};
