import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { InputConditionalTags } from 'components/inputs/inputConditionalTags';
import { FieldFilterEntity } from 'components/fields/fieldFilterEntity';
import { CONDITION_HAS, CONDITION_NOT_HAS, CONDITION_IN, CONDITION_NOT_IN } from '../constants';

const conditions = [
  {
    value: CONDITION_HAS,
    label: <FormattedMessage id={'Conditions.all'} defaultMessage={'All'} />,
    shortLabel: <FormattedMessage id={'Conditions.allShort'} defaultMessage={'All'} />,
  },
  {
    value: CONDITION_NOT_IN,
    label: <FormattedMessage id={'Conditions.withoutAll'} defaultMessage={'Without all'} />,
    shortLabel: <FormattedMessage id={'Conditions.withoutAllShort'} defaultMessage={'!all'} />,
  },
  {
    value: CONDITION_IN,
    label: <FormattedMessage id={'Conditions.any'} defaultMessage={'Any'} />,
    shortLabel: <FormattedMessage id={'Conditions.anyShort'} defaultMessage={'Any'} />,
  },
  {
    value: CONDITION_NOT_HAS,
    label: <FormattedMessage id={'Conditions.withoutAny'} defaultMessage={'Without any'} />,
    shortLabel: <FormattedMessage id={'Conditions.withoutAnyShort'} defaultMessage={'!any'} />,
  },
];

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
export class EntityItemAttributes extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    title: PropTypes.string,
    smallSize: PropTypes.bool,
    removable: PropTypes.bool,
    onRemove: PropTypes.func,
    placeholder: PropTypes.string,
    urlResolver: PropTypes.func.isRequired,
    activeProject: PropTypes.string.isRequired,
  };
  static defaultProps = {
    title: '',
    smallSize: false,
    removable: true,
    placeholder: '',
    onRemove: () => {},
  };

  render() {
    const {
      placeholder,
      activeProject,
      urlResolver,
      onRemove,
      removable,
      title,
      smallSize,
      ...rest
    } = this.props;

    return (
      <FieldFilterEntity
        title={title}
        removable={removable}
        smallSize={smallSize}
        onRemove={onRemove}
        stretchable
      >
        <InputConditionalTags
          {...rest}
          conditions={conditions}
          placeholder={placeholder}
          url={urlResolver(activeProject)}
        />
      </FieldFilterEntity>
    );
  }
}
