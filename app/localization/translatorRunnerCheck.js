import manageTranslations from 'react-intl-translations-manager';
import { config } from './config';

manageTranslations(
  Object.assign(
    {
      overridePrinters: {
        printLanguageReport: (report) => {
          if (
            report.report.added.length ||
            report.report.untranslated.length ||
            report.report.deleted.length
          ) {
            throw new Error('Localization is in an unstable state');
          }
        },
      },
    },
    config,
  ),
);
