// TODO: THIS IS DEMONSTRATION FILE. REMOVE AFTER REAL IMPLEMENTATIONS WILL EXIST.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MarkdownEditor } from 'components/main/markdown';
import { withModal, ModalLayout } from 'components/main/modal';

@withModal('exampleModal')
export class ExampleModal extends Component {
  static propTypes = {
    data: PropTypes.object,
  };
  static defaultProps = {
    data: null,
  };
  okClickHandler = (closeModal) => {
    setTimeout(() => closeModal(), 1000);
  };
  render() {
    return (
      <ModalLayout
        title={'example-modal'}
        okButton={{
          text: 'Launch',
          danger: true,
          onClick: this.okClickHandler,
        }}
        cancelButton={{
          text: 'Nope',
        }}
        warningMessage="After pushing 'launch' button nuclear rockets will be launched"
      >
        <MarkdownEditor />
        <div>
          param1: {this.props.data.param1}
          <br />
          param2: {this.props.data.param2}
        </div>
      </ModalLayout>
    );
  }
}
