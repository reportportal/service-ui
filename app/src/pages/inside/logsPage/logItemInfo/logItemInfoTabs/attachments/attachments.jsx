import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.css';
import { connect } from 'react-redux';
import { attachmentsSelector, openAttachmentAction } from 'controllers/attachments';
import { NoItemMessage } from 'components/main/noItemMessage';
import { messages } from './modals/messages';
import styles from './attachments.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    attachments: attachmentsSelector(state),
  }),
  {
    openAttachmentAction,
  },
)
@injectIntl
export class Attachments extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    attachments: PropTypes.array.isRequired,
    openAttachmentAction: PropTypes.func,
  };

  static defaultProps = {
    openAttachmentAction: () => {},
  };

  state = {
    mainAreaVisible: false,
  };

  onClickItem = (itemIndex) => this.props.openAttachmentAction(this.props.attachments[itemIndex]);

  onClickThumb = () => {
    if (!this.state.mainAreaVisible) {
      this.setState({ mainAreaVisible: true });
    }
  };

  isOneAttachmentItem = () => this.props.attachments.length === 1 && this.state.mainAreaVisible;

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('attachments-wrap')}>
        <div className={cx('log-attachments', { 'hide-main-area': !this.state.mainAreaVisible })}>
          {this.props.attachments.length ? (
            <div onClick={this.isOneAttachmentItem() ? () => this.onClickItem(0) : undefined}>
              <Carousel
                emulateTouch
                showStatus={false}
                showIndicators={false}
                showArrows
                onClickThumb={this.onClickThumb}
                onClickItem={this.onClickItem}
              >
                {this.props.attachments.map((attachment) => (
                  <div key={attachment.id} className={cx('preview-container')}>
                    <img src={attachment.src} alt={attachment.alt} />
                  </div>
                ))}
              </Carousel>
            </div>
          ) : (
            <NoItemMessage message={intl.formatMessage(messages.noAttachmentsMessage)} />
          )}
        </div>
      </div>
    );
  }
}
