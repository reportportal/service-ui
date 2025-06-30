import { useState, useEffect } from 'react';
import { fetch } from 'common/utils';

export const useFetchedResponse = (url) => {
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!url) return;

    const fetchText = async () => {
      try {
        const res = await fetch(url);
        setResponse(res);
      } catch (err) {
        setResponse('');
      }
    };

    fetchText();
  }, [url]);

  return response;
};
