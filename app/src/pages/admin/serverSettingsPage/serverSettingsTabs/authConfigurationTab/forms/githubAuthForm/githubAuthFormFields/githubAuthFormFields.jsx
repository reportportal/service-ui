import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import IconDelete from 'common/img/circle-cross-icon-inline.svg';
import { FormField } from 'components/fields/formField';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { Input } from 'components/inputs/input';
import { GhostButton } from 'components/buttons/ghostButton';
import { showModalAction } from 'controllers/modal';
import PlusIcon from 'common/img/plus-button-inline.svg';
import {
  GITHUB_AUTH_FORM,
  CLIENT_ID_KEY,
  CLIENT_SECRET_KEY,
  ORGANIZATIONS_KEY,
  NEW_ORGANIZATION_KEY,
} from '../constants';
import styles from './githubAuthFormFields.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  clientIdLabel: {
    id: 'GithubAuthFormFields.clientIdLabel',
    defaultMessage: 'Client ID',
  },
  clientSecretLabel: {
    id: 'GithubAuthFormFields.clientSecretLabel',
    defaultMessage: 'Client secret',
  },
  addOrganizationButtonTitle: {
    id: 'GithubAuthFormFields.addOrganizationButtonTitle',
    defaultMessage: 'Add GitHub organization',
  },
  organizationNameLabel: {
    id: 'GithubAuthFormFields.organizationNameLabel',
    defaultMessage: 'Organization name',
  },
});

@connect(
  (state) => ({
    organizations: (formValueSelector(GITHUB_AUTH_FORM)(state, ORGANIZATIONS_KEY) || '').split(','),
  }),
  { showModalAction },
)
@injectIntl
export class GithubAuthFormFields extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    organizations: PropTypes.array,
    showModalAction: PropTypes.func,
  };

  static defaultProps = {
    organizations: [],
    showModalAction: () => {},
  };

  state = {
    isAddOrganizationClicked: false,
  };

  addOrganization = () => {
    this.setState({
      isAddOrganizationClicked: true,
    });
  };

  removeOrganizationHandler = (organizationForRemove) => {
    this.props.showModalAction({ id: 'removeOrganizationModal', data: { organizationForRemove } });
  };

  render() {
    const {
      intl: { formatMessage },
      organizations,
    } = this.props;

    return (
      <div className={cx('github-auth-form-fields')}>
        <FormField
          name={CLIENT_ID_KEY}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.clientIdLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </FormField>
        <FormField
          name={CLIENT_SECRET_KEY}
          required
          fieldWrapperClassName={cx('form-field-wrapper')}
          label={formatMessage(messages.clientSecretLabel)}
          labelClassName={cx('label')}
        >
          <FieldErrorHint>
            <Input mobileDisabled />
          </FieldErrorHint>
        </FormField>
        {!!organizations.length &&
          organizations[0] &&
          organizations.map((item, index) => (
            // eslint-disable-next-line
            <div className={cx('organization-container')} key={`${item}.${index}`}>
              <FormField
                fieldWrapperClassName={cx('form-field-wrapper')}
                label={formatMessage(messages.organizationNameLabel)}
                labelClassName={cx('label')}
                withoutProvider
              >
                <Input value={item} disabled mobileDisabled />
              </FormField>
              <span
                className={cx('remove-organization')}
                onClick={() => this.removeOrganizationHandler(item)}
              >
                {Parser(IconDelete)}
              </span>
            </div>
          ))}
        {this.state.isAddOrganizationClicked ? (
          <FormField
            name={NEW_ORGANIZATION_KEY}
            fieldWrapperClassName={cx('form-field-wrapper')}
            label={formatMessage(messages.organizationNameLabel)}
            labelClassName={cx('label')}
          >
            <FieldErrorHint>
              <Input mobileDisabled />
            </FieldErrorHint>
          </FormField>
        ) : (
          <div className={cx('button-wrapper')}>
            <GhostButton onClick={this.addOrganization} icon={PlusIcon} type="button">
              {formatMessage(messages.addOrganizationButtonTitle)}
            </GhostButton>
          </div>
        )}
      </div>
    );
  }
}
