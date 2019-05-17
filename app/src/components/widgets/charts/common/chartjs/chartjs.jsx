import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

@injectIntl
export class ChartJS extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    return <div />;
  }
}
