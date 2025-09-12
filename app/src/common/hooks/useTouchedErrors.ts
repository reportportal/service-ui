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

import { useMemo } from 'react';

interface FieldMeta {
  touched?: boolean;
  visited?: boolean;
  [key: string]: unknown;
}

interface FormFields {
  [fieldName: string]: FieldMeta;
}

interface SyncErrors {
  [fieldName: string]: unknown;
}

export const useTouchedErrors = (fields: FormFields, syncErrors: SyncErrors): boolean => {
  return useMemo(() => {
    const checkFieldErrors = (fieldName: string, field: FieldMeta, errors: SyncErrors): boolean => {
      if (field?.touched && errors?.[fieldName]) {
        return true;
      }

      if (field && typeof field === 'object' && !field.touched && !field.visited) {
        return Object.keys(field).some((nestedFieldName) => {
          const nestedField = field[nestedFieldName] as FieldMeta;
          return checkFieldErrors(nestedFieldName, nestedField, errors?.[fieldName] as SyncErrors);
        });
      }

      return false;
    };

    return Object.keys(fields).some((fieldName) => {
      const field = fields[fieldName];
      return checkFieldErrors(fieldName, field, syncErrors);
    });
  }, [fields, syncErrors]);
};
