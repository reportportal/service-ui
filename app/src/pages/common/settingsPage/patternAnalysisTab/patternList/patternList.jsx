import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { PatternListItem } from './patternListItem';

export const PatternList = ({ patterns }) => (
  <Fragment>
    {patterns.map((pattern, id) => (
      <PatternListItem
        key={`pattern_${id}`} // eslint-disable-line react/no-array-index-key
        id={id}
        pattern={pattern}
      />
    ))}
  </Fragment>
);

PatternList.propTypes = {
  patterns: PropTypes.array,
};

PatternList.defaultProps = {
  patterns: [],
};
