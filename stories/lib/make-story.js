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
import * as blockPreview from '@storybook/components/dist/blocks/Preview';
import { color, text } from '@storybook/addon-knobs';
import { sequence } from './sequence';
import customElements from '../../.docs/custom-elements.json';
// NOTE: Those dirty injects are work in progress

// Force html in preview examples
const oldPreview = blockPreview.Preview;
blockPreview.Preview = (pppp) => {
  return oldPreview({ ...pppp, language: 'html', isExpanded: false });
};

export function makeStory (...configs) {

  const { name, docs, css, component, dom, items: rawItems = [{}], events = [], simulations = [], docsOnly = false } = Object.assign({}, ...configs);
  const customElement = customElements.tags.find((tag) => tag.name === component) || {};
  const _events = customElement.events
    ? [...new Set([...events, ...customElement.events.map((e) => e.name)])]
    : events;

  const items = (typeof rawItems === 'function')
    ? rawItems()
    : rawItems;

  const storyFn = () => {

    const container = document.createElement('div');
    const shadow = container.attachShadow({ mode: 'open' });

    if (css != null) {
      const styles = document.createElement('style');
      styles.innerHTML = css;
      shadow.appendChild(styles);
    }

    if (dom != null) {
      const wrapper = document.createElement('div');
      shadow.appendChild(wrapper);
      dom(wrapper);
      return container;
    }
    const items = (typeof rawItems === 'function')
      ? rawItems()
      : rawItems;

    const components = items.map((props) => {
      let element = document.createElement(component);
      element = assignPropsToElement(element, props);
      shadow.appendChild(element);
      return element;
    });

    sequence(async (wait) => {
      for (const { delay, callback } of simulations) {
        await wait(delay);
        callback(components);
      }
    });

    if (customElement.cssProperties) {
      customElement.cssProperties.forEach((cssProperty) => {
        let value = cssProperty.default.replace(/"/g, '');
        if (cssProperty.type.toLowerCase() === 'color') {
          value = color(cssProperty.description, value);
        }
        else {
          value = text(cssProperty.description, value);
        }
        container.style.setProperty(cssProperty.name, value);
      });
    }

    return container;
  };

  const generatedSource = () => items
    .map(({ innerHTML = '', ...props }) => {

      const allPropertiesAndAttributes = Object.entries(props)
        .map(([name, value]) => {
          if (value === true) {
            return `${name}`;
          }
          if (typeof value === 'string' || typeof value === 'number') {
            return `${name}=${JSON.stringify(String(value))}`;
          }
          if (typeof value === 'object' && Array.isArray(value)) {
            return `.${name}='${JSON.stringify(value)}'`;
          }
          if (typeof value === 'object') {
            return `.${name}='${JSON.stringify(value)}'`;
          }
        })
        .filter((a) => a != null);

      const attrsAndProps = allPropertiesAndAttributes.length > 0
        ? ' ' + allPropertiesAndAttributes.join(' ')
        : '';

      return `<${component}${attrsAndProps}>${innerHTML}</${component}>`;
    })
    .join('\n');

  const domSource = () => {
    const container = document.createElement('div');
    dom(container);
    return container.innerHTML
      .replace(/<!---->/g, '')
      .trim();
  };

  const mdxSource = (dom != null)
    ? domSource()
    : generatedSource();

  storyFn.docs = docs;
  storyFn.css = css;
  storyFn.component = component;
  storyFn.items = items;
  storyFn.parameters = {
    actions: {
      handles: [..._events],
    },
    docsOnly,
    docs: {
      storyDescription: (docs || '').trim(),
    },
    storySource: {
      source: mdxSource,
    },
  };

  if (name != null) {
    storyFn.name = name;
  }

  return storyFn;
}

export function storyWait (delay, callback) {
  return { delay, callback };
}

function assignPropsToElement (element, props = {}) {
  Object.entries(props).forEach(([name, value]) => {
    if (name === 'style' || name === 'class') {
      element.setAttribute(name, value);
    }
    if (name === 'children') {
      value().forEach((child) => element.appendChild(child));
    }
    if (name === 'innerHTML') {
      element.innerHTML = value;
    }
    else if (typeof value === 'function') {
      if (name.startsWith('@')) {
        const eventName = name.substring(1);
        element.addEventListener(eventName, value);
      }
      else {
        element[name] = value;
      }
    }
    else if (typeof value === 'object') {
      element[name] = value;
    }
    else {
      element.setAttribute(name, value);
    }

  });
  return element;
}
