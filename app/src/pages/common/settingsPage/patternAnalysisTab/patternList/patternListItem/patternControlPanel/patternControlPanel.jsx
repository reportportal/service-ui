import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import IconEdit from 'common/img/pencil-empty-inline.svg';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import IconDelete from 'common/img/trashcan-inline.svg';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { updatePatternAction } from 'controllers/project';
import { showModalAction } from 'controllers/modal';
import classNames from 'classnames/bind';
import styles from './patternControlPanel.scss';

const cx = classNames.bind(styles);

@connect(null, {
  updatePattern: updatePatternAction,
  showModal: showModalAction,
})
export class PatternControlPanel extends Component {
  static propTypes = {
    pattern: PropTypes.object,
    id: PropTypes.number,
    updatePattern: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
  };

  static defaultProps = {
    pattern: {},
    id: 0,
  };

  onEditPattern = () => {
    const { showModal, updatePattern, pattern } = this.props;
    showModal({
      id: 'createPatternModal',
      data: {
        onSave: updatePattern,
        pattern,
        isNewPattern: false,
      },
    });
  };

  onToggleActive = (enabled) => {
    const { updatePattern, pattern } = this.props;
    updatePattern({
      ...pattern,
      enabled,
    });
  };

  render() {
    const { id, pattern } = this.props;
    return (
      <div className={cx('pattern-control-panel')}>
        <span className={cx('pattern-number')}>{id + 1}</span>
        <span className={cx('switcher')}>
          <InputSwitcher value={pattern.enabled} onChange={this.onToggleActive} />
        </span>
        <span className={cx('pattern-name')}>{pattern.name}</span>
        <div className={cx('panel-buttons')}>
          <button className={cx('panel-button')} onClick={this.onEditPattern}>
            {Parser(IconEdit)}
          </button>
          <button className={cx('panel-button')}>{Parser(IconDuplicate)}</button>
          <button className={cx('panel-button', 'filled')}>{Parser(IconDelete)}</button>
        </div>
      </div>
    );
  }
}
