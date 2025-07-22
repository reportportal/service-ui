import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { Checkbox, InfoIcon, Tooltip } from '@reportportal/ui-kit';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { InviteUserEmailField } from '../inviteUserEmailField';
import { Level } from '../constants';
import { getFormName } from '../utils';
import styles from './inviteUserProjectForm.scss';

const cx = classNames.bind(styles) as typeof classNames;

export interface InviteUserProjectFormData {
  email: string;
  canEdit: boolean;
}

export const InviteUserProjectForm = () => {
  const { formatMessage } = useIntl();
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);

  return (
    <form className={cx('form')}>
      <p>{formatMessage(ssoUsersOnly ? messages.descriptionAssign : messages.description)}</p>
      <InviteUserEmailField formName={getFormName(Level.PROJECT)} />
      <div className={cx('checkbox-wrapper')}>
        <FieldElement name="canEdit" format={Boolean} className={cx('checkbox')}>
          <Checkbox className={cx('can-edit')}>{formatMessage(messages.canEditProject)}</Checkbox>
        </FieldElement>
        <Tooltip
          content={formatMessage(messages.hintMessage)}
          placement="top"
          contentClassName={cx('custom-tooltip')}
          wrapperClassName={cx('tooltip-wrapper')}
        >
          <InfoIcon className={cx('icon')} />
        </Tooltip>
      </div>
    </form>
  );
};
