import { useState, useCallback } from 'react';
import { fetch } from 'common/utils';
import { activeProjectSelector } from 'controllers/user';
import { useSelector } from 'react-redux';
import { URLS } from 'common/urls';

export const useFetchDashboardConfig = (dashboardId) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeProject = useSelector(activeProjectSelector);
  const url = URLS.dashboardConfig(activeProject, dashboardId);

  const fetchConfig = useCallback(async () => {
    if (!activeProject || !dashboardId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      setConfig(response);
      return response;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeProject, dashboardId, url]);

  return { config, fetchConfig, loading, error };
};
