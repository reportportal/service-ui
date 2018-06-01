import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import styles from './formControls.scss';
import IconDelete from './img/icon-delete-inline.svg';
import IconEdit from './img/icon-pencil-inline.svg';
import IconTick from './img/ic-check-inline.svg';

const cx = classNames.bind(styles);
const messages = defineMessages({
  controlPanelName: {
    id: 'ControlPanel.controlPanelName',
    defaultMessage: 'Rule',
  },
});

@injectIntl
export class FormControls extends Component {
  static propTypes = {
    index: PropTypes.number,
    id: PropTypes.string,
    intl: intlShape.isRequired,
    onDelete: PropTypes.func,
    editMode: PropTypes.bool,
    toggleEditMode: PropTypes.func,
    onSubmit: PropTypes.func,
    submitted: PropTypes.bool,
    configurable: PropTypes.bool,
    deletable: PropTypes.bool,
  };
  static defaultProps = {
    index: 0,
    id: '',
    onDelete: () => {},
    editMode: false,
    toggleEditMode: () => {},
    onSubmit: () => {},
    submitted: false,
    configurable: false,
    deletable: false,
  };
  onDelete = () => {
    const { onDelete, id, index, submitted } = this.props;
    onDelete({ id, index, submitted });
  };
  toggleEditMode = () => {
    const { id, toggleEditMode } = this.props;
    toggleEditMode(id);
  };
  editDoneClickHandler = () => {
    const { onSubmit } = this.props;
    this.toggleEditMode();
    onSubmit();
  };
  render() {
    const { index, intl, editMode, configurable, deletable } = this.props;
    return (
      <div className={cx('control-panel')}>
        <span className={cx('control-panel-name')}>
          {intl.formatMessage(messages.controlPanelName)} {index}
        </span>
        {!configurable && (
          <div className={cx('control-panel-buttons')}>
            {editMode ? (
              <button className={cx('control-panel-button')} onClick={this.editDoneClickHandler}>
                {Parser(IconTick)}
              </button>
            ) : (
              <button className={cx('control-panel-button')} onClick={this.toggleEditMode}>
                {Parser(IconEdit)}
              </button>
            )}
            {deletable && (
              <button className={cx('control-panel-button')} onClick={this.onDelete}>
                {Parser(IconDelete)}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
}
