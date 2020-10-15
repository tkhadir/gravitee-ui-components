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
import '../molecules/gv-table';
import '../atoms/gv-button';
import '../atoms/gv-input';
import '../atoms/gv-icon';
import { uuid } from '../lib/studio';
import { dispatchCustomEvent } from '../lib/events';

export class GvProperties extends LitElement {

  static get properties () {
    return {
      properties: { type: Array },
      _properties: { type: Array, attribute: false },
      providers: { type: Array },
      _propertySchemaForm: { type: Object, attribute: false },
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

        .properties {
          display: flex;
          height: 100%;
          width: 100%;
        }

        gv-resizable-views {
          height: 100%;
          width: 100%;
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

        .table-box {
          width: 100%;
        }
        
        gv-table {
          display: flex;
          margin: 1rem;
        }
        

        .properties-bottom-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        
        .table-box {
          border-left: 1px solid #BFBFBF;
        }
      `,
    ];
  }

  constructor () {
    super();
    this.properties = [];
    this.types = [];
    this._currentResource = null;
  }

  set properties (properties) {
    this._properties = this._generateId(properties);
  }

  get properties () {
    return this._properties;
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

  _isNewLineTable (line) {
    return line._new === true;
  }

  _onInput (item, event, target) {
    if (this._isNewLineTable(item)) {
      target.parentElement.parentElement.querySelector('gv-button').disabled = this._disabledNewLine(item);
    }
    else {
      dispatchCustomEvent(this, 'change', { properties: this.properties });
    }
  }

  _addProperty (item) {
    delete item._new;
    this.properties = [...this.properties, item];
    dispatchCustomEvent(this, 'change', { properties: this.properties });
  }

  _removeProperty (item) {
    this.properties = this.properties.filter((property) => property !== item);
    dispatchCustomEvent(this, 'change', { properties: this.properties });
  }

  _disabledNewLine (item) {
    return item.name == null || item.value == null || item.name.trim() === '' || item.value.trim() === '';
  }

  _onSubmitPropertyForm () {

  }

  _onConfigureDynamicProperties () {
    const providers = this.providers.map((provider) => ({ label: provider.name, value: provider.id }));
    const defaultProvider = this.providers[0];
    const defaultSchema = {
      properties: {
        interval: {
          type: 'integer',
          title: 'Polling frequency interval',
        },
        unit: {
          type: 'string',
          title: 'Time unit',
          enum: ['SECONDS', 'MINUTES', 'HOURS'],
        },
        provider: {
          type: 'string',
          title: 'Provider type',
          enum: providers,
          default: defaultProvider.id,
        },
      },
      required: [
        'interval',
        'unit',
        'provider',
      ],
    };

    this._propertySchemaForm = {
      properties: { ...defaultSchema.properties, ...defaultProvider.schema.properties },
      required: [...defaultSchema.required, ...defaultProvider.schema.required],
    };
    this.dynamicProperty = {
      provider: defaultProvider.id,
    };
    this._maximizeBottomView();
  }

  _onClosePropertySchemaForm () {
    this._propertySchemaForm = null;
    this._maximizeTopView();
  }

  render () {
    const options = {
      data: [
        {
          field: 'name',
          label: 'Name',
          type: 'gv-input',
          attributes: {
            clipboard: (item) => !this._isNewLineTable(item),
            placeholder: 'Name of property',
            required: true,
            'ongv-input:input': this._onInput.bind(this),
            small: true,
          },
        },
        {
          field: 'value',
          label: 'Value',
          type: 'gv-input',
          attributes: {
            placeholder: 'Value of property',
            required: true,
            'ongv-input:input': this._onInput.bind(this),
            small: true,
          },
        },
        { field: 'dynamic', label: 'Dynamic' },
        {
          type: 'gv-button',
          width: '100px',
          attributes: {
            'ongv-button:click': (item, event, target) => this._isNewLineTable(item) ? this._addProperty(item, target) : this._removeProperty(item, target),
            innerHTML: (item) => this._isNewLineTable(item) ? 'Add' : 'Remove',
            danger: (item) => !this._isNewLineTable(item),
            outlined: true,
            small: true,
            disabled: (item) => this._isNewLineTable(item) && this._disabledNewLine(item),
            icon: (item) => this._isNewLineTable(item) ? 'code:plus' : 'home:trash',
          },
        },
      ],
    };

    const properties = [...this.properties, { name: '', value: '', _new: true }];

    const table = html`<gv-table .options="${options}" 
                                  .items="${properties}"
                                  order="name"
                                  rowheight="40px"></gv-table>`;

    if (this.providers && this.providers.length > 0) {
      const title = 'Configure dynamic properties';
      const icon = 'tools:tools';
      return html`<div class="properties">
                  <gv-resizable-views>
                    <div slot="top">${table}</div>
                    <div slot="bottom">
                        ${this._propertySchemaForm ? html`
                          <div class="header">
                              <gv-icon shape="${icon}"></gv-icon>
                              <div class="title">${title}</div>
                              <gv-button link @gv-button:click="${this._onClosePropertySchemaForm}" title="Close ${title}">Close</gv-button>
                          </div>
                          <gv-schema-form 
                            .schema="${this._propertySchemaForm}"
                            .values="${this.dynamicProperty}" 
                            @gv-schema-form:cancel="${this._onClosePropertySchemaForm}"
                            @gv-schema-form:submit="${this._onSubmitPropertyForm}"></gv-schema-form>`
        : html`<div class="properties-bottom-container">
                <gv-button icon="${icon}" @gv-button:click="${this._onConfigureDynamicProperties}" outlined>${title}</gv-button>
                </div>`}
                    </div>
                  </gv-resizable-views>
                </div>`;
    }
    else {
      return html`<div class="properties">
                    <div class="table-box">
                      ${table}  
                    </div>
                  </div>`;
    }

  }

}

window.customElements.define('gv-properties', GvProperties);
