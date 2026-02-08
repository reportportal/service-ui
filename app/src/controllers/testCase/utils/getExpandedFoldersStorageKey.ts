import { EXPANDED_FOLDERS_IDS } from 'common/constants/localStorageKeys';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';

export const getExpandedFoldersStorageKey = (instanceKey?: TMS_INSTANCE_KEY) =>
   instanceKey ? `${EXPANDED_FOLDERS_IDS}_${instanceKey}` : EXPANDED_FOLDERS_IDS;
