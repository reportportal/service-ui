import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { URLS } from 'common/urls';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { activeProjectSelector } from 'controllers/user';
import { ModalField } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';
import { FIELD_LABEL_WIDTH } from '../controls/constants';
import styles from './attributesFieldArray.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  attributeKeyFieldLabel_0: {
    id: 'CumulativeTrendControls.attributeKeyFieldLabelOverview',
    defaultMessage: 'Level 1 (overview)',
  },
  attributeKeyFieldLabel_1: {
    id: 'CumulativeTrendControls.attributeKeyFieldLabelDetailedView',
    defaultMessage: 'Level 2 (detailed view)',
  },
  attributeKeyFieldPlaceholder: {
    id: 'CumulativeTrendControls.attributeKeyFieldPlaceholder',
    defaultMessage: 'Enter an attribute key',
  },
  addOneMoreLevel: {
    id: 'CumulativeTrendControls.addOneMoreLevel',
    defaultMessage: '+ Add one more level',
  },
});

@connect((state) => ({
  launchAttributeKeysSearch: URLS.launchAttributeKeysSearch(activeProjectSelector(state)),
}))
@injectIntl
export class AttributesFieldArray extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    fields: PropTypes.object.isRequired,
    launchAttributeKeysSearch: PropTypes.string.isRequired,
    fieldValidator: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    if (!props.fields.length) {
      props.fields.push('');
    }
  }

  getAttributes = () => this.props.fields.getAll() || [];

  makeAttributes = (items) => {
    const filteredItems = items.filter((item) => !this.getAttributes().includes(item));

    return filteredItems ? filteredItems.map((item) => ({ value: item, label: item })) : null;
  };

  isOptionUnique = ({ option }) => !this.getAttributes().includes(option.value);

  formatAttributes = (attribute) => (attribute ? { value: attribute, label: attribute } : null);

  parseAttributes = (attribute) => {
    if (attribute === null) return null;
    if (attribute && attribute.value) return attribute.value;

    return undefined;
  };

  render() {
    const {
      intl: { formatMessage },
      fields,
      launchAttributeKeysSearch,
      fieldValidator,
    } = this.props;
    const canAddNewItems = fields.length < 2;

    return (
      <Fragment>
        {fields.map((item, index) => {
          const isFirstItem = index === 0;
          return (
            <ModalField
              // eslint-disable-next-line
              key={item}
              label={formatMessage(messages[`attributeKeyFieldLabel_${index}`])}
              labelWidth={FIELD_LABEL_WIDTH}
              className={cx('attribute-modal-field')}
            >
              <FieldProvider
                parse={this.parseAttributes}
                format={this.formatAttributes}
                name={item}
                validate={isFirstItem ? fieldValidator : undefined}
              >
                <FieldErrorHint hintType="top">
                  <InputTagsSearch
                    uri={launchAttributeKeysSearch}
                    minLength={1}
                    placeholder={formatMessage(messages.attributeKeyFieldPlaceholder)}
                    async
                    creatable
                    showNewLabel
                    removeSelected
                    makeOptions={this.makeAttributes}
                    isOptionUnique={this.isOptionUnique}
                    customClass={isFirstItem ? undefined : cx('attr-selector')}
                  />
                </FieldErrorHint>
              </FieldProvider>
              {!isFirstItem && (
                <span className={cx('remove-icon')} onClick={() => fields.remove(index)}>
                  {Parser(CrossIcon)}
                </span>
              )}
            </ModalField>
          );
        })}
        {canAddNewItems ? (
          <ModalField label=" " labelWidth={FIELD_LABEL_WIDTH}>
            <div className={cx('add-level')} onClick={() => fields.push('')}>
              {formatMessage(messages.addOneMoreLevel)}
            </div>
          </ModalField>
        ) : null}
      </Fragment>
    );
  }
}
