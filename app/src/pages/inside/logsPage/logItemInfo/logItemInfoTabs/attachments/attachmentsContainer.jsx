import { connect } from 'react-redux';
import {
  attachmentsSelector,
  openImageModal,
  openHarModal,
  openBinaryModal,
} from 'controllers/attachments';
import { activeProjectSelector } from 'controllers/user';

import { Attachments } from './attachments';

const mapStateToProps = (state) => ({
  attachments: attachmentsSelector(state),
  projectId: activeProjectSelector(state),
});

const mapDispatchToProps = {
  openImageModal,
  openHarModal,
  openBinaryModal,
};

export const AttachmentsContainer = connect(mapStateToProps, mapDispatchToProps)(Attachments);
