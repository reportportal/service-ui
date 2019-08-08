import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import IconDelete from 'common/img/circle-cross-icon-inline.svg';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import { FormField } from 'components/fields/formField';
import { Input } from 'components/inputs/input';
import PlusIcon from 'common/img/plus-button-inline.svg';
import styles from './categoriesList.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  addOrganizationButtonTitle: {
    id: 'CategoriesList.addOrganizationButtonTitle',
    defaultMessage: 'Add GitHub organization',
  },
  organizationNameLabel: {
    id: 'CategoriesList.organizationNameLabel',
    defaultMessage: 'Organization name',
  },
});

@connect(null, { showModalAction })
@injectIntl
export class CategoriesList extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    fields: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
  };

  removeOrganizationHandler = (currentItem, index) => {
    currentItem.new
      ? this.props.fields.remove(index)
      : this.props.showModalAction({
          id: 'removeOrganizationModal',
          data: {
            onConfirm: () => this.props.fields.remove(index),
            organizationForRemove: currentItem.organization,
          },
        });
  };

  render() {
    const {
      intl: { formatMessage },
      fields,
    } = this.props;
    const items = fields.getAll() || [];

    return (
      <Fragment>
        {fields.map((item, index) => {
          const currentItem = fields.get(index);
          return (
            // eslint-disable-next-line
            <div className={cx('organization-container')} key={`${item}.${index}`}>
              <FormField
                name={`${item}.organization`}
                fieldWrapperClassName={cx('form-field-wrapper')}
                label={formatMessage(messages.organizationNameLabel)}
                labelClassName={cx('label')}
                disabled={!currentItem.new}
              >
                <Input mobileDisabled />
              </FormField>
              <span
                className={cx('remove-organization')}
                onClick={() => this.removeOrganizationHandler(currentItem, index)}
              >
                {Parser(IconDelete)}
              </span>
            </div>
          );
        })}
        {!items.some((item) => item.new) && (
          <div className={cx('button-wrapper')}>
            <GhostButton
              onClick={() => fields.push({ organization: '', new: true })}
              icon={PlusIcon}
            >
              {formatMessage(messages.addOrganizationButtonTitle)}
            </GhostButton>
          </div>
        )}
      </Fragment>
    );
  }
}
