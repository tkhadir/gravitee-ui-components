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
import { css, html, LitElement } from 'lit-element';

import './gv-schema-form';
import './gv-resizable-views';
import './gv-documentation';
import '../molecules/gv-table';
import '../atoms/gv-button';
import '../atoms/gv-switch';
import '../atoms/gv-icon';
import { dispatchCustomEvent } from '../lib/events';
import { uuid } from '../lib/studio';

export class GvResources extends LitElement {

  static get properties () {
    return {
      resources: { type: Array },
      _resources: { type: Array, attribute: false },
      types: { type: Array },
      documentation: { type: Object },
      _currentResource: { type: Object, attribute: false },
    };
  }

  static get styles () {
    return [
      // language=CSS
      css`
        :host {
          box-sizing: border-box;
          height: 100%;
          width: 100%;
          display: block;
        }

        .resources {
          display: flex;
          height: 100%;
          width: 100%;
        }

        gv-resizable-views {
          height: 100%;
          width: 100%;
        }

        .two-cols {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .two-cols > * {
          flex: 1;
        }

        .two-cols > *:last-child {
          border-left: 1px solid #D9D9D9;
        }

        .documentation-content {
          padding: 0.5rem 1rem;
        }

        .header {
          display: flex;
          border-bottom: 1px solid #D9D9D9;
          box-sizing: border-box;
          height: 41px;
          --gv-icon--s: 26px;
          --gv-icon--c: #BFBFBF;
          align-items: center;
          padding: 0 1rem;
        }

        .header .title {
          color: #262626;
          font-size: 18px;
          display: flex;
          align-items: center;
          flex: 1;
          margin-left: 0.5rem;
          text-transform: capitalize;
          letter-spacing: normal;
        }

        gv-schema-form {
          margin: 0;
        }

        gv-table {
          display: flex;
          margin: 1rem;
        }

        .resources-bottom-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
      `,
    ];
  }

  constructor () {
    super();
    this.resources = [];
    this.types = [];
    this._currentResource = null;
    this._emptymessage = 'No resources';
  }

  set resources (resources) {
    this._resources = this._generateId(resources);
  }

  get resources () {
    return this._resources;
  }

  _generateId (list) {
    if (list) {
      return list.map((e) => {
        if (e._id == null) {
          e._id = uuid();
        }
        return e;
      });
    }
    return list;
  }

  _getResizableViews () {
    return this.shadowRoot.querySelector('gv-resizable-views');
  }

  _maximizeTopView () {
    this._getResizableViews().maximizeTop();
  }

  _maximizeBottomView () {
    this._getResizableViews().maximizeBottom();
  }

  _splitMainViews () {
    this._getResizableViews().split();
  }

  _onCancelResourceForm () {
    this._currentResource = null;
    this.documentation = null;
    this._maximizeTopView();
  }

  _removeResource (item) {
    this.resources = this.resources.filter((resource) => resource._id !== item._id);
    this._onCancelResourceForm();
    dispatchCustomEvent(this, 'change', { resources: this.resources });
  }

  _buildResourceSchema (resourceType) {
    const resourceTypes = this.types.map((resource) => ({ label: resource.name, value: resource.id }));
    const defaultSchema = {
      properties: {
        type: {
          type: 'string',
          title: 'Resource type',
          enum: resourceTypes,
          default: resourceType.id,
        },
        name: {
          type: 'string',
          title: 'Resource name',
        },
      },
      required: ['type', 'name'],
    };
    return {
      properties: { ...defaultSchema.properties, ...resourceType.schema.properties },
      required: [...defaultSchema.required, ...resourceType.schema.required],
    };
  }

  _onCreateResource () {
    const defaultResourceType = this.types[0];
    const schema = this._buildResourceSchema(defaultResourceType);

    this._currentResource = {
      type: defaultResourceType.id,
      title: 'Create resource',
      icon: 'code:plus',
      schema,
      values: {},
      submitLabel: 'Add',
    };
    this._maximizeBottomView();
  }

  _onSubmitResourceForm ({ detail }) {
    const { _id, type, name, enabled, ...configuration } = detail.values;

    const resource = {
      _id,
      type,
      name,
      enabled,
      configuration,
    };

    if (detail.values._id != null) {
      let index = -1;
      this.resources.find((r, i) => {
        if (r._id === resource._id) {
          index = i;
        }
      });
      this.resources[index] = resource;
    }
    else {
      if (this.resources == null) {
        this.resources = [];
      }
      resource._id = uuid();
      resource.enabled = true;
      this.resources.push(resource);
    }
    this._onCancelResourceForm();
    dispatchCustomEvent(this, 'change', { resources: this.resources });
  }

  _onChangeResourceForm ({ detail }) {
    if (detail.values.type && this._currentResource.type !== detail.values.type) {
      this._currentResource.type = detail.values.type;
      const resourceType = this._findResourceById(this._currentResource.type);
      this._currentResource.schema = this._buildResourceSchema(resourceType);
      this.requestUpdate();
    }
  }

  _findResourceById (id) {
    return this.types.find((resource) => resource.id === id);
  }

  _onEditResource (resource) {
    const values = { ...resource, ...resource.configuration };
    delete values.configuration;
    const resourceType = this._findResourceById(resource.type);
    this._currentResource = {
      title: 'Edit resource',
      icon: 'design:edit',
      schema: this._buildResourceSchema(resourceType),
      values,
      submitLabel: 'Update',
    };
    this._splitMainViews();
    this._onFetchDocumentation();
  }

  _onCloseDocumentation () {
    this.documentation = null;
  }

  _getCurrentResourceType () {
    return this._currentResource ? this._findResourceById(this._currentResource.values.type) : null;
  }

  _onFetchDocumentation () {
    dispatchCustomEvent(this, 'fetch-documentation', { resourceType: this._getCurrentResourceType() });
  }

  _onChangeResourceState () {
    dispatchCustomEvent(this, 'change', { resources: this.resources });
  }

  render () {
    const options = {
      data: [
        { field: 'name', label: 'Name' },
        { field: 'type', label: 'Type' },
        {
          field: 'enabled',
          label: 'Enabled',
          type: 'gv-switch',
          attributes: {
            'ongv-switch:input': (item) => this._onChangeResourceState(item),
          },
        },
        {
          type: 'gv-button',
          width: '100px',
          attributes: {
            onClick: (item) => this._onEditResource(item),
            small: true,
            innerHTML: 'edit',
            outlined: true,
            icon: 'design:edit',
          },
        },
        {
          type: 'gv-button',
          width: '100px',
          attributes: {
            onClick: (item) => this._removeResource(item),
            small: true,
            innerHTML: 'remove',
            danger: true,
            outlined: true,
            icon: 'home:trash',
          },
        },
      ],
    };

    return html`<div class="resources">
                  <gv-resizable-views>
                    <div slot="top">
                      <gv-table .options="${options}" 
                                .items="${this.resources}"
                                emptymessage="${this._emptymessage}"
                                order="name"
                                rowheight="40px"></gv-table>
                    </div>
                    <div slot="bottom">
                      ${this._currentResource ? html`
                        <div class="two-cols">
                            <div>
                              <div class="header">
                                <gv-icon shape="${this._currentResource.icon}"></gv-icon>
                                <div class="title">${this._currentResource.title}</div>
                                ${this.documentation ? '' : html`<gv-button link @gv-button:click="${this._onFetchDocumentation}" title="See ${this._currentResource.title} documentation">See documentation</gv-button>`}
                              </div>
                              <gv-schema-form 
                                .schema="${this._currentResource.schema}"
                                .values="${this._currentResource.values}" 
                                submitLabel="${this._currentResource.submitLabel}"
                                @gv-schema-form:change="${this._onChangeResourceForm}"
                                @gv-schema-form:cancel="${this._onCancelResourceForm}"
                                @gv-schema-form:submit="${this._onSubmitResourceForm}"></gv-schema-form>
                            </div>
                            ${this.documentation ? html`<gv-documentation .text="${this.documentation.content}" .image="${this.documentation.image}" @gv-documentation:close="${this._onCloseDocumentation}"></gv-documentation>` : ''}
                          </div>`
      : html`<div class="resources-bottom-container"><gv-button icon="code:plus" @gv-button:click="${this._onCreateResource}" outlined>Create resource</gv-button></div>`}
                    </div>
                  </gv-resizable-views>
                </div>`;
  }

}

window.customElements.define('gv-resources', GvResources);
