import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { BigButton } from 'components/buttons/bigButton';
import { GhostButton } from 'components/buttons/ghostButton';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { submit } from 'redux-form';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import RightArrowIcon from 'common/img/arrow-right-small-inline.svg';
import { WIDGET_WIZARD_FORM } from './constants';
import { WizardFirstStepForm } from './wizardFirstStepForm';
import { WizardSecondStepForm } from './wizardSecondStepForm';
import { WizardThirdStepForm } from './wizardThirdStepForm';
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
@connect(
  null,
  {
    submitWizardThirdStepForm: () => submit(WIDGET_WIZARD_FORM),
  },
)
export class WizardControlsSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    submitWizardThirdStepForm: PropTypes.func.isRequired,
    step: PropTypes.number,
    widgets: PropTypes.array,
    activeWidgetId: PropTypes.string,
    onClickPrevStep: PropTypes.func,
    onClickNextStep: PropTypes.func,
    nextStep: PropTypes.func,
    onAddWidget: PropTypes.func,
    onChangeWidgetType: PropTypes.func,
  };
  static defaultProps = {
    widgets: [],
    activeWidgetId: '',
    step: 0,
    onClickPrevStep: () => {},
    onClickNextStep: () => {},
    nextStep: () => {},
    onAddWidget: () => {},
    onChangeWidgetType: () => {},
  };

  getControlsByStep = (step) => {
    const { activeWidgetId, widgets } = this.props;
    switch (step) {
      case 1:
        return <WizardSecondStepForm onSubmit={this.props.nextStep} />;
      case 2:
        return (
          <WizardThirdStepForm
            widgetTitle={widgets.find((widget) => widget.id === activeWidgetId).title}
            onSubmit={this.props.onAddWidget}
          />
        );
      default:
        return <WizardFirstStepForm widgets={widgets} onSubmit={this.props.nextStep} />;
    }
  };

  handleAddWidget = () => {
    this.props.submitWizardThirdStepForm();
  };

  render() {
    const { intl, step, onClickPrevStep, onClickNextStep } = this.props;
    return (
      <div className={cx('wizard-controls-section')}>
        <div className={cx('controls-wrapper')}>{this.getControlsByStep(step)}</div>
        <div className={cx('buttons-block')}>
          {step !== 0 && (
            <div className={cx('button')}>
              <GhostButton icon={LeftArrowIcon} onClick={onClickPrevStep}>
                {Parser(intl.formatMessage(messages.prevStepButton))}
              </GhostButton>
            </div>
          )}
          {step !== 2 ? (
            <div className={cx('button')}>
              <GhostButton icon={RightArrowIcon} onClick={onClickNextStep} iconAtRight>
                {Parser(intl.formatMessage(messages.nextStepButton))}
              </GhostButton>
            </div>
          ) : (
            <div className={cx('button')}>
              <BigButton color={'booger'} onClick={this.handleAddWidget}>
                {Parser(intl.formatMessage(messages.addWidgetButton))}
              </BigButton>
            </div>
          )}
        </div>
      </div>
    );
  }
}
