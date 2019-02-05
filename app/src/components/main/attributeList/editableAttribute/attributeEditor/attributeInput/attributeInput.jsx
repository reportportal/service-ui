import { Component } from 'react';
import PropTypes from 'prop-types';
import { formValues } from 'redux-form';
import { InputTagsSearch } from 'components/inputs/inputTagsSearch';

@formValues({ attributeKey: 'key', attributeValue: 'value' })
export class AttributeInput extends Component {
  static propTypes = {
    attributes: PropTypes.array,
    attributeKey: PropTypes.string,
    attributeValue: PropTypes.string,
    attributeComparator: PropTypes.func,
  };

  static defaultProps = {
    attributes: [],
    attributeKey: null,
    attributeValue: null,
    attributeComparator: () => {},
  };

  makeOptions = (items) => {
    const { attributes, attributeKey, attributeValue, attributeComparator } = this.props;
    const filteredItems = items.filter(
      (item) =>
        !attributes.find((attribute) =>
          attributeComparator(attribute, item, attributeKey, attributeValue),
        ),
    );
    return filteredItems.map((item) => ({ value: item, label: item }));
  };

  render() {
    const { attributes, attributeKey, attributeValue, attributeComparator, ...rest } = this.props;
    return <InputTagsSearch {...rest} makeOptions={this.makeOptions} />;
  }
}
