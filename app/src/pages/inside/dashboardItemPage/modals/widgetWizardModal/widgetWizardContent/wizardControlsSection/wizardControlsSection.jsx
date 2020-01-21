/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages } from 'react-intl';
import { BigButton } from 'components/buttons/bigButton';
import { GhostButton } from 'components/buttons/ghostButton';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import RightArrowIcon from 'common/img/arrow-right-small-inline.svg';
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
export class WizardControlsSection extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    submitWidgetWizardForm: PropTypes.func.isRequired,
    step: PropTypes.number,
    widgets: PropTypes.array,
    activeWidgetId: PropTypes.string,
    onClickPrevStep: PropTypes.func,
    onClickNextStep: PropTypes.func,
    nextStep: PropTypes.func,
    onAddWidget: PropTypes.func,
    eventsInfo: PropTypes.object,
  };
  static defaultProps = {
    widgets: [],
    activeWidgetId: '',
    step: 0,
    onClickPrevStep: () => {},
    onClickNextStep: () => {},
    nextStep: () => {},
    onAddWidget: () => {},
    eventsInfo: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      buttonsDisabled: false,
    };
  }

  getControlsByStep = (step) => {
    const { activeWidgetId, widgets } = this.props;
    switch (step) {
      case 1:
        return (
          <WizardSecondStepForm
            widget={widgets.find((widget) => widget.id === activeWidgetId)}
            onSubmit={this.props.nextStep}
            onDisableButtons={this.handleDisableButtons}
            eventsInfo={this.props.eventsInfo}
          />
        );
      case 2:
        return (
          <WizardThirdStepForm
            eventsInfo={this.props.eventsInfo}
            widgetTitle={widgets.find((widget) => widget.id === activeWidgetId).title}
            onSubmit={this.props.onAddWidget}
          />
        );
      default:
        return (
          <WizardFirstStepForm
            widgets={widgets}
            onSubmit={this.props.nextStep}
            eventsInfo={this.props.eventsInfo}
          />
        );
    }
  };

  handleDisableButtons = (buttonsDisabled) => {
    this.setState({ buttonsDisabled });
  };

  render() {
    const { intl, step, onClickPrevStep, onClickNextStep } = this.props;
    const { buttonsDisabled } = this.state;

    return (
      <div className={cx('wizard-controls-section')}>
        <div className={cx('controls-wrapper')}>{this.getControlsByStep(step)}</div>
        <div className={cx('buttons-block')}>
          {step !== 0 && (
            <div className={cx('button')}>
              <GhostButton
                icon={LeftArrowIcon}
                onClick={onClickPrevStep}
                disabled={buttonsDisabled}
              >
                {Parser(intl.formatMessage(messages.prevStepButton))}
              </GhostButton>
            </div>
          )}
          {step !== 2 ? (
            <div className={cx('button')}>
              <GhostButton
                icon={RightArrowIcon}
                onClick={onClickNextStep}
                iconAtRight
                disabled={buttonsDisabled}
              >
                {Parser(intl.formatMessage(messages.nextStepButton))}
              </GhostButton>
            </div>
          ) : (
            <div className={cx('button')}>
              <BigButton
                color={'booger'}
                onClick={this.props.submitWidgetWizardForm}
                disabled={buttonsDisabled}
              >
                {Parser(intl.formatMessage(messages.addWidgetButton))}
              </BigButton>
            </div>
          )}
        </div>
      </div>
    );
  }
}
