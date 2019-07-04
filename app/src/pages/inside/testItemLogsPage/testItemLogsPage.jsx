import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { Attachments } from 'pages/inside/logsPage/logItemInfo/logItemInfoTabs/attachments';
import {
  testItemAttachmentItemsSelector,
  testItemAttachmentsLoadingSelector,
  testItemAttachmentsPaginationSelector,
  fetchTestItemAttachmentsAction,
} from 'controllers/testItem/log';
import { openAttachmentAction } from 'controllers/attachments';
import { TestItemLogsGrid } from './testItemLogsGrid';
import styles from './testItemLogsPage.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    attachments: testItemAttachmentItemsSelector(state),
    attachmentsLoading: testItemAttachmentsLoadingSelector(state),
    attachmentsPagination: testItemAttachmentsPaginationSelector(state),
  }),
  {
    fetchTestItemAttachments: fetchTestItemAttachmentsAction,
    openAttachment: openAttachmentAction,
  },
)
export class TestItemLogsPage extends Component {
  static propTypes = {
    attachments: PropTypes.array,
    attachmentsLoading: PropTypes.bool,
    attachmentsPagination: PropTypes.object,
    openAttachment: PropTypes.func,
    fetchTestItemAttachments: PropTypes.func,
  };

  static defaultProps = {
    attachments: [],
    attachmentsLoading: false,
    attachmentsPagination: {},
    openAttachment: () => {},
    fetchTestItemAttachments: () => {},
  };

  static getDerivedStateFromProps(props) {
    return props.loading
      ? {
          activeAttachmentId: null,
        }
      : null;
  }

  state = {
    activeAttachmentId: null,
  };

  changeActiveAttachment = (activeAttachmentId) =>
    this.setState({
      activeAttachmentId,
    });

  render() {
    const {
      attachments,
      attachmentsLoading,
      attachmentsPagination,
      openAttachment,
      fetchTestItemAttachments,
    } = this.props;

    return (
      <Fragment>
        <Attachments
          activeItemId={this.state.activeAttachmentId}
          onChangeActiveItem={this.changeActiveAttachment}
          attachments={attachments}
          loading={attachmentsLoading}
          pagination={attachmentsPagination}
          openAttachmentAction={openAttachment}
          fetchAttachmentsConcatAction={fetchTestItemAttachments}
        />
        <hr className={cx('separator')} />
        <TestItemLogsGrid />
      </Fragment>
    );
  }
}
