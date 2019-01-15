import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ModalLayout, withModal } from 'components/main/modal';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import styles from './deleteModal.scss';

const cx = classNames.bind(styles);

@withModal('defectTypeDeleteModal')
export class DeleteModal extends Component {
  static propTypes = {
    data: PropTypes.object,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const { message, onSubmit, title, submitText, cancelText, hideModalAction } = this.props.data;

    return (
      <ModalLayout
        title={title}
        okButton={{
          text: submitText,
          danger: true,
          onClick: (closeModal) => {
            closeModal();
            onSubmit();
          },
        }}
        cancelButton={{
          text: cancelText,
        }}
        hideModalAction={hideModalAction}
      >
        <p className={cx('message')}>{Parser(message)}</p>
      </ModalLayout>
    );
  }
}
