// TODO: THIS IS DEMONSTRATION FILE. REMOVE AFTER REAL IMPLEMENTATIONS WILL EXIST.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { hideModalAction } from 'controllers/modal';
import { MarkdownEditor } from 'components/main/markdown';
import { connect } from 'react-redux';
import { withModal, ModalLayout } from 'components/main/modal';

@withModal('dashboardModal')
@connect(null, {
  hideModalAction,
})
export class DashboardModal extends Component {
  static propTypes = {
    hideModalAction: PropTypes.func.isRequired,
  };
  static defaultProps = {
    hideModalAction: () => {},
  };
  render() {
    return (
      <ModalLayout
        title={'dashboard-modal'}
        hasCancel
        hasOk
        dangerButton
        cancelText="Nope"
        okText="Launch"
        warningMessage={'After pushing \'launch\' button nuclear rockets will be launched'}
      >
        <MarkdownEditor />
      </ModalLayout>
    );
  }
}
