import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { PatternControlPanel } from './patternControlPanel';
import { PATTERN_TYPES } from '../../constants';
import styles from './patternListItem.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  [PATTERN_TYPES.REGEXP]: {
    id: 'PatternAnalysis.RegExp',
    defaultMessage: 'RegExp',
  },
  [PATTERN_TYPES.STRING]: {
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
  };

  static defaultProps = {
    pattern: {},
    id: 0,
  };

  render() {
    const { pattern, id, intl } = this.props;

    return (
      <div className={cx('pattern-list-item')}>
        <PatternControlPanel pattern={pattern} id={id} />
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
