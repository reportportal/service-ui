import React from 'react';
import PropTypes from 'prop-types';
import { UploadStatusIndicator } from './uploadStatusIndicator';
import { DefaultIcon } from './defaultIcon';

export const UploadIndicator = ({ uploaded, uploadFailed, uploadFailReason }) =>
  uploaded ? (
    <UploadStatusIndicator uploadFailed={uploadFailed} uploadFailReason={uploadFailReason} />
  ) : (
    <DefaultIcon />
  );

UploadIndicator.propTypes = {
  uploaded: PropTypes.bool,
  uploadFailed: PropTypes.bool,
  uploadFailReason: PropTypes.object,
};
UploadIndicator.defaultProps = {
  uploaded: false,
  uploadFailed: false,
  uploadFailReason: {},
};
