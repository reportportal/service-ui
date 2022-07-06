import React from 'react';
import PropTypes from 'prop-types';
import { ModalLayout } from '../../../../../componentLibrary/modal';
import { ServiceVersionsBlockWithTooltip } from './serviceVersionsBlock';
import { isMobileDevice } from './serviceVersionsBlockWithData';

export const ServiceVersionsBlockModal = ({ services, hideModal }) => {
  return (
    isMobileDevice && (
      <ModalLayout
        onClose={hideModal}
        overlay
        okButton={{
          text: 'Close',
          customClassName: 'organish',
          onClick: hideModal,
        }}
        className={'modal-window-mobile'}
      >
        <ServiceVersionsBlockWithTooltip services={services} cssClass={'tooltip-modal'} />
      </ModalLayout>
    )
  );
};
ServiceVersionsBlockModal.propTypes = {
  services: PropTypes.object.isRequired,
  hideModal: PropTypes.func,
};
ServiceVersionsBlockModal.defaultProps = {
  services: {},
  closeModal: () => {},
};
