import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { PatternListItem } from './patternListItem';

export const PatternList = ({ patterns, readOnly }) => (
  <Fragment>
    {patterns.map((pattern, id) => (
      <PatternListItem
        key={`pattern_${id}`} // eslint-disable-line react/no-array-index-key
        id={id}
        pattern={pattern}
        readOnly={readOnly}
      />
    ))}
  </Fragment>
);

PatternList.propTypes = {
  patterns: PropTypes.array,
  readOnly: PropTypes.bool,
};

PatternList.defaultProps = {
  patterns: [],
  readOnly: false,
};
