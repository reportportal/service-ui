import React, { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputSearch } from 'components/inputs/inputSearch';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { ActionPanel } from './actionPanel';

import styles from './pluginsToolbar.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  searchInputPlaceholder: { id: 'PluginsPage.search', defaultMessage: 'Search' },
});

@injectIntl
export class PluginsToolbar extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    return (
      <div className={cx('plugins-toolbar')}>
        <div className={cx('plugins-search')}>
          <FieldErrorHint>
            <InputSearch
              className={'plugins'}
              maxLength="128"
              placeholder={this.props.intl.formatMessage(messages.searchInputPlaceholder)}
            />
          </FieldErrorHint>
        </div>
        <ActionPanel />
      </div>
    );
  }
}
