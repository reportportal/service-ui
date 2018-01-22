import { when } from 'cerebral/operators';
import { state, props } from 'cerebral/tags';
import { isValidForm } from '@cerebral/forms/operators';
import highlightInvalidFields from '../modules/changePassForm/actions/highlightInvalidFields';
import sendChangePass from '../modules/changePassForm/actions/sendChangePass';
import loginRoute from './loginRoute';

export default [
  sendChangePass,
  {
    true: [
      loginRoute,
      ({ props: properties, notification }) => {
        notification.successMessage(properties.message);
      },
    ],
    false: [
      when(props`error`),
      {
        true: [
          ({ props: properties, notification }) => {
            notification.errorMessage(properties.error.response.result.message);
          },
        ],
        false: [
          isValidForm(state`user.changePassForm`), {
            true: [],
            false: [
              highlightInvalidFields,
            ],
          },
        ],
      },
    ],
  },
];
