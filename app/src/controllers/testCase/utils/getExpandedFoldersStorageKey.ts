import { EXPANDED_FOLDERS_IDS } from 'common/constants/localStorageKeys';

export const getExpandedFoldersStorageKey = (instanceKey?: string) =>
   instanceKey ? `${EXPANDED_FOLDERS_IDS}_${instanceKey}` : EXPANDED_FOLDERS_IDS;
