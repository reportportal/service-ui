import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { Input } from '../../../../components/inputs/input';
import styles from './generalTab.scss';
import { InputDropdown } from '../../../../components/inputs/inputDropdown';
import { InputBigSwitcher } from '../../../../components/inputs/inputBigSwitcher';
import { BigButton } from '../../../../components/buttons/bigButton';
import { timeStorageOptions, timeTimeoutOptions } from './timeOptions';
import { FieldProvider } from '../../../../components/fields/fieldProvider';
import { InputRadio } from '../../../../components/inputs/inputRadio';

const cx = classNames.bind(styles);
const cellClasses = cx('gridCell', 'centered');
const cellClassesSubmit = cx('gridCell', 'submitButton');
const cellClassesFormField = cx('gridCell', 'formField');
const cellClassesColumn = cx('gridCell', 'column');
const cellClassesEmpty = cx('gridCell', 'empty');

const selector = formValueSelector('testRunner');

@reduxForm({
  form: 'testRunner',
})
@connect((state) => {
  const autoAnalysisEnabled = selector(state, 'autoAnalysis');
  return {
    autoAnalysisEnabled,
  };
})
export class GeneralTab extends Component {
  static defaultProps = {
    name: 'user',
    inactivityTimeout: '1H',
    keepLogs: '2W',
    keepAttachments: '2W',
    autoAnalysis: false,
    autoAnalysisEnabled: false,
    submitFormData: () => {},
  };

  static propTypes = {
    name: PropTypes.string.isRequired,
    inactivityTimeout: PropTypes.string.isRequired,
    keepLogs: PropTypes.string.isRequired,
    keepAttachments: PropTypes.string.isRequired,
    autoAnalysis: PropTypes.bool.isRequired,
    submitFormData: PropTypes.func.isRequired,
    autoAnalysisEnabled: PropTypes.bool,
  };
  render() {
    const { autoAnalysisEnabled } = this.props;
    const [BASE_ALL_LAUNCHES, BASE_SAME_NAME, BASE_CURRENT] = [
      'allLaunches',
      'sameName',
      'currentLaunch',
    ];
    return (
      <div className={styles.generalTabContainer}>
        <form>
          <div className={styles.formField}>
            <div className={cellClasses}>
              <label htmlFor={'name'}>Name</label>
            </div>
            <div className={cellClasses}>
              <FieldProvider name="name">
                <Input id="name" disabled />
              </FieldProvider>
            </div>
            <div className={cellClassesEmpty} />
          </div>

          <div className={styles.formField}>
            <div className={cellClasses}>
              <label htmlFor={'timeout'} className={styles.generalTabLabel}>
                <FormattedMessage
                  id={'GeneralTab.inactivityTimeout'}
                  defaultMessage={'Launch inactivity timeout'}
                />
              </label>
            </div>
            <div className={cellClassesFormField}>
              <FieldProvider name="timeout">
                <InputDropdown options={timeTimeoutOptions} />
              </FieldProvider>
            </div>
            <div className={cellClasses}>
              <span>
                <FormattedMessage
                  id={'GeneralTab.scheduleTime'}
                  defaultMessage={'Schedule time for Job to interrupt inactive launches'}
                />
              </span>
            </div>
          </div>

          <div className={styles.formField}>
            <div className={cellClasses}>
              <label htmlFor={'keepLogs'} className={styles.generalTabLabel}>
                <FormattedMessage id={'GeneralTab.keepLogs'} defaultMessage={'Keep logs'} />
              </label>
            </div>
            <div className={cellClassesFormField}>
              <FieldProvider name="keepLogs">
                <InputDropdown options={timeStorageOptions} />
              </FieldProvider>
            </div>
            <div className={cellClasses}>
              <span>
                <FormattedMessage
                  id={'GeneralTab.keepLogsTip'}
                  defaultMessage={
                    'How long to keep old logs in launches. Related launches structure will be saved, in order to keep statistics'
                  }
                />
              </span>
            </div>
          </div>

          <div className={styles.formField}>
            <div className={cellClasses}>
              <label htmlFor={'keepAttachments'} className={styles.generalTabLabel}>
                <FormattedMessage
                  id={'GeneralTab.keepAttachments'}
                  defaultMessage={'Keep attachments'}
                />
              </label>
            </div>
            <div className={cellClassesFormField}>
              <FieldProvider name="keepAttachments">
                <InputDropdown options={timeStorageOptions} />
              </FieldProvider>
            </div>
            <div className={cellClasses}>
              <span>
                <FormattedMessage
                  id={'GeneralTab.keepAttachmentsTip'}
                  defaultMessage={'How long to keep attachments in system'}
                />
              </span>
            </div>
          </div>

          <div className={styles.formField}>
            <div className={cellClasses}>
              <label htmlFor={'autoAnalysis'}>
                <FormattedMessage id={'GeneralTab.autoAnalysis'} defaultMessage={'Auto analysis'} />
              </label>
            </div>
            <div className={cellClasses}>
              <FieldProvider name="autoAnalysis" type="checkbox">
                <InputBigSwitcher id={'autoAnalysis'} leftAligned />
              </FieldProvider>
            </div>
            <div className={cellClassesColumn}>
              <span>
                <FormattedMessage
                  id={'GeneralTab.autoAnalysisOn'}
                  defaultMessage={'If ON - analysis starts as soon as any launch finished.'}
                />
              </span>
              <span>
                <FormattedMessage
                  id={'GeneralTab.autoAnalysisOff'}
                  defaultMessage={'If OFF - not automatic, but can be invoked manually.'}
                />
              </span>
            </div>
          </div>
          {autoAnalysisEnabled && (
            <div>
              <div className={styles.formField}>
                <div className={cellClasses}>
                  <div>
                    <span>
                      <FormattedMessage
                        id={'GeneralTab.autoAnalysisBase'}
                        defaultMessage={'Base for Auto Analysis'}
                      />
                    </span>
                  </div>
                </div>

                <div className={cellClasses}>
                  <label className={cx('radioCheckbox')}>
                    <FieldProvider ownValue={BASE_ALL_LAUNCHES} name="launchBase">
                      <InputRadio />
                    </FieldProvider>
                    <FormattedMessage
                      id={'GeneralTab.autoAnalysisAllLaunches'}
                      defaultMessage={'All launches'}
                    />
                  </label>
                </div>
                <div className={cellClasses}>
                  <p>
                    <FormattedMessage
                      id={'GeneralTab.autoAnalysisAllLaunchesTip'}
                      defaultMessage={
                        'The test items are analyzed on base of previously investigated data in all launches'
                      }
                    />
                  </p>
                </div>
              </div>

              <div className={styles.formField}>
                <div className={cellClassesEmpty} />
                <div className={cellClasses}>
                  <label className={cx('radioCheckbox')}>
                    <FieldProvider ownValue={BASE_SAME_NAME} name="launchBase">
                      <InputRadio />
                    </FieldProvider>
                    <FormattedMessage
                      id={'GeneralTab.autoAnalysisSameNameLaunches'}
                      defaultMessage={'Launches with the same name'}
                    />
                  </label>
                </div>

                <div className={cellClasses}>
                  <p>
                    <FormattedMessage
                      id={'GeneralTab.autoAnalysisSameNameLaunchesTip'}
                      defaultMessage={
                        'The test items are analyzed on base of previously investigated data in launches with the same name'
                      }
                    />
                  </p>
                </div>
              </div>
              <div className={styles.formField}>
                <div className={cellClassesEmpty} />
                <div className={cellClasses}>
                  <label className={cx('radioCheckbox')}>
                    <FieldProvider ownValue={BASE_CURRENT} name="launchBase">
                      <InputRadio />
                    </FieldProvider>
                    <FormattedMessage
                      id={'GeneralTab.autoAnalysisCurrentLaunch'}
                      defaultMessage={'Only current launch'}
                    />
                  </label>
                </div>
                <div className={cellClasses}>
                  <p>
                    <FormattedMessage
                      id={'GeneralTab.autoAnalysisCurrentLaunchTip'}
                      defaultMessage={
                        'The test items are analyzed on base of previously investigated data from the cone current launch'
                      }
                    />
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formField}>
            <div className={cellClassesEmpty} />
            <div className={cellClassesSubmit}>
              <div className="buttonWrapper">
                <BigButton className={styles.bigButton}>Submit</BigButton>
              </div>
            </div>
            <div className={cellClassesEmpty} />
          </div>
        </form>
      </div>
    );
  }
}
