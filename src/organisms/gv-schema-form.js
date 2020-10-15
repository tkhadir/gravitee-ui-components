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
import { css, LitElement, html } from 'lit-element';

import '../atoms/gv-input';
import '../atoms/gv-select';
import '../atoms/gv-checkbox';
import '../molecules/gv-code';
import '../atoms/gv-autocomplete';
import { dispatchCustomEvent } from '../lib/events';

/**
 * Schema form component
 *
 * @attr {Object} schema - the schema form configuration
 * @attr {Object} values - the values of fields
 * @attr {Object} errors - the map of errors by input key
 */
export class GvSchemaForm extends LitElement {

  static get properties () {
    return {
      schema: { type: Object },
      errors: { type: Object },
      values: { type: Object },
      submitLabel: { type: String },
      _values: { type: Object, attribute: false },
      _elements: { type: Object, attribute: false },
      dirty: { type: Boolean, reflect: true },
      hideDeprecated: { type: Boolean, attribute: 'hide-deprecated' },
    };
  }

  static get styles () {
    return [
      // language=CSS
      css`
        :host {
          box-sizing: border-box;
          margin: 0.2rem;
        }

        .form__control-description, .form__control-error {
          font-size: 12px;
          margin: 0 0.5rem;
        }

        .form__control-error {
          color: red;
        }

        .form__item {
          border: 1px solid lightgray;
          border-radius: 4px;
          margin: 0.5rem 0;
          width: 100%;
        }

        .form__control {
          margin: 0.5rem;
          display: flex;
        }

        .form__control-label {
          display: flex;
          border-bottom: 1px solid lightgray;
        }

        label {
          margin: 0.2rem;
        }

        .form__control-label label {
          font-weight: bold;
          flex: 1;
        }

        .form__control-array, .form__control-object {
          display: flex;
          flex-direction: column;
        }

        .form__control-enum {
          display: flex;
          align-items: end;
        }

        .form__control-enum gv-checkbox {
          margin-bottom: 0.5rem;
        }

        .form__control-array gv-button {
          align-self: flex-end;
        }

        .form_control-inline {
          display: flex;
          flex-direction: row;
          margin: 0;
        }

        .form_control-inline > * {
          flex: 1;
        }

        gv-select, gv-input, gv-code {
          width: 100%;
          margin: 0.2rem 0;
        }

        .form__control-group-title {
          border-bottom: 1px solid #BFBFBF;
          padding: 0.5rem;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          margin: 1rem 3rem;
        }
      `,
    ];
  }

  constructor () {
    super();
    this.hideDeprecated = true;
    this._values = {};
    this._elements = {};
    this.submitLabel = 'Ok';
  }

  set values (values) {
    if (values) {
      this._initialValues = { ...values };
      this._values = { ...values };
      Object.keys(this._values).forEach((key) => {
        const element = this._elements[key];
        if (element) {
          element.value = this._values[key];
        }
      });
      this._formPart = null;
    }
  }

  get values () {
    return this._values;
  }

  reset () {
    this._values = { ...this._initialValues };
    this.dirty = false;
  }

  _onSubmit () {
    Object.keys(this._values).forEach((key) => {
      if (Array.isArray(this._values[key])) {
        this._values[key] = this._values[key].filter((value) => value != null);
      }
    });
    this._initialValues = { ...this._values };
    this.dirty = false;
    dispatchCustomEvent(this, 'submit', { values: this._values });
  }

  _onCancel () {
    this.dirty = false;
    dispatchCustomEvent(this, 'cancel');
  }

  _getSubmitBtn () {
    return this.shadowRoot.querySelector('#submit');
  }

  _change () {
    dispatchCustomEvent(this, 'change', { values: this._values });
    if (this.canSubmit()) {
      this._getSubmitBtn().removeAttribute('disabled', true);
    }
    else {
      this._getSubmitBtn().setAttribute('disabled', true);
    }
  }

  _onChange (key, e) {
    if (key) {
      this.dirty = true;
      this._values[key] = e.detail;
      this._change();
    }
    else {
      // Special case for array
      const dataset = e.target.parentElement.dataset;
      if (dataset.key) {
        if (this._values[dataset.name][dataset.index] == null) {
          this._values[dataset.name][dataset.index] = {};
        }
        this._values[dataset.name][dataset.index][dataset.key] = e.detail;
        this._change();
      }
    }
  }

  _isCodemirror (control) {
    return control['x-schema-form'] && control['x-schema-form'].type === 'codemirror';
  }

  _isAutocomplete (control) {
    return control['x-schema-form'] && control['x-schema-form'].event != null;
  }

  _getElementName (control) {
    if (control.enum && !this._isAutocomplete(control)) {
      return 'gv-select';
    }
    else if (control.type === 'array') {
      return 'gv-button';
    }
    else if (control.type === 'boolean') {
      return 'gv-checkbox';
    }
    else if (this._isCodemirror(control)) {
      return 'gv-code';
    }
    return 'gv-input';
  }

  _onRemoveItem (name, index, container) {
    if (this._values[name]) {
      this._values[name] = this._values[name].map((e, i) => {
        if (i === index) {
          return null;
        }
        return e;
      });
    }
    container.remove();
    this._onChange(name, { detail: this._values[name] });
  }

  _onAddItem (name, control, event) {
    const parent = event.target.parentElement;
    const container = document.createElement('div');
    container.className = 'form__item';
    const index = parent.querySelectorAll(`.${container.className}`).length;
    container.dataset.index = index;
    const value = this._values[name] && this._values[name].length > index ? this._values[name][index] : control.default;

    const labelContainer = document.createElement('div');
    labelContainer.className = 'form__control form__control-label';
    const label = document.createElement('label');
    label.innerHTML = control.items.title;

    const closeItemBtn = document.createElement('gv-button');
    closeItemBtn.icon = 'general:close';
    closeItemBtn.link = true;
    closeItemBtn.addEventListener('gv-button:click', this._onRemoveItem.bind(this, name, index, container));
    labelContainer.append(label);
    labelContainer.append(closeItemBtn);
    container.append(labelContainer);
    if (control.items.type === 'object') {
      const controlKeys = Object.keys(control.items.properties);
      controlKeys.forEach((key) => {
        const subControl = control.items.properties[key];
        const isRequired = control.items.required && control.items.required.includes(key);
        const isDisabled = control.items.disabled && control.items.disabled.includes(key);
        const element = this._renderControl(subControl, (value != null ? value[key] : null) || subControl.default, isRequired, isDisabled);
        element.dataset.index = index;
        element.dataset.name = name;
        element.dataset.key = key;
        container.appendChild(element);
      });
    }
    else {
      const isRequired = control.items.required;
      const isDisabled = control.items.disabled;
      const element = this._renderControl(control.items, value, isRequired, isDisabled);
      container.appendChild(element);
    }

    parent.insertBefore(container, event.target);

    this._onChange(name, { detail: [...this._values[name], {}] });
  }

  _renderControl (control, value = null, isRequired = false, isDisabled = false, error = null, key, groupContainer = null) {

    if (this.hideDeprecated === true && control.deprecated === 'true') {
      return null;
    }

    const container = document.createElement('div');
    const controlType = control.enum ? 'enum' : control.type;
    container.className = `form__control form__control-${controlType}`;
    if (control.type === 'object') {
      if (control.title) {
        const title = document.createElement('div');
        title.innerHTML = control.title;
        title.title = control.title;
        title.className = 'form__control-group-title';
        container.appendChild(title);
      }
      const keys = Object.keys(control.properties);
      if (keys.length <= 2) {
        container.classList.add('form_control-inline');
      }
      keys.forEach((key) => {
        const isRequired = control.required && control.required.includes(key);
        const isDisabled = control.disabled && control.disabled.includes(key);
        const error = this.errors && this.errors[key] ? this.errors[key] : null;
        return this._renderControl(control.properties[key], value, isRequired, isDisabled, error, key, container);
      });
    }
    else {
      if (value == null) {
        if (this._values[key] == null && control.default != null) {
          this._values[key] = control.default;
        }
        value = this._values[key] != null ? this._values[key] : null;
      }
      const elementName = this._getElementName(control);
      const element = document.createElement(elementName);
      element.name = key;

      if (isRequired) {
        element.required = isRequired;
      }
      if (isDisabled) {
        element.disabled = isDisabled;
      }
      if (control.title) {
        element.label = control.title;
        element.title = control.title;
      }

      if (control.pattern) {
        element.pattern = control.pattern;
      }

      if (control.type === 'integer') {
        element.type = 'number';
      }

      if (control.enum) {
        element.options = control.enum;
        if (control.type === 'array') {
          element.multiple = true;
        }
      }
      else if (this._isCodemirror(control)) {
        element.options = control['x-schema-form'].codemirrorOptions;
        if (control.default != null && element.options.value == null) {
          element.options.value = control.default;
        }
      }

      if (!control.enum && control.type === 'array') {
        if (control.title) {
          const label = document.createElement('label');
          label.innerHTML = control.title;
          container.appendChild(label);
        }
        element.icon = 'code:plus';
        element.innerHTML = 'Add';
        element.outlined = true;
        element.addEventListener('gv-button:click', this._onAddItem.bind(this, key, control));
      }

      if (this._isAutocomplete(control)) {
        const name = control['x-schema-form'].event.name;
        const autocomplete = document.createElement('gv-autocomplete');
        autocomplete.minChars = 0;
        autocomplete.filter = true;
        autocomplete.appendChild(element);
        dispatchCustomEvent(this, name, { element: autocomplete, ...control['x-schema-form'].event });
        container.appendChild(autocomplete);
      }
      else {
        container.appendChild(element);
      }

      if (control.enum) {
        if (control.type === 'array') {
          const all = document.createElement('gv-checkbox');
          all.label = 'ALL';
          container.appendChild(all);
          all.checked = value && value.length === control.enum.length;
          all.addEventListener('gv-checkbox:input', (e) => {
            if (e.target.checked === true) {
              element.value = control.enum;
            }
            else {
              element.value = [];
            }
            dispatchCustomEvent(element, 'input', element.value);
          });
        }
      }

      if (control.description) {
        element.placeholder = control.description;
      }

      if (error) {
        const err = document.createElement('div');
        err.className = 'form__control-error';
        err.innerHTML = error;
        container.appendChild(err);
      }

      if (value != null) {
        setTimeout(() => {
          const tagName = element.tagName.toLowerCase();
          if (tagName === 'gv-checkbox' && value === true) {
            element.checked = true;
          }
          else if (control.type === 'array' && tagName !== 'gv-select') {
            element.value.forEach(() => {
              this._onAddItem(key, control, { target: element });
            });
          }
          else {
            element.value = value.toString ? value.toString() : value;
          }
        }, 0);
      }

      element.addEventListener(`${elementName}:input`, this._onChange.bind(this, key));
      this._elements[key] = element;
    }

    if (groupContainer) {
      groupContainer.appendChild(container);
      return groupContainer;
    }

    return container;
  }

  _renderPart () {
    if (this._formPart == null) {
      const keys = this.schema.properties ? Object.keys(this.schema.properties) : [];
      return keys.map((key) => {
        const control = this.schema.properties[key];
        const isRequired = this.schema.required && this.schema.required.includes(key);
        const isDisabled = this.schema.disabled && this.schema.disabled.includes(key);
        const error = this.errors && this.errors[key];
        return this._renderControl(control, null, isRequired, isDisabled, error, key);
      });
    }
    return this._formPart;
  }

  _findOptionalInvalid () {
    return Object.values(this._elements)
      .filter((e) => e.isConnected)
      .find((element) => {
        if (element.updateState) {
          element.updateState(element.value);
        }
        return element.invalid === true;
      });
  }

  canSubmit () {
    if (this.dirty && (this.errors == null || this.errors.length === 0)) {
      return this._findOptionalInvalid() == null;
    }
    return false;
  }

  shouldUpdate (changedProperties) {
    if (changedProperties.has('dirty')) {
      return false;
    }
    return super.shouldUpdate(changedProperties);
  }

  updated (changedProperties) {
    if (changedProperties.has('_values')) {
      Object.keys(this._values).forEach((key) => {
        const element = this._elements[key];
        if (element) {
          element.value = this._values[key];
        }
      });
    }
  }

  render () {
    if (this.schema == null) {
      return html``;
    }
    return html`<form>
     ${this._renderPart()}
    <div class="actions">
      <gv-button outlined primary @gv-button:click="${this._onCancel}">Cancel</gv-button>
      <gv-button primary @gv-button:click="${this._onSubmit}" disabled id="submit">${this.submitLabel}</gv-button>
    </div>
    </form>`;
  }

}

window.customElements.define('gv-schema-form', GvSchemaForm);
