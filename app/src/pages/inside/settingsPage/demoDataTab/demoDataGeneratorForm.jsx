import React from 'react';
import { reduxForm, propTypes } from 'redux-form';
import { Input } from 'components/inputs/input';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';

import { BigButton } from 'components/buttons/bigButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';

import styles from './demoDataGenerator.scss';

const cx = classNames.bind(styles);

const DemoDataGeneratorForm = (props) => {
  const { handleSubmit } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div className={cx('input-wrapper')}>
        <FieldProvider name="postfix">
          <FieldErrorHint>
            <Input />
          </FieldErrorHint>
        </FieldProvider>
      </div>
      <div className={cx('buttonGenerate')}>
        <BigButton type="submit">
          <span className={cx('generate-demo-data')}>
            <FormattedMessage
              id={'DemoDataGeneratorForm.buttonGenerate'}
              defaultMessage={'Generate Demo Data'}
            />
          </span>
        </BigButton>
      </div>
    </form>
  );
};

DemoDataGeneratorForm.propTypes = {
  ...propTypes,
};

export default reduxForm({
  form: 'postfix',
})(DemoDataGeneratorForm);
