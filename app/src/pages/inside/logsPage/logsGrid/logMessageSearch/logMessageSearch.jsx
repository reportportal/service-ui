import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputSearch } from 'components/inputs/inputSearch/inputSearch';
import styles from './logMessageSearch.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  searchTitle: {
    id: 'LogMessageSearch.searchTitle',
    defaultMessage: 'Log message',
  },
  searchHint: {
    id: 'LogMessageSearch.searchHint',
    defaultMessage: 'At least 3 symbols required.',
  },
});

@injectIntl
export class LogMessageSearch extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    filter: PropTypes.string,
  };

  static defaultProps = {
    filter: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      inputValue: props.filter || '',
      isSearchHintRequired: false,
    };
  }

  onFocus = () => {
    if (this.state.inputValue.length < 3) {
      this.setState({
        isSearchHintRequired: true,
      });
    }
  };

  onBlur = () => {
    if (this.state.isSearchHintRequired) {
      this.setState({
        isSearchHintRequired: false,
      });
    }
  };

  handleInputChange = (event) => {
    if (!event.target.value || event.target.value.length >= 3) {
      this.props.onFilterChange(event.target.value || undefined);
    }

    this.setState({
      inputValue: event.target.value,
      isSearchHintRequired: event.target.value.length < 3,
    });
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('log-message-search')}>
        <span className={cx('search-title')}>{intl.formatMessage(messages.searchTitle)}</span>
        <div className={cx('input-search-wrapper')}>
          <InputSearch
            className={cx('input-search')}
            value={this.state.inputValue}
            onChange={this.handleInputChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            searchHint={
              (this.state.isSearchHintRequired && intl.formatMessage(messages.searchHint)) || ''
            }
            iconAtRight
          />
        </div>
      </div>
    );
  }
}
