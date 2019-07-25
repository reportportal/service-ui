import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { REGEX_PATTERN, STRING_PATTERN } from 'common/constants/patternTypes';
import { PatternControlPanel } from './patternControlPanel';
import styles from './patternListItem.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  [REGEX_PATTERN]: {
    id: 'PatternAnalysis.RegExp',
    defaultMessage: 'RegExp',
  },
  [STRING_PATTERN]: {
    id: 'PatternAnalysis.String',
    defaultMessage: 'String',
  },
});

@injectIntl
export class PatternListItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    pattern: PropTypes.object,
    id: PropTypes.number,
    readOnly: PropTypes.bool,
  };

  static defaultProps = {
    pattern: {},
    id: 0,
    readOnly: false,
  };

  render() {
    const { pattern, id, intl, readOnly } = this.props;

    return (
      <div className={cx('pattern-list-item')}>
        <PatternControlPanel pattern={pattern} id={id} readOnly={readOnly} />
        <div className={cx('pattern-rule-data')}>
          <span className={cx('pattern-data-name')}>
            {intl.formatMessage(messages[pattern.type.toUpperCase()])}
          </span>
          <span className={cx('pattern-data-value')}>{pattern.value}</span>
        </div>
      </div>
    );
  }
}
