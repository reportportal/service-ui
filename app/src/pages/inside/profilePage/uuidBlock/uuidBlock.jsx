import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import classNames from 'classnames/bind';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { userTokenSelector, generateApiTokenAction } from 'controllers/user';
import { Input } from 'components/inputs/input/input';
import { GhostButton } from 'components/buttons/ghostButton';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ButtonWithTooltip } from './buttonWithTooltip';
import styles from './uuidBlock.scss';
import { BlockContainerHeader, BlockContainerBody } from '../blockContainer';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'UuidBlock.header',
    defaultMessage: 'Universally unique identifier',
  },
  regenerate: {
    id: 'UuidBlock.regenerate',
    defaultMessage: 'Regenerate',
  },
  text: {
    id: 'UuidBlock.text',
    defaultMessage:
      'In order to provide security for your own domain password, you can use a user token, named UUID - to verify your account to be able to log with agent.',
  },
  regenerateSuccess: {
    id: 'UuidBlock.regenerateSuccess',
    defaultMessage: 'Changes have been saved successfully',
  },
  regenerateError: {
    id: 'UuidBlock.submitError',
    defaultMessage: "Error! Can't regenerate UUID",
  },
});

@connect(
  (state) => ({
    token: userTokenSelector(state),
  }),
  { showNotification, showModalAction, generateApiTokenAction },
)
@injectIntl
export class UuidBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showModalAction: PropTypes.func.isRequired,
    generateApiTokenAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    token: PropTypes.string,
  };
  static defaultProps = {
    token: '',
  };
  onGenerate = () =>
    this.props.showModalAction({
      id: 'regenerateUuidModal',
      data: { onRegenerate: this.regenerateHandler },
    });
  setupRef = (node) => {
    this.inputLink = node;
  };
  selectUuid = () => {
    this.inputLink.select();
  };
  regenerateHandler = () => {
    this.props
      .generateApiTokenAction()
      .then(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.regenerateSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch(() => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.regenerateError),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  render = () => {
    const { intl } = this.props;
    return (
      <div className={cx('uuid-block')}>
        <BlockContainerHeader>
          <span className={cx('header-label')}>{intl.formatMessage(messages.header)}</span>
        </BlockContainerHeader>
        <BlockContainerBody>
          <div className={cx('body-wrapper')}>
            <div className={cx('field-wrapper')}>
              <span className={cx('label')}>UUID</span>
              <div className={cx('regenerate-btn')}>
                <ButtonWithTooltip>
                  <GhostButton onClick={this.onGenerate}>
                    {intl.formatMessage(messages.regenerate)}
                  </GhostButton>
                </ButtonWithTooltip>
              </div>
              <div className={cx('field')}>
                <Input
                  readonly
                  value={this.props.token}
                  refFunction={this.setupRef}
                  onFocus={this.selectUuid}
                />
              </div>
            </div>
            <p className={cx('tip')}>{intl.formatMessage(messages.text)}</p>
          </div>
        </BlockContainerBody>
      </div>
    );
  };
}
