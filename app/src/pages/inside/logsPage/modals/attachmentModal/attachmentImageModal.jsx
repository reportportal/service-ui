import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { messages } from './messages';
import rotateImage from './img/rotate-left-icon.svg';
import styles from './attachmentImageModal.scss';

const cx = classNames.bind(styles);
const classes = cx('toleft', null, {});

@withModal('attachmentImageModal')
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

  rotateImageHandler = () => {
    const rotationA = this.state.rotationAmount;
    this.setState({
      rotationAmount: rotationA - 90,
    });
  };

  generateRotationCommand = (amount) => `rotate(${amount}deg)`;

  customButton = (intl) => (
    <input
      type="image"
      alt="rotate image"
      className={classes}
      src={rotateImage}
      text={intl.formatMessage(messages.close)}
      onClick={this.rotateImageHandler}
    />
  );

  renderOkButton = (intl) => ({
    text: intl.formatMessage(messages.close),
    onClick: (closeModal) => closeModal(),
  });

  render = () => {
    const {
      intl,
      data: { image },
    } = this.props;
    const command = this.generateRotationCommand(this.state.rotationAmount);
    const style = { transform: command };

    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        okButton={this.renderOkButton(intl, messages)}
        customButton={this.customButton(intl, messages)}
      >
        <div>
          <img style={style} id="attachment-image" alt="attachment" src={image} />
        </div>
      </ModalLayout>
    );
  };
}
