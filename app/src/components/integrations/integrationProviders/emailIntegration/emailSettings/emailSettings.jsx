import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { ConnectionSection, IntegrationForm } from '../../../elements';
import { EmailFormFields } from '../emailFormFields';
import styles from './emailSettings.scss';

const cx = classNames.bind(styles);

@injectIntl
export class EmailSettings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  render() {
    const { data, goToPreviousPage, onUpdate } = this.props;

    return (
      <div className={cx('email-settings')}>
        <ConnectionSection
          disabled={data.blocked}
          integrationId={data.id}
          onRemoveConfirmation={goToPreviousPage}
        />
        <IntegrationForm data={data} onSubmit={onUpdate} formFieldsComponent={EmailFormFields} />
      </div>
    );
  }
}
