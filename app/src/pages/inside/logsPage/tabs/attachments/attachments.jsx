// @ts-check
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Carousel } from 'react-responsive-carousel';
import { connect } from 'react-redux';
import { getIcon } from 'common/img/launch/attachments';
import { attachmentsSelector } from 'controllers/attachments';
import 'react-responsive-carousel/lib/styles/carousel.css';
import styles from './attachments.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  logItems: attachmentsSelector(state),
}))
export default class Attachments extends React.Component {
  static defaultProps = {
    // TODO: throw actions instead and
    onClickItem: (selectedItem) => console.log('onclick', selectedItem),
  };
  static propTypes = {
    onClickItem: PropTypes.func,
    logItems: PropTypes.array.isRequired,
  };

  state = {
    attachments: (this.props.logItems || []).map((attachment) => ({
      id: attachment.id,
      src: getIcon(attachment.content_type),
      alt: attachment.content_type,
    })),
    mainAreaVisible: false,
  };

  onClickItem(itemIndex) {
    const selectedItem = this.state.attachments[itemIndex];
    this.props.onClickItem(selectedItem);
  }

  onClickThumb() {
    if (!this.state.mainAreaVisible) {
      this.setState({ mainAreaVisible: true });
    }
  }

  render = () => (
    <div
      className={cx({
        logAttachments: true,
        hideMainArea: !this.state.mainAreaVisible,
      })}
    >
      <Carousel
        emulateTouch
        showStatus={false}
        showIndicators={false}
        showArrows
        onClickThumb={() => this.onClickThumb()}
        onClickItem={(itemIndex) => this.onClickItem(itemIndex)}
      >
        {this.state.attachments.map((attachment) => (
          <div key={attachment.id} className={cx({ preview: true })}>
            <img className={cx({ preview: true })} src={attachment.src} alt={attachment.alt} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
