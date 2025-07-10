import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { referenceDictionary } from 'common/utils';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { NumerableBlock } from 'pages/common/numerableBlock';
import { messages } from './messages';
import styles from './emptyMilestones.scss';

const cx = classNames.bind(styles);

const benefitMessages = [
  messages.progressTracking,
  messages.goalAlignment,
  messages.resourceManagement,
];

export const EmptyMilestones = () => {
  const { formatMessage } = useIntl();
  const benefits = benefitMessages.map((translation) =>
    Parser(formatMessage(translation, {}, { ignoreTag: true })),
  );

  const handleCreate = (): void => {
    // open modal
  };

  return (
    <div className={cx('empty-milestones')}>
      <EmptyStatePage
        title={formatMessage(messages.pageHeader)}
        description={Parser(formatMessage(messages.pageDescription))}
        imageType="flag"
        documentationLink={referenceDictionary.rpDoc}
        buttons={[
          {
            name: formatMessage(messages.createMilestoneLabel),
            dataAutomationId: 'createMilestoneButton',
            isCompact: true,
            handleButton: handleCreate,
          },
        ]}
      />
      <NumerableBlock
        items={benefits}
        title={formatMessage(messages.numerableBlockTitle)}
        className={cx('empty-milestones__numerableBlock')}
        fullWidth
      />
    </div>
  );
};
