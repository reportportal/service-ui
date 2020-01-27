/*
 * Copyright 2019 EPAM Systems
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

export function getStorageItem(key) {
  return localStorage && localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
}
export function setStorageItem(key, value) {
  return localStorage && localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageItem(key) {
  localStorage && localStorage.removeItem(key);
}

export function updateStorageItem(key, value = {}) {
  const previousItem = getStorageItem(key) || {};
  return setStorageItem(key, { ...previousItem, ...value });
}

export function getSessionItem(key) {
  return sessionStorage && sessionStorage.getItem(key)
    ? JSON.parse(sessionStorage.getItem(key))
    : null;
}
export function setSessionItem(key, value) {
  return sessionStorage && sessionStorage.setItem(key, JSON.stringify(value));
}

export function removeSessionItem(key) {
  sessionStorage && sessionStorage.removeItem(key);
}

export function updateSessionItem(key, value = {}) {
  const previousItem = getSessionItem(key) || {};
  return setSessionItem(key, { ...previousItem, ...value });
}
