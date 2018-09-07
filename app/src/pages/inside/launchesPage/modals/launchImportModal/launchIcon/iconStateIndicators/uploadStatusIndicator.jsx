import React from 'react';
import PropTypes from 'prop-types';
import { InvalidIcon } from './invalidIcon';
import { UploadedIcon } from './uploadedIcon';

export const UploadStatusIndicator = ({ uploadFailed, uploadFailReason }) =>
  uploadFailed ? (
    <InvalidIcon rejectMessage={uploadFailReason.error_description || ''} />
  ) : (
    <UploadedIcon />
  );
UploadStatusIndicator.propTypes = {
  uploadFailed: PropTypes.bool,
  uploadFailReason: PropTypes.object,
};
UploadStatusIndicator.defaultProps = {
  uploadFailed: false,
  uploadFailReason: {},
};
