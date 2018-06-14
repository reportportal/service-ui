import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { BigButton } from 'components/buttons/bigButton';
import { GhostButton } from 'components/buttons/ghostButton';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './wizardControlsSection.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  prevStepButton: {
    id: 'WizardInfoSection.prevStepButton',
    defaultMessage: 'Previous step',
  },
  nextStepButton: {
    id: 'WizardInfoSection.nextStepButton',
    defaultMessage: 'Next step',
  },
  addWidgetButton: {
    id: 'WizardInfoSection.addWidgetButton',
    defaultMessage: 'Add',
  },
});

@injectIntl
export class WizardControlsSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    step: PropTypes.number,
    onPrevStep: PropTypes.func,
    onNextStep: PropTypes.func,
    onAddWidget: PropTypes.func,
  };
  static defaultProps = {
    step: 0,
    onPrevStep: () => {},
    onNextStep: () => {},
    onAddWidget: () => {},
  };

  getControlsByStep = (step) => {
    switch (step) {
      case 1:
        return '2';
      case 2:
        return '3';
      default:
        return '1';
    }
  };

  render() {
    const { intl, step, onPrevStep, onNextStep, onAddWidget } = this.props;
    return (
      <div className={cx('wizard-controls-section')}>
        <div className={cx('controls-wrapper')}>{this.getControlsByStep(step)}</div>
        <div className={cx('buttons-block')}>
          {step !== 0 && (
            <div className={cx('button')}>
              <GhostButton onClick={onPrevStep}>
                {Parser(intl.formatMessage(messages.prevStepButton))}
              </GhostButton>
            </div>
          )}
          {step !== 2 ? (
            <div className={cx('button')}>
              <GhostButton onClick={onNextStep}>
                {Parser(intl.formatMessage(messages.nextStepButton))}
              </GhostButton>
            </div>
          ) : (
            <div className={cx('button')}>
              <BigButton color={'booger'} onClick={onAddWidget}>
                {Parser(intl.formatMessage(messages.addWidgetButton))}
              </BigButton>
            </div>
          )}
        </div>
      </div>
    );
  }
}
