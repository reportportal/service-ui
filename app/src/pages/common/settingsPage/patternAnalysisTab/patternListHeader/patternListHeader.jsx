import React, { Component } from 'react';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { GhostButton } from 'components/buttons/ghostButton';
import PlusIcon from 'common/img/plus-button-inline.svg';
import styles from './patternListHeader.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  patternAnalysis: {
    id: 'PatternAnalysis.title',
    defaultMessage: 'Pattern-Analysis',
  },
  enablePA: {
    id: 'PatternAnalysis.enablePA',
    defaultMessage: 'Enable pattern-analysis to the project',
  },
  createPattern: {
    id: 'PatternAnalysis.createPattern',
    defaultMessage: 'Create pattern',
  },
});

@injectIntl
export class PatternListHeader extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    pattern: {},
    id: 0,
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <div className={cx('pattern-list-header')}>
        <span className={cx('caption')}>{formatMessage(messages.patternAnalysis)}</span>
        <span className={cx('switcher')}>
          <InputBigSwitcher />
        </span>
        <span className={cx('description')}>{formatMessage(messages.enablePA)}</span>
        <span className={cx('create-button')}>
          <GhostButton mobileDisabled icon={PlusIcon}>
            {formatMessage(messages.createPattern)}
          </GhostButton>
        </span>
      </div>
    );
  }
}
