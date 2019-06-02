import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import IconEdit from 'common/img/pencil-empty-inline.svg';
import IconDuplicate from 'common/img/duplicate-inline.svg';
import IconDelete from 'common/img/trashcan-inline.svg';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { addPatternAction, updatePatternAction, deletePatternAction } from 'controllers/project';
import { showModalAction } from 'controllers/modal';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import classNames from 'classnames/bind';
import styles from './patternControlPanel.scss';

const COPY_POSTFIX = '_copy';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  deleteModalHeader: {
    id: 'PatternAnalysis.deleteModalHeader',
    defaultMessage: 'Delete Pattern Rule',
  },
  deleteModalContent: {
    id: 'PatternAnalysis.deleteModalContent',
    defaultMessage: 'Are you sure you want to delete pattern rule {name}?',
  },
  clonePatternMessage: {
    id: 'PatternAnalysis.clonePatternMessage',
    defaultMessage: 'Clone pattern rule',
  },
});

@connect(null, {
  addPattern: addPatternAction,
  updatePattern: updatePatternAction,
  deletePattern: deletePatternAction,
  showModal: showModalAction,
})
@injectIntl
export class PatternControlPanel extends Component {
  static propTypes = {
    pattern: PropTypes.object,
    id: PropTypes.number,
    addPattern: PropTypes.func.isRequired,
    updatePattern: PropTypes.func.isRequired,
    deletePattern: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    pattern: {},
    id: 0,
  };

  onRenamePattern = () => {
    const { showModal, updatePattern, pattern } = this.props;
    showModal({
      id: 'renamePatternModal',
      data: {
        onSave: updatePattern,
        pattern,
      },
    });
  };

  onClonePattern = () => {
    const { intl, showModal, addPattern, pattern } = this.props;
    const newPattern = {
      ...pattern,
      name: pattern.name + COPY_POSTFIX,
    };
    delete newPattern.id;
    showModal({
      id: 'createPatternModal',
      data: {
        onSave: addPattern,
        pattern: newPattern,
        modalTitle: intl.formatMessage(messages.clonePatternMessage),
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

  onDeletePattern = () => {
    this.props.deletePattern(this.props.pattern);
  };

  showDeleteConfirmationDialog = () => {
    const { pattern, showModal, intl } = this.props;
    showModal({
      id: 'deleteItemsModal',
      data: {
        onConfirm: this.onDeletePattern,
        header: intl.formatMessage(messages.deleteModalHeader),
        mainContent: intl.formatMessage(messages.deleteModalContent, {
          name: `'<b>${pattern.name}</b>'`,
        }),
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_DELETE_PATTERN_MODAL,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_BTN_DELETE_PATTERN_MODAL,
          deleteBtn: SETTINGS_PAGE_EVENTS.DELETE_BTN_DELETE_PATTERN_MODAL,
        },
      },
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
          <button className={cx('panel-button')} onClick={this.onRenamePattern}>
            {Parser(IconEdit)}
          </button>
          <button className={cx('panel-button')} onClick={this.onClonePattern}>
            {Parser(IconDuplicate)}
          </button>
          <button
            className={cx('panel-button', 'filled')}
            onClick={this.showDeleteConfirmationDialog}
          >
            {Parser(IconDelete)}
          </button>
        </div>
      </div>
    );
  }
}
