import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { BigButton } from 'components/buttons/bigButton';
import { GhostButton } from 'components/buttons/ghostButton';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import LeftArrowIcon from 'common/img/arrow-left-inline.svg';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import { WidgetTypeSelector } from './widgetTypeSelector';
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
    widgets: PropTypes.array,
    activeWidgetId: PropTypes.string,
    onPrevStep: PropTypes.func,
    onNextStep: PropTypes.func,
    onAddWidget: PropTypes.func,
    onChangeWidgetType: PropTypes.func,
  };
  static defaultProps = {
    widgets: [],
    activeWidgetId: '',
    step: 0,
    onPrevStep: () => {},
    onNextStep: () => {},
    onAddWidget: () => {},
    onChangeWidgetType: () => {},
  };

  state = {
    hasErrors: false,
  };

  getControlsByStep = (step) => {
    const { activeWidgetId, widgets } = this.props;
    switch (step) {
      case 1:
        return '2';
      case 2:
        return '3';
      default:
        return (
          <WidgetTypeSelector
            activeWidgetId={activeWidgetId}
            widgets={widgets}
            hasErrors={this.state.hasErrors}
            onChange={this.handleChangeWidgetType}
          />
        );
    }
  };

  handleChangeWidgetType = (e) => {
    this.state.hasErrors && this.setState({ hasErrors: false });
    this.props.onChangeWidgetType(e);
  };

  handleNextClick = () => {
    if (this.props.step === 0 && !this.props.activeWidgetId) {
      this.setState({ hasErrors: true });
      return;
    }
    this.props.onNextStep();
  };

  render() {
    const { intl, step, onPrevStep, onAddWidget } = this.props;
    return (
      <div className={cx('wizard-controls-section')}>
        <div className={cx('controls-wrapper')}>{this.getControlsByStep(step)}</div>
        <div className={cx('buttons-block')}>
          {step !== 0 && (
            <div className={cx('button')}>
              <GhostButton icon={LeftArrowIcon} onClick={onPrevStep}>
                {Parser(intl.formatMessage(messages.prevStepButton))}
              </GhostButton>
            </div>
          )}
          {step !== 2 ? (
            <div className={cx('button')}>
              <GhostButton icon={RightArrowIcon} onClick={this.handleNextClick} iconAtRight>
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
