import React from 'react';
import PropTypes from 'prop-types';
import { UploadStatusIndicator } from './uploadStatusIndicator';
import { DefaultIcon } from './defaultIcon';

export const UploadIndicator = ({ uploaded, uploadFailed, uploadFailReason, fileType }) =>
  uploaded ? (
    <UploadStatusIndicator
      uploadFailed={uploadFailed}
      uploadFailReason={uploadFailReason}
      fileType={fileType}
    />
  ) : (
    <DefaultIcon fileType={fileType} />
  );

UploadIndicator.propTypes = {
  uploaded: PropTypes.bool,
  uploadFailed: PropTypes.bool,
  uploadFailReason: PropTypes.object,
  fileType: PropTypes.string,
};
UploadIndicator.defaultProps = {
  uploaded: false,
  uploadFailed: false,
  uploadFailReason: {},
  fileType: '',
};
