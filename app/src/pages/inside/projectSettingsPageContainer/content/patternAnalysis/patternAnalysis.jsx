import { useDispatch, useSelector } from 'react-redux';
import { addPatternAction, patternsSelector } from 'controllers/project';
import { useTracking } from 'react-tracking';
import { getSaveNewPatternEvent, SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { hideModalAction, showModalAction } from 'controllers/modal';
import { STRING_PATTERN } from 'common/constants/patternTypes';
import { EmptyPatternAnalysis } from './emptyPatternAnalysis';

const PatternAnalysis = () => {
  const patterns = useSelector(patternsSelector);

  const { trackEvent } = useTracking();

  const dispatch = useDispatch();

  const savePattern = (pattern) => {
    trackEvent(getSaveNewPatternEvent(pattern.type));
    dispatch(addPatternAction(pattern));
    dispatch(hideModalAction());
  };

  const onAddPattern = () => {
    dispatch(
      showModalAction({
        id: 'createPatternAnalysisModal',
        data: {
          onSave: savePattern,
          pattern: {
            type: STRING_PATTERN,
            enabled: true,
          },
          patterns,
          isNewPattern: true,
          eventsInfo: {
            cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_BTN_CREATE_PATTERN_MODAL,
            closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_CREATE_PATTERN_MODAL,
          },
        },
      }),
    );
  };

  return (
    <>
      <EmptyPatternAnalysis onAddPattern={onAddPattern} />
    </>
  );
};

export default PatternAnalysis;
