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
import { afterEach, beforeEach, describe, expect, test, jest } from '@jest/globals';
import { Page, querySelector } from '../lib/test-utils';
import '../../src/organisms/gv-schema-form';
import mixed from '../resources/schemas/mixed.json';

describe('S C H E M A  F O R M', () => {

  let page;
  let component;

  beforeEach(() => {
    page = new Page();
    component = page.create('gv-schema-form', {
      schema: mixed,
    });
  });

  afterEach(() => {
    page.clear();
  });

  test('should create element', () => {
    expect(window.customElements.get('gv-schema-form')).toBeDefined();
    expect(component).toEqual(querySelector('gv-schema-form'));
    expect(Object.keys(component._elements)).toEqual([
      'body',
      'operator',
      'path',
      'resources',
      'attributes',
      'timeToLiveSeconds',
      'useResponseCacheHeaders',
      'select',
      'multiselect',
    ]);
  });

  test('should update dirty state when user change the form', () => {
    component.values = {
      timeToLiveSeconds: 5,
      body: '<xml></xml>',
    };
    expect(component.dirty).toBeUndefined();

    component._onChange('timeToLiveSeconds', { detail: 6 });

    expect(component.dirty).toEqual(true);
  });

  test('should update values when user change the form', async (done) => {
    component.values = {
      timeToLiveSeconds: 5,
      body: '<xml></xml>',
    };

    component.addEventListener('gv-schema-form:change', ({ detail }) => {
      expect(detail.values).toEqual({
        timeToLiveSeconds: 6,
        body: '<xml></xml>',
      });
      done();
    });

    component._onChange('timeToLiveSeconds', { detail: 6 });

  });

  test('should catch event when submit form', (done) => {
    const values = {
      timeToLiveSeconds: 5,
      body: '<xml></xml>',
    };
    component.values = values;

    component.addEventListener('gv-schema-form:submit', ({ detail }) => {
      expect(detail.values).toEqual(values);
      done();
    });

    component._onSubmit();

  });

  test('should catch custom event after create control', (done) => {

    component = page.create('gv-schema-form', {
      schema: mixed,
    });

    component.addEventListener('gv-schema-form:fetch-data', ({ detail }) => {
      expect(detail.name).toEqual('fetch-data');
      expect(detail.element.tagName.toLowerCase()).toEqual('gv-autocomplete');
      done();
    });

  });

  test('should submit form when values respect constraints', (done) => {
    component.values = {
      path: '/my-path',
      operator: 'STARTS WITH',
      timeToLiveSeconds: 5,
      multiselect: ['a'],
    };
    component.dirty = true;
    component.updateComplete.then(() => {
      expect(component._findOptionalInvalid()).toBeUndefined();
      expect(component.canSubmit()).toBeTruthy();
      done();
    });
  });

  test('should remove null values in array on submit', (done) => {
    expect.assertions(1);
    const attribute = { name: 'foo', value: 'bar' };
    const values = {
      path: '/my-path',
      operator: 'STARTS WITH',
      timeToLiveSeconds: 5,
      multiselect: ['a'],
      attributes: [attribute, null, undefined],
    };
    component.values = values;
    component.dirty = true;

    component.addEventListener('gv-schema-form:submit', ({ detail }) => {
      expect(detail.values).toEqual({
        ...values, attributes: [attribute],
      });
      done();
    });
    component._onSubmit();
  });

  test('should add item to array property', (done) => {
    const container = {
      target: {
        parentElement: {
          querySelectorAll: jest.fn(() => []),
          insertBefore: jest.fn(),
        },
      },
    };
    const attributes = [{ name: 'foo', value: 'bar' }, null, undefined];
    const values = {
      path: '/my-path',
      operator: 'STARTS WITH',
      timeToLiveSeconds: 5,
      multiselect: ['a'],
      attributes,
    };
    component.values = values;

    component.updateComplete.then(() => {
      component._onAddItem('attributes', mixed.properties.attributes, container);
      expect(component.values).toEqual({ ...values, attributes: [...attributes, {}] });
      done();
    });

  });

  test('should remove item to array property', (done) => {
    const container = {
      remove: jest.fn(),
    };
    const attribute = { name: 'foo', value: 'bar' };
    const values = {
      path: '/my-path',
      operator: 'STARTS WITH',
      timeToLiveSeconds: 5,
      multiselect: ['a'],
      attributes: [attribute, null, undefined],
    };
    component.values = values;

    component.updateComplete.then(() => {
      component._onRemoveItem('attributes', 0, container);
      expect(component.values).toEqual({ ...values, attributes: [null, null, undefined] });
      expect(container.remove).toBeCalledTimes(1);
      done();
    });

  });

  test('should not submit form when required values are empty', (done) => {
    component.dirty = true;
    component.updateComplete.then(() => {
      expect(Object.keys(component._elements)).toEqual([
        'body',
        'operator',
        'path',
        'resources',
        'attributes',
        'timeToLiveSeconds',
        'useResponseCacheHeaders',
        'select',
        'multiselect',
      ]);
      expect(component.canSubmit()).toBeFalsy();
      done();
    });

  });

});
