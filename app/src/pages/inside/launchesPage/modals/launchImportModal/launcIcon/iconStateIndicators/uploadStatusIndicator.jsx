import React from 'react';
import PropTypes from 'prop-types';
import { InvalidIcon } from './invalidIcon';
import { UploadedIcon } from './uploadedIcon';

export const UploadStatusIndicator = ({ uploadedFailed, uploadedFailedReason }) =>
  uploadedFailed ? (
    <InvalidIcon rejectMessage={uploadedFailedReason.error_description || ''} />
  ) : (
    <UploadedIcon />
  );
UploadStatusIndicator.propTypes = {
  uploadedFailed: PropTypes.bool,
  uploadedFailedReason: PropTypes.object,
};
UploadStatusIndicator.defaultProps = {
  uploadedFailed: false,
  uploadedFailedReason: {},
};
