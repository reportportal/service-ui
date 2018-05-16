import React from 'react';
import PropTypes from 'prop-types';
import { UploadStatusIndicator } from './uploadStatusIndicator';
import { DefaultIcon } from './defaultIcon';

export const UploadIndicator = ({ uploaded, uploadedFailed, uploadedFailedReason }) =>
  uploaded ? (
    <UploadStatusIndicator
      uploadedFailed={uploadedFailed}
      uploadedFailedReason={uploadedFailedReason}
    />
  ) : (
    <DefaultIcon />
  );

UploadIndicator.propTypes = {
  uploaded: PropTypes.bool,
  uploadedFailed: PropTypes.bool,
  uploadedFailedReason: PropTypes.object,
};
UploadIndicator.defaultProps = {
  uploaded: false,
  uploadedFailed: false,
  uploadedFailedReason: {},
};
