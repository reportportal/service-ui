import { EXPANDED_FOLDERS_IDS } from 'common/constants/localStorageKeys';
import { useTestPlanId } from 'hooks/useTypedSelector';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';

export const getExpandedFoldersStorageKey = (instanceKey?: TMS_INSTANCE_KEY) =>{
   const testPlanId = useTestPlanId() || '';
   
  return instanceKey ? `${EXPANDED_FOLDERS_IDS}_${instanceKey}${testPlanId}` : EXPANDED_FOLDERS_IDS;}
