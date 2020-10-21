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
import { LitElement, html, css } from 'lit-element';
import { withResizeObserver } from '../mixins/with-resize-observer';
import { classMap } from 'lit-html/directives/class-map';
import { dispatchCustomEvent } from '../lib/events';
import '../atoms/gv-image';
import '../molecules/gv-dropdown-menu';
import '../atoms/gv-switch';

/**
 * Flow area component
 *
 * @fires gv-flow-step:duplicate - Duplicate event from actions
 * @fires gv-flow-step:delete - Delete event from actions
 * @fires gv-flow-step:edit - Edit event
 * @fires gv-flow-step:copy - Copy event
 * @fires gv-flow-step:move - Move event
 *
 * @attr {Object<{name, icon, configuration:{description, ...}}>} step - the flow step, configuration contains form conf for gv-schema-form component
 * @attr {Boolean} editing - true, if edition in progress
 * @attr {Boolean} editing - true, if dragging in progress
 * @attr {Boolean} hover - true, if area is hover
 * @attr {String} title - title of area, default is "content.configuration.description" if exist
 * @attr {Boolean} empty - true, if render empty state
 * @attr {Boolean} confirm - true, if render confirm state
 */
export class GvFlowStep extends withResizeObserver(LitElement) {

  static get properties () {
    return {
      step: { type: Object },
      policy: { type: Object },
      editing: { type: Boolean, reflect: true },
      dragging: { type: Boolean, reflect: true },
      hover: { type: Boolean, reflect: true },
      title: { type: String, reflect: true },
      empty: { type: Boolean, reflect: true },
      confirm: { type: Boolean, reflect: true },
      _small: { type: Boolean, attribute: false },
    };
  }

  static get styles () {
    return [
      // language=CSS
      css`
        :host {
          box-sizing: border-box;
          margin: 0.2rem;
          display: block;
        }

        :host(:active) {
          outline: none;
        }

        :host([dragging]) {
          opacity: 0.5;
        }

        gv-dropdown-menu {
          position: absolute;
          right: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: right;
          top: -1px;
          z-index: 10;
          --gv-dropdown-menu--bdw: 0 0 0 1px;
          --gv-dropdown-menu--p: 0.1rem 0.3rem;
          --gv-dropdown-menu--gg: 0;
        }

        :host([hover]) .drop-area {
          transform: translateY(-4px);
          box-shadow: 0 0 0 1px #5A7684, 0 1px 3px #5A7684;
          border-color: transparent;
        }

        :host([dragging]) .drop-area {
          transform: translateY(-4px);
        }

        :host([editing]) .drop-area {
          border-color: #5A7684;
          transform: translateY(-4px);
          box-shadow: 0 0 0 1px #5A7684, 0 1px 3px #5A7684;
          transition: all .2s;
        }

        :host([w-lt-200]) gv-image {
          position: absolute;
          opacity: 0.1;
          width: 100%;
        }

        :host([w-lt-200]) .drop-area:hover gv-image {
          opacity: 1;
        }

        :host([w-lt-100]) .description {
          display: none;
        }

        :host([empty]) .drop-area {
          position: relative;
          background-color: transparent;
          border: 2px dashed #BFBFBF;
          font-size: 14px;
        }

        .description {
          line-height: 14px;
          font-size: 12px;
          max-height: 42px;
          overflow: hidden;
        }

        .drop-area {
          position: relative;
          border: 2px dashed #BFBFBF;
          border-radius: 4px;
          height: 80px;
          min-width: 80px;
          margin: 4px;
          padding: 4px;
          word-break: break-word;
          display: flex;
          align-items: center;
          text-align: center;
          justify-content: center;
          flex-direction: column;
          --gv-button--fz: 11px;
          flex: 1;
          transition: color 150ms ease-in-out, transform .3s ease-in-out, box-shadow .3s ease-in-out, border .3s ease-in-out;
          background-color: white;
        }

        .drop-area.disabled {
          opacity: 0.7;
          background-color: #BFBFBF; /* fallback color if gradients are not supported */
          border-color: white;
        }

        .drop-area.has-icon {
          padding-left: 0;
          text-align: left;
        }

        .drop-area.has-icon .content {
          justify-content: left;
        }

        .drop-area.is-assigned {
          border-style: solid;
        }

        :host([hover]) .drop-area.is-assigned {
          cursor: grab;
        }

        :host([hover]) .drop-area.is-assigned:active {
          cursor: grabbing;
        }

        .content {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
        }

        .content > div,
        .content > mark {
          width: 100%;
        }

        gv-image {
          height: 90px;
          width: 100px;
          margin: 0.2rem;
        }

        :host([empty]) .drop-area-confirm {
          flex-direction: row;
          align-items: center;
          justify-content: center;
          background-color: white;
        }
      `,
    ];
  }

  constructor () {
    super();
    this.empty = true;
    this.breakpoints = {
      width: [100, 200],
    };
  }

  onResize ({ width }) {
    this._small = width <= 200;
  }

  _onDuplicate () {
    dispatchCustomEvent(this, 'duplicate', { step: this.step, policy: this.policy });
  }

  _onClick (e) {
    if (!e.target.classList.contains('action')) {
      e.preventDefault();
      this._edit();
    }
  }

  _onEdit (e) {
    if (e.target.classList.contains('action-edit')) {
      this._edit();
    }
  }

  _edit () {
    this.editing = true;
    dispatchCustomEvent(this, 'edit', { step: this.step, policy: this.policy });
  }

  _onMouseEnter () {
    this.hover = true;
    const dropdownMenu = this.shadowRoot.querySelector('gv-dropdown-menu');
    dropdownMenu.setAttribute('open', true);
  }

  _onMouseLeave () {
    this.hover = false;
    const dropdownMenu = this.shadowRoot.querySelector('gv-dropdown-menu');
    dropdownMenu.removeAttribute('open');
  }

  _onDelete () {
    dispatchCustomEvent(this, 'delete', { step: this.step });
  }

  updated (properties) {
    if (properties.has('dragging') && this.dragging === true) {
      const dropdownMenu = this.shadowRoot.querySelector('gv-dropdown-menu');
      dropdownMenu.removeAttribute('open');
    }
    if (properties.has('step') && this.step != null) {
      this.empty = false;
    }
  }

  _onCancel () {
    this.remove();
  }

  _onCopy () {
    dispatchCustomEvent(this, 'copy');
  }

  _onMove () {
    dispatchCustomEvent(this, 'move');
  }

  _onChangeState ({ detail }) {
    dispatchCustomEvent(this, 'change-state', { step: this.step, enabled: detail });
  }

  _renderDropdownMenu () {
    const editLabel = this.editing ? 'Editing...' : 'Edit';
    const enabled = this.step.enabled;
    return html`<gv-dropdown-menu right>
                  <gv-switch slot="action" class="action" small label="${enabled ? 'Enabled' : 'Disabled'}" title="${enabled ? 'Disable policy ?' : 'Enable policy ?'}" @gv-switch:input="${this._onChangeState}" value="${enabled}"></gv-switch>
                  <gv-button slot="action" class="action action-edit" small link title="Edit" icon="design:edit" @gv-button:click="${this._onEdit}" .disabled="${this.editing}">${editLabel}</gv-button>
                  <gv-button slot="action" class="action" link small icon="general:duplicate" @gv-button:click="${this._onDuplicate}">Duplicate</gv-button>
                  <gv-button slot="action" class="action" link small icon="home:trash" @gv-button:click="${this._onDelete}">Delete</gv-button>
                </gv-dropdown-menu>`;
  }

  render () {
    if (this.confirm) {
      return html`<div class="drop-area drop-area-confirm">
                    <gv-button small @gv-button:click="${this._onCopy}">Copy</gv-button>
                    <gv-button small @gv-button:click="${this._onMove}">Move</gv-button>
                    <gv-button link small @gv-button:click="${this._onCancel}">Cancel</gv-button>
             </div>`;
    }
    else if (!this.empty) {
      const name = this.step ? this.step.name : '';
      const description = this.step && this.step.description ? this.step.description : '';
      const icon = this.step ? this.policy.icon : null;
      const enabled = this.step ? this.step.enabled === true : false;
      this.title = description;
      const classes = {
        'drop-area': true,
        'is-assigned': name !== '',
        'has-icon': icon != null,
        disabled: !enabled,
      };
      return html`<div class="${classMap(classes)}"
                        @click="${this._onClick}"
                        @mouseenter="${this._onMouseEnter}"
                        @mouseleave="${this._onMouseLeave}">

                    ${this._renderDropdownMenu()}
                    <div class="content">
                      ${icon ? html`<gv-image src="${icon}"></gv-image>` : html``}
                      <div>
                        <div class="name">${name}</div>
                        <div class="description">${description}</div>
                      </div>
                    </div>
                  </div>
                  `;
    }
    else {
      return html`<div class="drop-area"></div>`;
    }
  }

}

export class PolicyDraggable {

  static parse (str) {
    const data = JSON.parse(str);
    return new PolicyDraggable(data.policy, data.sourcePosition, data.sourceFlowKey, data.sourceFlowId, data.flowStep);
  }

  constructor (policy, sourcePosition, sourceFlowKey, sourceFlowId, flowStep) {
    this.policy = policy;
    this.sourcePosition = sourcePosition;
    this.sourceFlowKey = sourceFlowKey;
    this.sourceFlowId = sourceFlowId;
    this.flowStep = flowStep;
  }

  toString () {
    return JSON.stringify(this);
  }

}

window.customElements.define('gv-flow-step', GvFlowStep);
