/*
 * Copyright 2026 EPAM Systems
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

import React, { useEffect } from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { IntlProvider } from 'react-intl';
import { SECRET_FIELDS_KEY } from 'controllers/plugins/constants';
import { IntegrationForm } from './integrationForm';

jest.mock('@reportportal/ui-kit', () => ({
  // eslint-disable-next-line react/prop-types
  Button: ({ onClick, children, ...rest }) => (
    <button type="button" onClick={onClick} data-automation-id={rest['data-automation-id']}>
      {children}
    </button>
  ),
}));

// eslint-disable-next-line react/prop-types
const FieldsComponent = ({ initialize, updateMetaData }) => {
  useEffect(() => {
    initialize({ url: 'https://jira.example.com', password: 'secret' });
    updateMetaData({ [SECRET_FIELDS_KEY]: ['password'] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

describe('IntegrationForm', () => {
  test('re-initialises the form without secret fields after a successful save', () => {
    const store = createStore(combineReducers({ form: formReducer }));
    const onSubmit = jest.fn((data, onSuccess) => onSuccess());
    const wrapper = mount(
      <Provider store={store}>
        <IntlProvider locale="en" onError={() => {}}>
          <IntegrationForm
            form="integrationForm"
            data={{ id: 1, integrationParameters: {}, integrationType: {} }}
            onSubmit={onSubmit}
            formFieldsComponent={FieldsComponent}
            connected
            isEmptyConfiguration
            pluginName="jira"
            isEditable
          />
        </IntlProvider>
      </Provider>,
    );

    wrapper.find('button[data-automation-id="submitConfigurationButton"]').simulate('click');

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({
      url: 'https://jira.example.com',
      password: 'secret',
    });
    expect(store.getState().form.integrationForm.values).toEqual({
      url: 'https://jira.example.com',
    });
  });
});
