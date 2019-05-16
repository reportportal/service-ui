import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import IconEdit from 'common/img/pencil-empty-inline.svg';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import IconDelete from 'common/img/trashcan-inline.svg';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import classNames from 'classnames/bind';
import styles from './patternControlPanel.scss';

const cx = classNames.bind(styles);

// It's written as class for future usage.
// eslint-disable-next-line react/prefer-stateless-function
export class PatternControlPanel extends Component {
  static propTypes = {
    pattern: PropTypes.object,
    id: PropTypes.number,
  };

  static defaultProps = {
    pattern: {},
    id: 0,
  };

  render() {
    const { id, pattern } = this.props;
    return (
      <div className={cx('pattern-control-panel')}>
        <span className={cx('pattern-number')}>{id + 1}</span>
        <span className={cx('switcher')}>
          <InputSwitcher value={pattern.enabled} />
        </span>
        <span className={cx('pattern-name')}>{pattern.name}</span>
        <div className={cx('panel-buttons')}>
          <button className={cx('panel-button')}>{Parser(IconEdit)}</button>
          <button className={cx('panel-button')}>{Parser(IconDuplicate)}</button>
          <button className={cx('panel-button', 'filled')}>{Parser(IconDelete)}</button>
        </div>
      </div>
    );
  }
}
