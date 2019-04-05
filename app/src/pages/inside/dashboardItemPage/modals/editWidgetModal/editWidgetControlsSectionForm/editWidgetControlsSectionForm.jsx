import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { reduxForm, initialize } from 'redux-form';
import PropTypes from 'prop-types';
import { BigButton } from 'components/buttons/bigButton';
import { FORM_APPEARANCE_MODE_LOCKED } from '../../common/widgetControls/controls/filtersControl/common/constants';
import { CommonWidgetControls } from '../../common/widgetControls';
import { WIDGET_WIZARD_FORM } from '../../common/constants';
import styles from './editWidgetControlsSectionForm.scss';

const cx = classNames.bind(styles);

@reduxForm({
  form: WIDGET_WIZARD_FORM,
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate: ({ filters }) => ({
    filters: (!filters || !filters.length) && 'error',
  }),
})
@connect(null, {
  initializeWidgetControls: (data) =>
    initialize(WIDGET_WIZARD_FORM, data, true, { keepValues: true }),
})
export class EditWidgetControlsSectionForm extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    initializeWidgetControls: PropTypes.func.isRequired,
    widgetSettings: PropTypes.object.isRequired,
    previousFilter: PropTypes.array,
    formAppearance: PropTypes.object.isRequired,
    handleFormAppearanceChange: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    buttonsMessages: PropTypes.object,
  };

  static defaultProps = {
    previousFilter: [],
    buttonsMessages: {},
  };

  onClickCancel = () => {
    this.props.handleFormAppearanceChange(FORM_APPEARANCE_MODE_LOCKED, {});
    this.props.change('filters', this.props.previousFilter);
  };

  onClickSubmit = () => this.props.handleFormAppearanceChange(FORM_APPEARANCE_MODE_LOCKED, {});

  render() {
    const {
      widget,
      initializeWidgetControls,
      widgetSettings,
      formAppearance,
      handleFormAppearanceChange,
      buttonsMessages,
    } = this.props;
    const ControlsForm = widget.controls;

    return (
      <form className={cx('edit-widget-controls-section-form')}>
        <ControlsForm
          widgetType={widget.id}
          formAppearance={formAppearance}
          onFormAppearanceChange={handleFormAppearanceChange}
          initializeControlsForm={initializeWidgetControls}
          widgetSettings={widgetSettings}
        />
        {!formAppearance.isMainControlsLocked && (
          <div className={cx('common-controls-wrapper')}>
            <CommonWidgetControls />
          </div>
        )}
        {formAppearance.isMainControlsLocked &&
          !formAppearance.mode && (
            <div className={cx('buttons-block')}>
              <BigButton
                className={cx('button-inline')}
                color={'gray-60'}
                onClick={this.onClickCancel}
              >
                {buttonsMessages.cancel}
              </BigButton>
              <BigButton className={cx('button-inline')} onClick={this.onClickSubmit}>
                {buttonsMessages.submit}
              </BigButton>
            </div>
          )}
      </form>
    );
  }
}
