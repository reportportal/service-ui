import { FC } from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
import { Checkbox, Dropdown, FieldText } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { BtsIntegrationSelector } from 'pages/inside/common/btsIntegrationSelector';
import { commonMessages } from 'pages/inside/common/common-messages';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { getDefaultOptionValueKey } from 'pages/inside/stepPage/modals/postIssueModal/utils';
import {
  INCLUDE_ATTACHMENTS_KEY,
  INCLUDE_COMMENTS_KEY,
  INCLUDE_LOGS_KEY,
} from 'pages/inside/stepPage/modals/postIssueModal/constants';

import { DynamicField, BTSIntegration } from '../types';

import styles from './PostBTSIssueForm.scss';

const cx = createClassnames(styles);

interface PostBTSIssueFormProps {
  namedBtsIntegrations: Record<string, BTSIntegration[]>;
  pluginName: string;
  integrationId: number;
  fields: DynamicField[];
  onChangePlugin: (pluginName: string) => void;
  onChangeIntegration: (integrationId: number) => void;
}

// Parse value from array format to single value for form fields
const formatValue = (value?: string[]) => value?.[0] ?? '';
const parseValue = (value: string) => (value ? [value] : []);

const renderDynamicField = (field: DynamicField, defaultOptionValueKey: string) => {
  const hasDefinedValues = field.definedValues && field.definedValues.length > 0;

  if (hasDefinedValues) {
    const options = field.definedValues.map((item) => ({
      value: item[defaultOptionValueKey as keyof typeof item] || item.valueName,
      label: item.valueName,
    }));

    return (
      <FieldProvider name={field.id} format={formatValue} parse={parseValue}>
        <Dropdown
          label={field.fieldName}
          options={options}
          disabled={field.disabled}
          mobileDisabled
          value=""
          onChange={() => {}}
        />
      </FieldProvider>
    );
  }

  return (
    <FieldProvider name={field.id} format={formatValue} parse={parseValue}>
      <FieldErrorHint provideHint={false}>
        <FieldText
          label={field.fieldName}
          placeholder={`Enter ${field.fieldName.toLowerCase()}`}
          disabled={field.disabled}
          defaultWidth={false}
          isRequired={field.required}
        />
      </FieldErrorHint>
    </FieldProvider>
  );
};

export const PostBTSIssueForm: FC<PostBTSIssueFormProps> = ({
  namedBtsIntegrations,
  pluginName,
  integrationId,
  fields,
  onChangePlugin,
  onChangeIntegration,
}) => {
  const { formatMessage } = useIntl();
  const defaultOptionValueKey = getDefaultOptionValueKey(pluginName) as string;

  const dataFieldsConfig = [
    {
      name: INCLUDE_ATTACHMENTS_KEY,
      title: formatMessage(commonMessages.attachments),
    },
    {
      name: INCLUDE_LOGS_KEY,
      title: formatMessage(commonMessages.logs),
    },
    {
      name: INCLUDE_COMMENTS_KEY,
      title: formatMessage(commonMessages.comments),
    },
  ];

  return (
    <form className={cx('post-issue-form')}>
      <BtsIntegrationSelector
        namedBtsIntegrations={namedBtsIntegrations}
        pluginName={pluginName}
        integrationId={integrationId}
        onChangeIntegration={onChangeIntegration}
        onChangePluginName={onChangePlugin}
        theme="light"
      />
      <div className={cx('dynamic-fields')}>
        {!isEmpty(fields) &&
          fields.map((field) => (
            <div key={field.id}>{renderDynamicField(field, defaultOptionValueKey)}</div>
          ))}
      </div>
      <div className={cx('included-data-config')}>
        {dataFieldsConfig.map((item) => (
          <FieldProvider key={item.name} name={item.name} format={Boolean}>
            <Checkbox>
              <span className={cx('field-label')}>{item.title}</span>
            </Checkbox>
          </FieldProvider>
        ))}
      </div>
    </form>
  );
};
