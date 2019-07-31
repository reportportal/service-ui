import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Attachments } from 'pages/inside/logsPage/logItemInfo/logItemInfoTabs/attachments';
import { LOG_VIEW } from 'controllers/testItem';
import { InfoPanel } from 'pages/inside/common/infoPanel';
import { SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
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

  state = {
    isMobileView: false,
  };

  componentDidMount() {
    this.match = window.matchMedia(SCREEN_XS_MAX);
    this.match.addListener(this.setMobileView);
    this.setMobileView(this.match);
  }

  componentWillUnmount() {
    this.match.removeListener(this.setMobileView);
  }

  setMobileView = (media) =>
    media.matches !== this.state.isMobileView &&
    this.setState({
      isMobileView: media.matches,
    });

  render() {
    const { parentItem } = this.props;
    const { isMobileView } = this.state;

    return (
      <Fragment>
        <InfoPanel viewMode={LOG_VIEW} data={parentItem} />
        <Attachments isMobileView={isMobileView} />
        <hr className={cx('separator')} />
      </Fragment>
    );
  }
}
