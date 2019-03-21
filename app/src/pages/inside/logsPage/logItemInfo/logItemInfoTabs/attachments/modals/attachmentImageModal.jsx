import { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import RotateImage from 'common/img/rotate-inline.svg';
import { ModalLayout, withModal } from 'components/main/modal';
import { ATTACHMENT_IMAGE_MODAL_ID } from 'controllers/log/attachments';
import { messages } from './messages';
import styles from './attachmentImageModal.scss';

const cx = classNames.bind(styles);

@withModal(ATTACHMENT_IMAGE_MODAL_ID)
@injectIntl
export class AttachmentImageModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      image: PropTypes.string,
    }).isRequired,
    intl: intlShape.isRequired,
  };

  state = {
    rotationAmount: 0,
  };

  getImageSize = () =>
    this.imageRef && this.imageRef.current
      ? {
          height: this.imageRef.current.clientHeight,
          width: this.imageRef.current.clientWidth,
        }
      : null;

  getRotatedImageSize = () => {
    const { rotationAmount } = this.state;
    this.initNativeImageSize();
    const wrapperStyle = {};

    if (this.nativeImageSize) {
      wrapperStyle.height =
        (rotationAmount / 90) % 2 === 1
          ? `${this.nativeImageSize.width}px`
          : `${this.nativeImageSize.height}px`;
      if (this.nativeImageSize.width < this.nativeImageSize.height) {
        wrapperStyle.width =
          (rotationAmount / 90) % 2 === 1
            ? `${this.nativeImageSize.height}px`
            : `${this.nativeImageSize.width}px`;
      }
    }
    return wrapperStyle;
  };

  initNativeImageSize = () => {
    if (!this.nativeImageSize) {
      this.nativeImageSize = this.getImageSize();
    }
  };

  generateRotationCommand = (amount) => `rotate(${amount}deg)`;

  rotateImageHandler = () => {
    const rotationA = this.state.rotationAmount;
    this.setState({
      rotationAmount: rotationA + 90,
    });
  };

  imageRef = React.createRef();

  renderCustomButton = () => (
    <div className={cx('rotate-button')} onClick={this.rotateImageHandler}>
      <span className={cx('icon')}>{Parser(RotateImage)}</span>
      <span className={cx('text')}>{this.props.intl.formatMessage(messages.rotate)}</span>
    </div>
  );

  renderCancelButton = () => ({
    text: this.props.intl.formatMessage(messages.close),
    onClick: (closeModal) => closeModal(),
  });

  render() {
    const {
      intl: { formatMessage },
      data: { image },
    } = this.props;
    const { rotationAmount } = this.state;
    const imageStyle = { transform: this.generateRotationCommand(rotationAmount) };
    const wrapperStyle = this.getRotatedImageSize();

    return (
      <ModalLayout
        title={formatMessage(messages.title)}
        cancelButton={this.renderCancelButton()}
        customButton={this.renderCustomButton()}
        className={cx('attachment-image-modal')}
      >
        <div className={cx('attachment-modal-content-wrapper')}>
          <div className={cx('attachment-image-wrapper')} style={wrapperStyle}>
            <a href={image} target="_blank" className={cx('attachment-image')}>
              <img
                ref={this.imageRef}
                className={cx('image-item')}
                style={imageStyle}
                alt="attachment"
                src={image}
              />
            </a>
          </div>
        </div>
      </ModalLayout>
    );
  }
}
