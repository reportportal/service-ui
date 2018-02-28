import Select, { AsyncCreatable, Async, Creatable } from 'react-select';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { fetch } from 'common/utils';
import styles from './inputTagsSearch.scss';

const cx = classNames.bind(styles);
const renderItems = params => (
  <ScrollWrapper autoHeight autoHeightMax={200}>
    {Select.defaultProps.menuRenderer(params)}
  </ScrollWrapper>
);

const selectType = (async, creatable) => {
  if (async) {
    if (creatable) {
      return AsyncCreatable;
    }
    return Async;
  } else if (creatable) {
    return Creatable;
  }
  return Select;
};

export class InputTagsSearch extends Component {
  static propTypes = {
    uri: PropTypes.string,
    options: PropTypes.array,
    value: PropTypes.array,
    focusPlaceholder: PropTypes.string,
    loadingPlaceholder: PropTypes.string,
    nothingFound: PropTypes.string,
    creatable: PropTypes.bool,
    async: PropTypes.bool,
    multi: PropTypes.bool,
    removeSelected: PropTypes.bool,
    onChange: PropTypes.func,
    makeOptions: PropTypes.func,
    isValidNewOption: PropTypes.func,
    validation: PropTypes.func,
    minLength: PropTypes.number,
    showNewLabel: PropTypes.bool,
    dynamicSearchPromptText: PropTypes.bool,
  };
  static defaultProps = {
    uri: '',
    options: [],
    value: [],
    focusPlaceholder: '',
    loadingPlaceholder: '',
    nothingFound: '',
    creatable: false,
    async: false,
    multi: true,
    removeSelected: false,
    makeOptions: () => {},
    isValidNewOption: () => {},
    validation: () => {},
    onChange: () => {},
    minLength: 1,
    showNewLabel: false,
    dynamicSearchPromptText: false,
  };
  state = {
    searchPromptText: this.props.nothingFound,
  };
  onInputChange = (input) => {
    const diff = this.props.minLength - input.length;
    if (this.props.dynamicSearchPromptText && this.props.minLength && diff > 0) {
      const dynamicSearchPromptText = (
        <FormattedMessage
          id={'InputTagsSearch.dynamicSearchPromptText'}
          defaultMessage={'Please enter {length} or more characters'}
          values={{ length: diff }}
        />
      );
      this.setState({ searchPromptText: dynamicSearchPromptText });
    } else {
      this.setState({ searchPromptText: this.props.nothingFound });
    }
    return input;
  };
  getItems = (input) => {
    if (input.length >= this.props.minLength) {
      return fetch(`${this.props.uri}${input}`)
        .then((response) => {
          const options = this.props.makeOptions(response);
          return ({ options });
        });
    }
    return Promise.resolve({ options: [] });
  };
  isValidNewOption = ({ label }) => (
    this.props.isValidNewOption(label, this.props.minLength, this.props.validation)
  );
  renderOption = option => (
    <div className={cx('select2-item')} key={option.value} onClick={() => { this.props.onChange(option.value); }}>
      <span>{option.label}</span>
    </div>
  );
  renderNewItemLabel = (label) => {
    if (this.props.showNewLabel) {
      return (
        <div>
          <span>{label}</span>
          <span className={cx('new')}><FormattedMessage id="InputTagsSearch.new" defaultMessage="New" /></span>
        </div>
      );
    }
    return label;
  };
  render() {
    const { async, creatable, loadingPlaceholder, focusPlaceholder,
      value, options, onChange, multi, removeSelected } = this.props;
    const SelectComponent = selectType(async, creatable);
    return (
      <div className={cx('select-container')}>
        <SelectComponent
          loadOptions={this.getItems}
          autoload={false}
          cache={false}
          className={cx('select2-search-tags')}
          noResultsText={this.state.searchPromptText}
          loadingPlaceholder={loadingPlaceholder}
          searchPromptText={focusPlaceholder}
          value={value}
          options={options}
          onInputChange={this.onInputChange}
          onChange={onChange}
          multi={multi}
          optionRenderer={this.renderOption}
          isValidNewOption={this.isValidNewOption}
          menuRenderer={renderItems}
          promptTextCreator={this.renderNewItemLabel}
          removeSelected={removeSelected}
        />
      </div>
    );
  }
}

