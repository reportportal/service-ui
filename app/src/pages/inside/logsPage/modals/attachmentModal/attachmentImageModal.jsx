import { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { injectIntl, intlShape } from 'react-intl';
import RotateImage from 'common/img/rotate-inline.svg';
import { ModalLayout, withModal } from 'components/main/modal';
import classNames from 'classnames/bind';

import { messages } from './messages';
import styles from './attachmentModal.scss';

const cx = classNames.bind(styles);

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

  renderCustomButton = () => (
    <div onClick={this.rotateImageHandler} left="true" className={cx('attachment-image-rotate')}>
      <span className={cx('icon')}>{Parser(RotateImage)}</span>
      <span className={cx('text')}>{this.props.intl.formatMessage(messages.rotate)}</span>
    </div>
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
        customButton={this.renderCustomButton(intl, messages)}
      >
        <div>
          <img style={style} id="attachment-image" alt="attachment" src={image} />
        </div>
      </ModalLayout>
    );
  };
}
