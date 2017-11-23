import React from 'react';
import Autosuggest from 'react-autosuggest';
import { connect } from '@cerebral/react';
import { state, signal } from 'cerebral/tags';
import { getObjWithoutKeys } from 'common/utils';

import './autoCompleteInput.scss';

const AutoCompleteInput = (propsObj) => {
  const onSuggestionsFetchRequested = ({ value }) => {
    propsObj.loadSuggestions({ value });
  };
  const getSuggestionValue = suggestion => suggestion.name;
  const renderSuggestion = suggestion => (
    <span>{suggestion.name}</span>
  );
  const inputProps = getObjWithoutKeys(propsObj, [
    'loadSuggestions', 'resetSuggestions', 'suggestions',
  ]);
  inputProps.onChange = (e, { newValue }) => {
    propsObj.onChange({ target: { value: newValue } });
  };
  return (
    <Autosuggest
      suggestions={propsObj.suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={propsObj.resetSuggestions}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
    />
  );
};


export default connect({
  loadSuggestions: signal`query.loadSuggestions`,
  resetSuggestions: signal`query.resetSuggestions`,
  suggestions: state`query.searchForm.search.suggestions`,
}, AutoCompleteInput);
