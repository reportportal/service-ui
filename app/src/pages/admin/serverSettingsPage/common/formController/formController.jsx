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
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { fetch } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FormField } from 'components/fields/formField';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { BigButton } from 'components/buttons/bigButton';
import { InputBigSwitcher } from 'components/inputs/inputBigSwitcher';
import { SectionHeader } from 'components/main/sectionHeader';
import { ENABLED_KEY } from '../constants';
import styles from './formController.scss';

const cx = classNames.bind(styles);

@connect(null, {
  showNotification,
})
@injectIntl
@track()
export class FormController extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
    prepareDataBeforeSubmit: PropTypes.func,
    prepareDataBeforeInitialize: PropTypes.func,
    showNotification: PropTypes.func,
    successMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    formOptions: PropTypes.shape({
      switcherLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      FieldsComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
      initialConfigUrl: PropTypes.string.isRequired,
      getSubmitUrl: PropTypes.func.isRequired,
      formHeader: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      customProps: PropTypes.object,
      defaultFormConfig: PropTypes.object,
    }),
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    eventsInfo: PropTypes.object,
  };

  static defaultProps = {
    enabled: false,
    prepareDataBeforeSubmit: (data) => data,
    prepareDataBeforeInitialize: (data) => data,
    showNotification: () => {},
    successMessage: '',
    formOptions: {
      formHeader: '',
      customProps: {},
      defaultFormConfig: {},
    },
    eventsInfo: {},
  };

  state = {
    loading: true,
  };

  componentDidMount() {
    this.fetchInitialConfig();
  }

  onFormSubmit = (formData) => {
    this.props.tracking.trackEvent(this.props.eventsInfo.submitBtn);
    this.setState({
      loading: true,
    });
    const data = this.props.prepareDataBeforeSubmit(formData);
    const requestOptions = {
      method: this.props.enabled ? 'POST' : 'DELETE',
    };
    if (this.props.enabled) {
      requestOptions.data = data;
    }
    return this.updateConfig(requestOptions, formData.id);
  };

  updateConfig = (options, id) =>
    fetch(this.props.formOptions.getSubmitUrl(id), options)
      .then((response) => this.updateConfigSuccess(options.method, response))
      .catch(this.stopLoading);

  fetchInitialConfig = () =>
    fetch(this.props.formOptions.initialConfigUrl)
      .then((data) => {
        const {
          prepareDataBeforeInitialize,
          initialize,
          formOptions: { defaultFormConfig },
        } = this.props;
        const initialData = prepareDataBeforeInitialize(data);
        initialize({
          ...defaultFormConfig,
          ...initialData,
        });
        this.stopLoading();
      })
      .catch(this.stopLoading);

  updateConfigSuccess = (method, data) => {
    const {
      intl: { formatMessage },
      formOptions: { defaultFormConfig },
      successMessage,
      prepareDataBeforeInitialize,
      initialize,
    } = this.props;
    const updatedData =
      method === 'DELETE'
        ? defaultFormConfig
        : { ...defaultFormConfig, ...prepareDataBeforeInitialize(data) };
    initialize(updatedData);
    this.props.showNotification({
      message: formatMessage(successMessage),
      type: NOTIFICATION_TYPES.SUCCESS,
    });
    this.stopLoading();
  };

  stopLoading = () =>
    this.setState({
      loading: false,
    });

  render() {
    const {
      intl: { formatMessage },
      formOptions: { FieldsComponent, customProps, switcherLabel, formHeader },
      handleSubmit,
      enabled,
      eventsInfo,
    } = this.props;

    return (
      <div className={cx('form-controller')}>
        {formHeader && (
          <div className={cx('heading-wrapper')}>
            <SectionHeader text={formHeader} />
          </div>
        )}
        <form className={cx('form')} onSubmit={handleSubmit(this.onFormSubmit)}>
          {this.state.loading ? (
            <SpinningPreloader />
          ) : (
            <FormField
              name={ENABLED_KEY}
              label={formatMessage(switcherLabel)}
              labelClassName={cx('label')}
              format={Boolean}
              parse={Boolean}
            >
              <InputBigSwitcher mobileDisabled onChangeEventInfo={eventsInfo.bigSwitcher} />
            </FormField>
          )}
          {enabled && <FieldsComponent {...customProps} />}
          <BigButton
            className={cx('submit-button')}
            disabled={this.state.loading}
            type="submit"
            mobileDisabled
          >
            <span className={cx('submit-button-title')}>
              {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
            </span>
          </BigButton>
        </form>
      </div>
    );
  }
}
