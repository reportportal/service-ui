import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { PAStateSelector, updatePAStateAction } from 'controllers/project';
import styles from './patternListHeader.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  patternAnalysis: {
    id: 'PatternAnalysis.title',
    defaultMessage: 'Pattern-Analysis',
  },
  enablePA: {
    id: 'PatternAnalysis.enablePA',
    defaultMessage:
      'If ON - analysis starts as soon as any launch finished<br/>If OFF - not automatic, but can be invoked manually',
  },
  createPattern: {
    id: 'PatternAnalysis.createPattern',
    defaultMessage: 'Create pattern',
  },
});

@injectIntl
@connect(
  (state) => ({
    PAState: PAStateSelector(state),
  }),
  {
    updatePAState: updatePAStateAction,
  },
)
export class PatternListHeader extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onAddPattern: PropTypes.func,
    PAState: PropTypes.bool.isRequired,
    updatePAState: PropTypes.func,
    readOnly: PropTypes.bool,
  };

  static defaultProps = {
    pattern: {},
    id: 0,
    onAddPattern: () => {},
    updatePAState: () => {},
    readOnly: false,
  };

  render() {
    const {
      intl: { formatMessage },
      onAddPattern,
      PAState,
      updatePAState,
      readOnly,
    } = this.props;
    return (
      <div className={cx('pattern-list-header')}>
        <span className={cx('caption')}>{formatMessage(messages.patternAnalysis)}</span>
        <InputBigSwitcher
          disabled={readOnly}
          mobileDisabled
          value={PAState}
          onChange={updatePAState}
        />
        <p className={cx('description')}>{Parser(formatMessage(messages.enablePA))}</p>
        <span className={cx('create-button')}>
          <GhostButton disabled={readOnly} mobileDisabled icon={PlusIcon} onClick={onAddPattern}>
            {formatMessage(messages.createPattern)}
          </GhostButton>
        </span>
      </div>
    );
  }
}
