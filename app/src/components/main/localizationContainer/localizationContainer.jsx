import React from 'react';
import PropTypes from 'prop-types';
import { connect } from '@cerebral/react';
import { state } from 'cerebral/tags';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

import localeRU from '../../../../localization/translated/ru.json';

addLocaleData([...en, ...ru]);

class LocalizationContainer extends React.Component {
  constructor(props) {
    super(props);
    this.messages = {
      ru: localeRU,
    };
    if (!window.Intl) {
      this.state = { ready: false };
      require.ensure([
        'intl',
        'intl/locale-data/jsonp/en.js',
        'intl/locale-data/jsonp/ru.js',
      ], (require) => {
        require('intl');
        require('intl/locale-data/jsonp/en.js');
        require('intl/locale-data/jsonp/ru.js');
        this.setState({ ready: true });
      });
    } else {
      this.state = { ready: true };
    }
  }

  render() {
    if (!this.state.ready) {
      return <div />;
    }
    return (
      <IntlProvider locale={this.props.lang} messages={this.messages[this.props.lang]}>
        {this.props.children}
      </IntlProvider>
    );
  }
}

LocalizationContainer.propTypes = {
  lang: PropTypes.string,
  children: PropTypes.node,
};
LocalizationContainer.defaultProps = {
  lang: 'en',
  children: null,
};

export default connect({
  lang: state`lang`,
}, LocalizationContainer);
