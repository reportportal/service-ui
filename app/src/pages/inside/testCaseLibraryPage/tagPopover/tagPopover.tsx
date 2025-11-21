/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ReactNode, useState } from 'react';
import { useIntl } from 'react-intl';
import { BubblesLoader, Button, Popover } from '@reportportal/ui-kit';
import { PopoverProps } from '@reportportal/ui-kit/popover';
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { SearchField } from 'components/fields/searchField';

import { Attribute } from '../types';
import { useTagSearch, TagError } from './useTagSearch';
import { messages } from './messages';
import { commonMessages } from '../commonMessages';

import styles from './tagPopover.scss';

const cx = createClassnames(styles);

interface TagPopoverProps extends Pick<PopoverProps, 'placement'> {
  trigger: ReactNode;
  onTagSelect: (tag: Attribute) => void;
  className?: string;
}

export const TagPopover = ({
  trigger,
  onTagSelect,
  placement = 'bottom',
  className,
}: TagPopoverProps) => {
  const { formatMessage } = useIntl();
  const [searchValue, setSearchValue] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const { tags, loading, error, createTag } = useTagSearch(searchValue);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleTag = (tag: Attribute) => {
    onTagSelect(tag);
    setSearchValue('');
    setIsOpened(false);
  };

  const handleCreateTag = () => {
    const trimmedSearchValue = searchValue.trim();

    if (!trimmedSearchValue) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    createTag(trimmedSearchValue).then((newTag) => {
      if (newTag) {
        handleTag(newTag);
      }
    });
  };

  const handleOpenChange = (isOpened: boolean) => {
    setIsOpened(isOpened);

    if (!isOpened) {
      setSearchValue('');
    }
  };

  const renderTagList = () => (
    <div className={cx('tag-popover__list')}>
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          className={cx('tag-popover__tag-item')}
          onClick={() => handleTag(tag)}
        >
          {tag.key}
        </button>
      ))}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className={cx('tag-popover__loading')}>
          <BubblesLoader />
        </div>
      );
    }

    if (error === TagError.TAG_ALREADY_ADDED) {
      return (
        <div className={cx('tag-popover__empty')}>{formatMessage(messages.tagAlreadyAdded)}</div>
      );
    }

    const hasSearchValue = !isEmpty(searchValue.trim());
    const hasTags = !isEmpty(tags);

    if (!hasSearchValue && !hasTags) {
      return null;
    }

    if (!hasSearchValue && hasTags) {
      return renderTagList();
    }

    return (
      <>
        {hasTags && (
          <>
            {renderTagList()}
            <div className={cx('tag-popover__divider')} />
          </>
        )}
        <div className={cx('tag-popover__create-section')}>
          <span className={cx('tag-popover__create-value')}>{searchValue}</span>
          <Button
            variant="text"
            adjustWidthOn="content"
            onClick={handleCreateTag}
            className={cx('tag-popover__create-button')}
          >
            + {formatMessage(commonMessages.createNew)}
          </Button>
        </div>
      </>
    );
  };

  return (
    <Popover
      placement={placement}
      isOpened={isOpened}
      setIsOpened={handleOpenChange}
      content={
        <div className={cx('tag-popover')}>
          <div className={cx('tag-popover__search')}>
            <SearchField
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              filter=""
              onFilterChange={handleSearchChange}
              placeholder={formatMessage(messages.searchPlaceholder)}
              isFullWidth
            />
          </div>
          {renderContent()}
        </div>
      }
      className={cx(className)}
    >
      {trigger}
    </Popover>
  );
};
