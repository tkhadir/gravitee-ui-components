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
import { dispatchCustomEvent } from '../lib/events';
import { toDom } from '../lib/text-format';
import { empty } from '../styles/empty';

export class GvDocumentation extends LitElement {

  static get properties () {
    return {
      text: { type: String },
      type: { type: String },
      image: { type: String },
      _dom: { type: Object, attribute: false },
    };
  }

  static get styles () {
    return [
      empty,
      // language=CSS
      css`
        :host {
          box-sizing: border-box;
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

        .documentation-content {
          padding: 0.5rem 1rem;
        }
        
        gv-image {
          height: 35px;
          width: 35px;
        }

      `,
    ];
  }

  constructor () {
    super();
    this.type = 'adoc';
  }

  _onCloseDocumentation () {
    dispatchCustomEvent(this, 'close');
  }

  _renderIcon () {
    if (this.image) {
      return html`<gv-image src="${this.image}"></gv-image>`;
    }
    return html`<gv-icon shape="code:question"></gv-icon>`;
  }

  async updated (props) {
    if (props.has('text')) {
      this._dom = await toDom(this.text, this.type, true);
      const title = this._dom.element.querySelector('h1');
      if (title) {
        this._dom.element.querySelector('h1').remove();
      }
    }
  }

  render () {
    if (this._dom) {
      return html`
                  <link rel="stylesheet" href="css/documentation.css">
                  <div>  
                    <div class="header">
                        ${this._renderIcon()}
                        <div class="title">${this._dom.title}</div>
                        <gv-button link @gv-button:click="${this._onCloseDocumentation}" title="Close documentation">Close</gv-button>
                    </div>
                    <div class="documentation-content">
                        ${this._dom.element}
                    </div>
                  </div>`;
    }
    return html`<div class="empty"><div>Sorry, the documentation was not found. </div><div>See the documentation about plugins.</div></div>`;
  }

}

window.customElements.define('gv-documentation', GvDocumentation);
