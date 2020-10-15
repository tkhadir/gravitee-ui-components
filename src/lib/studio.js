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
import { html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import '../atoms/gv-icon';
import '../atoms/gv-tag';

// language=CSS
export const methods = css`
  gv-tag {
    font-family: monospace;
  }

  gv-tag.ALL {
    --gv-tag--bdc: #262626;
    --gv-tag--bgc: #262626;
    --gv-tag--c: white;
  }

  gv-tag.POST {
    --gv-tag--bdc: #fb8c00;
    --gv-tag--bgc: #fb8c00;
    --gv-tag--c: white;
  }

  gv-tag.PUT {
    --gv-tag--bdc: #039be5;
    --gv-tag--bgc: #039be5;
    --gv-tag--c: white;
  }

  gv-tag.GET {
    --gv-tag--bdc: #43a047;
    --gv-tag--bgc: #43a047;
    --gv-tag--c: white;
  }

  gv-tag.DELETE {
    --gv-tag--bdc: #e53935;
    --gv-tag--bgc: #e53935;
    --gv-tag--c: white;
  }

  .flow-path {
    margin-left: 0.2rem;
  }
`;

export function getFlowName (flow, withMethods = true, draggable = false, compact = true) {
  let rendering = [];
  if (flow) {
    if (draggable) {
      rendering.push(html`<gv-icon title="Drag for reorder" class="draggable-icon" shape="general:other#1"></gv-icon>`);
    }
    const methods = flow.methods || [];
    if (withMethods) {
      const renderingMethods = methods.map((method) => html`<gv-tag class="${method.toUpperCase()}" >${method.toUpperCase()}</gv-tag>`);
      if (compact && renderingMethods.length === 9) {
        rendering = [...rendering, html`<gv-tag major title="${methods.join('\n')}">ALL</gv-tag>`];
      }
      else if (compact && renderingMethods.length >= 3) {
        const renderingMethodsCompact = renderingMethods.slice(0, 2);
        renderingMethodsCompact.push(html`<gv-tag minor title="${methods.join('\n')}">+${renderingMethods.length - 2}</gv-tag>`);
        rendering = [...rendering, ...renderingMethodsCompact];
      }
      else {
        rendering = [...rendering, ...renderingMethods];
      }
    }

    const classes = {
      'flow-path': true,
      disabled: flow.disabled,
    };

    if (flow.name != null && flow.name.trim() !== '') {
      if (flow._dirty) {
        rendering.push(html`<div class="${classMap(classes)}"><mark>${flow.name}</mark></div>`);
      }
      else {
        rendering.push(html`<div class="${classMap(classes)}">${flow.name}</div>`);
      }
    }
    else {
      const path = flow.path;
      if (path) {
        const pathWithOperator = flow.operator === 'STARTS WITH' ? `${path.endsWith('/') ? path : `${path}/`}**` : path;
        if (flow._dirty) {
          rendering.push(html`<div class="${classMap(classes)}"><mark>${pathWithOperator}</mark></div>`);
        }
        else {
          rendering.push(html`<div class="${classMap(classes)}">${pathWithOperator}</div>`);
        }

      }
    }
  }
  return rendering;
}

export function uuid () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
