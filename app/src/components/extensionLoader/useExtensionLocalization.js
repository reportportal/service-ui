/*
 * Copyright 2026 EPAM Systems
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

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { langSelector } from 'controllers/lang';
import { extensionManifestSelector } from 'controllers/plugins/uiExtensions';
import { registerExtensionMessagesAction } from 'controllers/plugins/uiExtensions/localization';
import { DEFAULT_LANGUAGE } from 'common/constants/supportedLanguages';
import {
  fetchExtensionLocalizationFile,
  resolveLocaleFileName,
} from './fetchExtensionLocalizationFile';

// Contract: `localization.messages` is a flat file-name template with a single `{lang}`
// placeholder and no path separator (host serves flat fileKey only).
const isValidMessagesTemplate = (template) =>
  typeof template === 'string' && template.includes('{lang}') && !template.includes('/');

/**
 * Loads and registers an extension's localization messages for the current language.
 * Registration is keyed by `pluginName`; the store is cleared on language change
 * (CHANGE_LANG_ACTION) and manifest override (UPDATE_EXTENSION_MANIFEST), which
 * triggers a re-fetch here. Legacy plugins (no valid `localization`) are a no-op
 * and rely on core strings + `defaultMessage`.
 */
export const useExtensionLocalization = (extension) => {
  const { pluginName, url: baseUrl } = extension;
  const dispatch = useDispatch();
  const lang = useSelector(langSelector);
  const manifest = useSelector((state) => extensionManifestSelector(state, pluginName));
  const messagesTemplate = manifest?.localization?.messages;

  useEffect(() => {
    // English (default language) is the reference language, already covered by `defaultMessage`;
    // plugins aren't required to ship `locale-en.json`, so skip the guaranteed 404.
    if (!isValidMessagesTemplate(messagesTemplate) || lang === DEFAULT_LANGUAGE) {
      return undefined;
    }

    let cancelled = false;
    const fileName = resolveLocaleFileName(messagesTemplate, lang);

    fetchExtensionLocalizationFile({ pluginName, baseUrl, fileName })
      .then((messages) => {
        // Guard against a stale response after the language/source already changed.
        if (!cancelled) {
          dispatch(registerExtensionMessagesAction(pluginName, messages));
        }
      })
      .catch(() => {
        // Fallback to core strings + defaultMessage; no extra request.
      });

    return () => {
      cancelled = true;
    };
  }, [pluginName, baseUrl, lang, messagesTemplate, dispatch]);
};
