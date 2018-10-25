import { connect } from 'react-redux';
import {
  attachmentsSelector,
  openImageModalAction,
  openHarModalAction,
  openBinaryModalAction,
} from 'controllers/attachments';
import { activeProjectSelector } from 'controllers/user';

import { Attachments } from './attachments';

const mapStateToProps = (state) => ({
  attachments: attachmentsSelector(state),
  projectId: activeProjectSelector(state),
});

const mapDispatchToProps = {
  openImageModal: openImageModalAction,
  openHarModal: openHarModalAction,
  openBinaryModal: openBinaryModalAction,
};

export const AttachmentsContainer = connect(mapStateToProps, mapDispatchToProps)(Attachments);
