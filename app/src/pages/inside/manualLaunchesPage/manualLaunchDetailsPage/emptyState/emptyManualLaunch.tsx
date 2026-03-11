import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { createClassnames } from 'common/utils';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import { useProjectDetails } from 'hooks/useTypedSelector';

import { messages } from './messages';

import styles from './emptyManualLaunch.scss';

const cx = createClassnames(styles);

export const EmptyManualLaunch = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();

  const handleGoToLibrary = () => {
    dispatch({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
      },
    });
  };

  return (
    <div className={cx('empty-manual-launch')}>
      <EmptyStatePage
        title={formatMessage(messages.pageHeader)}
        description={formatMessage(messages.pageDescription)}
        imageType="docs"
        buttons={[
          {
            name: formatMessage(messages.goToLibrary),
            dataAutomationId: 'goToLibraryButton',
            isCompact: true,
            variant: 'ghost',
            handleButton: handleGoToLibrary,
          },
        ]}
      />
    </div>
  );
};
