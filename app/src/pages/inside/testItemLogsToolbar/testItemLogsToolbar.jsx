import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Attachments } from 'pages/inside/logsPage/logItemInfo/logItemInfoTabs/attachments';
import { LOG_VIEW } from 'controllers/testItem';
import { InfoPanel } from 'pages/inside/common/infoPanel';
import styles from './testItemLogsToolbar.scss';

const cx = classNames.bind(styles);
export class TestItemLogsToolbar extends Component {
  static propTypes = {
    parentItem: PropTypes.object,
  };

  static defaultProps = {
    attachments: [],
    attachmentsLoading: false,
    attachmentsPagination: {},
    parentItem: {},
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
    const { parentItem } = this.props;

    return (
      <Fragment>
        <InfoPanel viewMode={LOG_VIEW} data={parentItem} />
        <Attachments
          activeItemId={this.state.activeAttachmentId}
          onChangeActiveItem={this.changeActiveAttachment}
        />
        <hr className={cx('separator')} />
      </Fragment>
    );
  }
}
