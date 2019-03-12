import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.css';
import { connect } from 'react-redux';
import {
  attachmentItemsSelector,
  attachmentsLoadingSelector,
  openAttachmentAction,
  fetchAttachmentsAction,
} from 'controllers/log/attachments';
import { NoItemMessage } from 'components/main/noItemMessage';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { messages } from './modals/messages';
import styles from './attachments.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    attachments: attachmentItemsSelector(state),
    loading: attachmentsLoadingSelector(state),
  }),
  {
    fetchAttachmentsAction,
    openAttachmentAction,
  },
)
@injectIntl
export class Attachments extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    attachments: PropTypes.array,
    activeItemId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    loading: PropTypes.bool,
    onChangeActiveItem: PropTypes.func,
    fetchAttachmentsAction: PropTypes.func,
    openAttachmentAction: PropTypes.func,
  };

  static defaultProps = {
    attachments: [],
    loading: false,
    activeItemId: null,
    onChangeActiveItem: () => {},
    fetchAttachmentsAction: () => {},
    openAttachmentAction: () => {},
  };

  state = {
    mainAreaVisible: this.props.activeItemId !== null,
  };

  componentDidMount() {
    !this.props.attachments.length && !this.props.loading && this.props.fetchAttachmentsAction();
  }

  onClickItem = (itemIndex) => this.props.openAttachmentAction(this.props.attachments[itemIndex]);

  changeHandler = (itemIndex) => {
    if (itemIndex !== this.props.activeItemId) {
      this.props.onChangeActiveItem(itemIndex);
    }
    if (!this.state.mainAreaVisible) {
      this.setState({ mainAreaVisible: true });
    }
  };

  isOneAttachmentItem = () => this.props.attachments.length === 1;

  renderAttachmentsContent = () => {
    const { intl, activeItemId, loading } = this.props;

    if (loading) {
      return <SpinningPreloader />;
    }

    if (!this.props.attachments.length) {
      return <NoItemMessage message={intl.formatMessage(messages.noAttachmentsMessage)} />;
    }

    return (
      <div
        onClick={
          this.isOneAttachmentItem() && this.state.mainAreaVisible
            ? () => this.onClickItem(0)
            : undefined
        }
      >
        <Carousel
          emulateTouch
          showStatus={false}
          showIndicators={false}
          showArrows
          selectedItem={activeItemId || 0}
          onChange={this.changeHandler}
          onClickThumb={this.isOneAttachmentItem() ? this.changeHandler : undefined}
          onClickItem={this.onClickItem}
        >
          {this.props.attachments.map((attachment) => (
            <div key={attachment.id} className={cx('preview-container')}>
              <img src={attachment.src} alt={attachment.alt} />
            </div>
          ))}
        </Carousel>
      </div>
    );
  };

  render() {
    return (
      <div className={cx('attachments-wrap')}>
        <div className={cx('log-attachments', { 'hide-main-area': !this.state.mainAreaVisible })}>
          {this.renderAttachmentsContent()}
        </div>
      </div>
    );
  }
}
