/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import notes from '../../.docs/gv-schema-form.md';
import '../../src/organisms/gv-schema-form';
import { makeStory } from '../lib/make-story';
import mixed from '../resources/schemas/mixed.json';
import policy from '../resources/schemas/rate-limit.json';

export default {
  title: 'organisms/gv-schema-form',
  component: 'gv-schema-form',
  parameters: {
    notes,
    options: {
      showPanel: false,
    },
  },
};

const conf = {
  component: 'gv-schema-form',
};

export const MixedEmpty = makeStory(conf, {
  items: [{
    schema: mixed,
    '@gv-schema-form:fetch-data': (event) => {
      const options = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('').map((key, index) => ({ value: `This is generated with ${key}` }));
      event.detail.element.options = options;
    },
  }],
});

const mixedValues = {
  body: '<xml></xml>',
  path: '/public',
  operator: 'EQUALS',
  resources: 'My resource',
  attributes: [{ name: 'John', value: 'Doe' }, { name: 'Foo', value: 'Bar' }],
  useResponseCacheHeaders: true,
  timeToLiveSeconds: 50,
  select: 'b',
  multiselect: ['a', 'b', 'c'],
};

export const Mixed = makeStory(conf, {
  items: [{
    schema: mixed,
    values: mixedValues,
    '@gv-schema-form:fetch-data': (event) => {
      const options = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('').map((key, index) => ({ value: `This is generated with ${key}` }));
      event.detail.element.options = options;
    },
  }],
});

export const Policy = makeStory(conf, {
  items: [{ schema: policy }],
});
