import React, { Component } from 'react';
import { propTypes, reduxForm } from 'redux-form';
import { Input } from 'components/inputs/input';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { BigButton } from 'components/buttons/bigButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';

import styles from './demoDataGenerator.scss';

const cx = classNames.bind(styles);

@reduxForm({
  form: 'demoDataGeneratorForm',
})
export default class DemoDataGeneratorForm extends Component {
  static propTypes = {
    ...propTypes,
  };

  render() {
    const { handleSubmit, loading } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <div className={cx('input-wrapper')}>
          <FieldProvider name="postfix" disabled={loading}>
            <FieldErrorHint>
              <Input disabled={false} />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('button-generate')}>
          <BigButton type="submit" disabled={loading}>
            <span className={cx('generate-demo-data')}>
              <FormattedMessage
                id={'DemoDataGeneratorForm.buttonGenerate'}
                defaultMessage={'Generate Demo Data'}
              />
            </span>
          </BigButton>
        </div>
        {loading &&
          <div className={cx('spinning-preloader-wrapper')}>
            <div className={cx('spinning-preloader-icon')}>
              <SpinningPreloader/>
            </div>
            <div className={cx('spinning-preloader-info')}>
              <FormattedMessage
                id={'DemoDataGeneratorForm.spinningPreloaderInfo'}
                defaultMessage={
                  'Data generation is started. The process can take several minutes, please wait.'
                }
              />
            </div>
          </div>
        }
      </form>
    );
  }
}
