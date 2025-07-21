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

import { Organization, OrganizationItem } from './organizationItem/organizationItem';

interface OrganizationAssignmentProps {
  onChange?: (value: Organization | Organization[]) => void;
  value?: Organization | Organization[];
  isMultiple?: boolean;
}

export const OrganizationAssignment = ({
  value,
  onChange,
  isMultiple = false,
}: OrganizationAssignmentProps) => {
  const multiple = isMultiple && Array.isArray(value);

  const updateItem = (updates: Partial<Organization>, index?: number) => {
    if (multiple) {
      const updated = [...value];
      updated[index] = { ...updated[index], ...updates };
      onChange?.(updated);
    } else {
      onChange?.({ ...value, ...updates });
    }
  };

  const removeItem = (index: number) => {
    if (multiple) {
      const updated = [...value];
      updated.splice(index, 1);
      onChange?.(updated);
    }
  };

  if (multiple) {
    return (
      <div>
        {value.map((org: Organization, index: number) => (
          <div key={org.id}>
            <OrganizationItem
              value={org}
              onChange={(updates) => updateItem(updates, index)}
              onRemove={() => removeItem(index)}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!isMultiple && !Array.isArray(value)) {
    return <OrganizationItem value={value} onChange={(updates) => updateItem(updates)} />;
  }
};
