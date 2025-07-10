import { FC } from 'react';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Button } from '@reportportal/ui-kit';
import { referenceDictionary } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ExternalLink } from 'pages/inside/common/externalLink';
import { messages } from './messages';
import styles from './emptyMilestones.scss';

const cx = classNames.bind(styles);

type EmptyMilestonesProps = {
  // add required props types
};

const benefitMessages = [
  messages.progressTracking,
  messages.goalAlignment,
  messages.resourceManagement,
];

export const EmptyMilestones: FC<EmptyMilestonesProps> = () => {
  const { formatMessage } = useIntl();
  const benefits = benefitMessages.map((translation) =>
    Parser(formatMessage(translation, {}, { ignoreTag: true })),
  );

  const handleCreate = (): void => {
    // open modal
  };

  return (
    <div className={cx('empty-milestones')}>
      <div className={cx('empty-milestones__image')} />
      <h2 className={cx('empty-milestones__header')}>{formatMessage(messages.pageHeader)}</h2>
      <p className={cx('empty-milestones__description')}>
        {formatMessage(messages.pageDescription)}
      </p>
      <Button className={cx('empty-milestones__button')} onClick={handleCreate}>
        {formatMessage(messages.createMilestoneLabel)}
      </Button>
      <ExternalLink className={cx('empty-milestones__link')} href={referenceDictionary.rpDoc}>
        {formatMessage(COMMON_LOCALE_KEYS.documentation)}
      </ExternalLink>
      <section className={cx('empty-milestones__info-section')}>
        <h3 className={cx('empty-milestones__sub-header')}>
          {formatMessage(messages.numerableBlockTitle)}
        </h3>
        <ol className={cx('empty-milestones__list')}>
          {benefits.map((message, index) => (
            <li key={benefitMessages[index].defaultMessage}>
              <p>{message}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
