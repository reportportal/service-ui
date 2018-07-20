import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { generateDemoDataAction } from 'controllers/projectSettings/demoData/actionCreators';
import styles from './demoDataGenerator.scss';
import DemoDataGeneratorForm from './demoDataGeneratorForm';
import warningSign from './img/ic-warning.svg';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    loading: state.projectSettings.demoDataGenerator.loading,
  }),
  {
    generateDemoData: generateDemoDataAction,
  },
)
export class DemoDataGenerator extends Component {
  static propTypes = {
    generateDemoData: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  };
  render() {
    const { generateDemoData, loading } = this.props;
    return (
      <div className={cx('demo-data-generator-container')}>
        <p className={cx('mobile-hint')}>
          <FormattedMessage
            id={'DemoDataGenerator.mobileHint'}
            defaultMessage={'You can generate data only on desktop view.'}
          />
        </p>
        <h5 className={cx('description-header')}>
          <FormattedMessage
            id={'DemoDataGenerator.descriptionHeader'}
            defaultMessage={'The system will generate the following demo data:'}
          />
        </h5>
        <ul className={cx('description-list')}>
          <li>
            <FormattedMessage
              id={'DemoDataGenerator.descriptionListFirstItem'}
              defaultMessage={'10 launches'}
            />
          </li>
          <li>
            <FormattedMessage
              id={'DemoDataGenerator.descriptionListSecItem'}
              defaultMessage={'1 dashboard with 9 widgets'}
            />
          </li>
          <li>
            <FormattedMessage
              id={'DemoDataGenerator.descriptionListThirdItem'}
              defaultMessage={'1 filter'}
            />
          </li>
        </ul>
        <p className={cx('postfix-hint')}>
          <FormattedMessage
            id={'DemoDataGenerator.postfixHint'}
            defaultMessage={'Postfix will be added to the demo dashboard, widgets, filter name'}
          />
        </p>
        <DemoDataGeneratorForm onSubmit={generateDemoData} loading={loading} />
        <div className={cx('warning-block')}>
          <img src={warningSign} className={cx('warning-sign')} alt="red exclamation sign" />
          <p className={cx('warning-text')}>
            <FormattedMessage id={'DemoDataGenerator.warningText'} defaultMessage={'Warning'} />
          </p>
          <p className={cx('warning-info')}>
            <FormattedMessage
              id={'DemoDataGenerator.warningInfo'}
              defaultMessage={'You will have to remove the demo data manually.'}
            />
          </p>
        </div>
      </div>
    );
  }
}
