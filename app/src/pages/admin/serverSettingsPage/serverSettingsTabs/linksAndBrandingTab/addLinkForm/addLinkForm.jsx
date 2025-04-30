/*
 * Copyright 2025 EPAM Systems
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

import { defineMessages, useIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import classNames from 'classnames/bind';
import React from 'react';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { BigButton } from 'components/buttons/bigButton';
import { commonValidators } from 'common/utils/validation';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { updateServerFooterLinksAction } from 'controllers/appInfo';
import { email } from 'common/utils/validation/validate';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { FormField } from 'components/fields/formField';
import { Input } from 'components/inputs/input';
import styles from './addLinkForm.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  linkName: {
    id: 'AddLinkForm.linkName',
    defaultMessage: 'Link name',
  },
  urlOrEmail: {
    id: 'AddLinkForm.urlOrEmail',
    defaultMessage: 'URL or Email',
  },
  addedFooterLinkSuccess: {
    id: 'LinksAndBrandingTab.addedFooterLinkSuccess',
    defaultMessage: 'The link has been added successfully',
  },
});

const AddLink = ({ onClose, handleSubmit, customLinks }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const handleAddLink = (values) => {
    const targetLink = { ...values, url: email(values.url) ? `mailto:${values.url}` : values.url };
    dispatch(
      updateServerFooterLinksAction([...customLinks, targetLink], () => {
        dispatch(
          showNotification({
            message: formatMessage(messages.addedFooterLinkSuccess),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );

        onClose();
      }),
    );
  };
  return (
    <form className={cx('add-link-form')} onSubmit={handleSubmit(handleAddLink)}>
      <div className={cx('form-fields')}>
        <FormField
          name="name"
          label={formatMessage(messages.linkName)}
          required
          labelClassName={cx('field-label')}
          containerClassName={cx('field-name')}
          fieldWrapperClassName={cx('field-wrapper')}
        >
          <FieldErrorHint provideHint={false}>
            <Input displayError />
          </FieldErrorHint>
        </FormField>
        <FormField
          name="url"
          label={formatMessage(messages.urlOrEmail)}
          required
          labelClassName={cx('field-label')}
          containerClassName={cx('field-url')}
          fieldWrapperClassName={cx('field-wrapper')}
        >
          <FieldErrorHint provideHint={false}>
            <Input displayError />
          </FieldErrorHint>
        </FormField>
      </div>
      <div className={cx('form-footer')}>
        <BigButton color={'gray-60'} onClick={onClose} className={cx('cancel-button')}>
          {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
        </BigButton>
        <BigButton className={cx('submit-button')} type="submit" mobileDisabled>
          {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
        </BigButton>
      </div>
    </form>
  );
};

AddLink.propTypes = {
  onClose: PropTypes.func,
  handleSubmit: PropTypes.func,
  customLinks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ),
};

export const AddLinkForm = reduxForm({
  form: 'addLinkForm',
  validate: ({ name, url }, { defaultLinks, customLinks }) => {
    const links = [...defaultLinks, ...customLinks];
    const linksWithoutMailtoPrefix = links.map((link) => {
      return { ...link, url: link.url.startsWith('mailto:') ? link.url.slice(7) : link.url };
    });
    return {
      name: commonValidators.createFooterLinkNameValidator(links)(name),
      url: commonValidators.createFooterLinkURLValidator(linksWithoutMailtoPrefix)(url),
    };
  },
})(AddLink);
