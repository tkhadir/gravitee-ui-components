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
import { classMap } from 'lit-html/directives/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

import { LitElement, html, css } from 'lit-element';
import { skeleton } from '../styles/skeleton';
import { dispatchCustomEvent } from '../lib/events';

/**
 * A wrapper of a <switch> component.
 *
 * ## Details
 * * has @theme facet
 *
 * @fires gv-switch:input - mirrors native input events with the `value` on `detail`
 *
 * @attr {Boolean} disabled - same as native switch element `disabled` attribute
 * @attr {Boolean} skeleton - enable skeleton screen UI pattern (loading hint)
 * @attr {Boolean} value - true if the switch is checked, false otherwise
 * @attr {String} label - label of the switch
 * @attr {String} description - description of the switch
 *
 * @cssprop {Color} [--gv-switch-on--bgc=var(--gv-theme-color, #5A7684)] - On background color
 * @cssprop {Color} [--gv-switch-off--bgc=var(--gv-theme-neutral-color-dark, #BFBFBF)] - Off background color
 * @cssprop {Color} [--gv-switch--bgc=var(--gv-theme-neutral-color-lightest, #FFFFFF)] - Switch background color
 */
export class GvSwitch extends LitElement {

  static get properties () {
    return {
      disabled: { type: Boolean },
      skeleton: { type: Boolean },
      value: { type: String, reflect: true },
      label: { type: String },
      description: { type: String },
      small: { type: Boolean, reflect: true },
    };
  }

  static get styles () {
    return [
      skeleton,
      // language=CSS
      css`
        :host {
          --off-bgc: var(--gv-switch-off--bgc, var(--gv-theme-neutral-color-dark, #BFBFBF));
          --on-bgc: var(--gv-switch-on--bgc, var(--gv-theme-color, #5A7684));
            box-sizing: border-box;
            margin: 0.2rem;
        }

        .container {
          display: flex;
        }

        .labels {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
        }

        .switch-title {
          font-weight: 600;
        }

        .switch-description {
          opacity: 0.6;
        }

        .switch-container {
          display: flex;
          align-items: center;
        }

        .switch {
          position: relative;
          width: 40px;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          border-radius: 16px;
        }
        
        :host([small]) .switch {
          width: 25px;
        }

        :host([small]) .switch-label:before {
          width: 10px;
          border-radius: 10px;
          right: 10px;
        }

        :host([small]) .switch-label {
          height: 10px;
          line-height: 10px;
          border-radius: 10px;
        }

        :host([small]) .switch-title {
          font-weight: 400;
          font-size: 11px;
        }

        .switch input {
          display: none;
        }

        .switch-label {
          display: block;
          overflow: hidden;
          cursor: pointer;
          height: 16px;
          padding: 0;
          line-height: 16px;
          border: 2px solid transparent;
          border-radius: 16px;
          background-color: var(--off-bgc);
          transition: background-color 0.3s ease-in;
        }

        .switch-label:before {
          content: "";
          display: block;
          width: 16px;
          margin: 0;
          background: var(--gv-switch--bgc, var(--gv-theme-neutral-color-lightest, #FFFFFF));
          position: absolute;
          top: 0;
          bottom: 0;
          right: 20px;
          border: 2px solid var(--off-bgc);
          border-radius: 16px;
          transition: all 0.3s ease-in 0s;
        }

        .switch input:checked + .switch-label {
          background-color: var(--on-bgc);
        }

        .switch input:checked + .switch-label, .switch input:checked + .switch-label:before {
          border-color: var(--on-bgc);
        }

        .switch input:checked + .switch-label:before {
          right: 0;
        }

        .switch input:disabled + .switch-label {
          cursor: default;
          opacity: .5;
        }
      `,

    ];
  }

  constructor () {
    super();
    this._id = 'gv-id';
  }

  _onInput () {
    if (!(this.disabled || this.skeleton)) {
      this.value = !this.value;
      dispatchCustomEvent(this, 'input', this.value);
    }
  }

  render () {
    const classes = {
      skeleton: this.skeleton,
      disabled: this.disabled,
      small: this.small,
      switch: true,
    };

    return html`
    <div class="container">

    ${this.label ? html`<div class="labels">
        ${this.label ? html`<label class="switch-title">${this.label}</label>` : ''}
         ${this.description ? html`<label class="switch-description">${this.description}</label>` : ''}
      </div>` : ''}
      <div class="switch-container">
        <div class=${classMap(classes)}>
          <input
            id=${this._id}
            type="checkbox"
            .title=${ifDefined(this.label || this.description)}
            ?disabled=${this.disabled || this.skeleton}
            .checked=${this.value}
            value=${this.value}
            @input=${this._onInput}>
          <label class="switch-label" for="${this._id}"></label>
        </div>
      </div>
    </div>
    `;
  }
}

window.customElements.define('gv-switch', GvSwitch);
