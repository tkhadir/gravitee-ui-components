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
import { classMap } from 'lit-html/directives/class-map';
import { getFlowName, methods, uuid } from '../lib/studio';
import { dispatchCustomEvent } from '../lib/events';
import '../atoms/gv-button';
import '../atoms/gv-icon';
import '../molecules/gv-option';
import '../organisms/gv-documentation';
import '../organisms/gv-properties';
import '../organisms/gv-resizable-views';
import '../organisms/gv-resources';
import '../organisms/gv-schema-form';
import '../organisms/gv-tabs';
import './gv-flow';
import './gv-flow-step';
import './gv-policy-studio-menu';
import { empty } from '../styles/empty';
import { loadAsciiDoctor } from '../lib/text-format';
import { cache } from 'lit-html/directives/cache';

/**
 *  Studio Policy component
 *
 * @fires gv-policy-studio:select-policy - Select policy event
 *
 * @attr {Array} policies - Policies available
 * @attr {Array} resources - Resources available
 * @attr {Object} definition - The definition of flows
 * @attr {Object} documentation - The documentation to display
 * @attr {String} selectedId - The selected policy id
 * @attr {Object} flowSettingsForm - The flow form configuration to display in gv-schema-form component
 *
 */
export class GvPolicyStudio extends LitElement {

  static get properties () {
    return {
      policies: { type: Array },
      resourceTypes: { type: Array, attribute: 'resource-types' },
      propertyProviders: { type: Array, attribute: 'property-providers' },
      definition: { type: Object },
      _definition: { type: Object, attribute: false },
      documentation: { type: Object },
      flowSettingsForm: { type: Object },
      isDirty: { type: Boolean, attribute: 'dirty', reflect: true },
      _dragPolicy: { type: Object, attribute: false },
      _dropPolicy: { type: Object, attribute: false },
      _selectedFlowsId: { type: Array, attribute: false },
      _currentPolicyId: { type: String, attribute: false },
      _searchPolicyQuery: { type: String, attribute: false },
      _searchFlowQuery: { type: String, attribute: false },
      _flowStepSchema: { type: Object, attribute: false },
      _currentFlowStep: { type: Object, attribute: false },
      _tabId: { type: String, attribute: false },
      _policyFilter: { type: Array, attribute: false },
      _flowFilter: { type: Array, attribute: false },
    };
  }

  static get styles () {
    return [
      empty,
      methods,
      // language=CSS
      css`
        :host {
          box-sizing: border-box;
          --height: var(--gv-policy-studio--h, calc(100vh - 32px));
          height: var(--height);
          --height-in-tabs: calc(var(--height) - 25px);
        }

        .box {
          height: var(--height);
          display: flex;
        }

        .design, .properties {
          display: flex;
        }

        gv-resizable-views {
          width: 100%;
        }

        .editable-name {
          padding: 0.5rem 1rem;
          font-size: 16px;
        }

        .editable-name span {
          color: #BFBFBF;
          font-size: 12px;
        }

        .form__control {
          margin: 0.5rem;
        }

        gv-input {
          width: 100%;
        }

        .flow-name {
          display: flex;
          align-items: center;
        }

        .subtitle {
          line-height: 28px;
          padding: 0.5rem;
        }

        .flow-name.dirty {
          font-style: italic;
          opacity: 0.8;
        }

        .flow-name gv-icon {
          --gv-icon--s: 24px;
          margin-right: 0.2rem;
        }

        .flow-path {
          margin-left: 0.2rem;
        }

        .title_methods {
          margin-left: 0.5rem;
        }

        .two-cols {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .two-cols > * {
          flex: 1;
        }

        .left-menu {
          border-left: 1px solid #D9D9D9;
          height: var(--height-in-tabs)
        }

        .right-menu {
          border-right: 1px solid #D9D9D9;
          height: var(--height-in-tabs)
        }

        .two-cols > *:first-child {
          border-right: 1px solid #D9D9D9;
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

        .header gv-image {
          height: 40px;
          width: 40px;
          margin-right: 5px;
        }

        .flow-step__container {
          overflow: hidden;
        }

        .flow-step__form {
          padding: 0 0.5rem;
          min-height: calc(100% - 50px);
          overflow: auto;
        }

        gv-tabs {
          width: 100%;
          height: 100%;
          display: inline-block;
        }

        gv-resizable-views,
        gv-properties,
        gv-resources {
          height: var(--height-in-tabs);
        }

        gv-properties,
        gv-resources {
          width: 100%;
        }

        .flow-settings {
          display: flex;
          flex-direction: column;
          border-left: 1px solid #BFBFBF;
          height: var(--height);
        }

        .flow-settings gv-schema-form {
          flex: 1;
          padding: 0.5rem;
        }

        .search {
          display: flex;
          justify-content: stretch;
        }

        gv-input {
          margin: 0.2rem 0;
          width: 100%;
        }

        .header-actions, .search-policies {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0.5rem;
        }

        .footer-actions > gv-button.save,
        .footer-actions > gv-option {
          width: 100%;
        }

        .footer-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem 0;
          margin: 0.5rem 15px;
          border-top: 1px solid #BFBFBF;
        }

        .title {
          text-transform: uppercase;
          text-align: center;
          letter-spacing: .3rem;
          color: #BFBFBF;
          font-size: 18px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 240px;
        }
      `,
    ];
  }

  constructor () {
    super();
    this.isDirty = false;
    this.policies = [];
    this.resourceTypes = [];
    this._tabId = 'design';
    this._selectedFlowsId = [];
    this._definition = {
      flows: [],
    };
    this._tabs = [
      { id: 'design', title: 'Design', icon: 'navigation:exchange' },
      { id: 'settings', title: 'Settings', icon: 'general:settings#2' },
      { id: 'properties', title: 'Properties', icon: 'general:settings#1' },
      { id: 'resources', title: 'Resources', icon: 'general:settings#5' },
    ];
    this._flowFilterOptions = [
      { id: 'api', title: 'Api', icon: 'shopping:box#3' },
      { id: 'plan', title: 'Plans', icon: 'shopping:sale#2' },
    ];
    this._flowFilter = this._flowFilterOptions.map((o) => o.id);
    this._policyFilterOptions = [
      { id: 'onRequest', title: 'Request', icon: 'navigation:arrow-from-left' },
      { id: 'onResponse', title: 'Response', icon: 'navigation:arrow-from-right' },
    ];
    this._policyFilter = this._policyFilterOptions.map((o) => o.id);
    loadAsciiDoctor();
  }

  set definition (definition) {
    this._selectedFlowsId = [];
    this._initialDefinition = JSON.parse(JSON.stringify(definition));
    const flows = this._generateId(definition.flows);
    const properties = this._generateId(definition.properties);
    const resources = this._generateId(definition.resources);

    const plans = definition.plans == null ? [] : definition.plans.map((plan) => {
      return { ...plan, flows: this._generateId(plan.flows) };
    });

    this._definition = { ...definition, flows, properties, resources, plans };
    this.isDirty = false;
    this._selectFirstFlow();
  }

  get definition () {
    return this._definition;
  }

  _selectFirstFlow () {
    if (this._selectedFlowsId.length === 0 && this.definedFlows.length > 0 && this.definedFlows[0]._id != null) {
      this._selectedFlowsId = [this.definedFlows[0]._id];
    }
  }

  _onDragEndPolicy () {
    this.shadowRoot.querySelectorAll('gv-flow').forEach((e) => e.onDragEnd());
  }

  _onDropPolicy ({ detail }) {
    const targetFlow = this._findFlowById(detail.flowId);
    const sourceFlow = detail.sourceFlowId != null ? this._findFlowById(detail.sourceFlowId) : targetFlow;
    const policy = detail.policy;

    let name = policy.name;
    let description = policy.description;
    let configuration = {};
    if (detail.flowStep) {
      name = detail.flowStep.name;
      description = detail.flowStep.description;
      configuration = detail.flowStep.configuration;
    }

    const flowStep = { name, policy: policy.id, description, enabled: true, configuration };

    if (detail.sourcePosition != null) {
      if (detail.sourceFlowKey && detail.sourceFlowKey !== detail.flowKey) {
        sourceFlow[detail.sourceFlowKey].splice(detail.sourcePosition, 1);
        targetFlow[detail.flowKey].splice(detail.position, 0, flowStep);
      }
      else {
        if (detail.position > detail.sourcePosition) {
          targetFlow[detail.flowKey].splice(detail.position, 0, flowStep);
          sourceFlow[detail.flowKey].splice(detail.sourcePosition, 1);
        }
        else {
          sourceFlow[detail.flowKey].splice(detail.sourcePosition, 1);
          targetFlow[detail.flowKey].splice(detail.position, 0, flowStep);
        }
      }
    }
    else {
      targetFlow[detail.flowKey].splice(detail.position, 0, flowStep);
    }
    targetFlow._dirty = true;
    sourceFlow._dirty = true;
    this.isDirty = true;
    this.shadowRoot.querySelectorAll('gv-flow').forEach((gvFlow) => gvFlow.removeCandidate());
    this._refresh();
    setTimeout(() => {
      this._dragPolicy = null;
      this._dropPolicy = null;
    }, 0);
  }

  _onDeletePolicy ({ detail }) {
    const targetFlow = this._findFlowById(detail.flowId);
    targetFlow[detail.flowKey].splice(detail.position, 1);
    targetFlow._dirty = true;
    this.isDirty = true;
    this._refresh(detail.isEditable);
  }

  _toSettingsTab () {
    if (this._tabId === 'settings') {
      this._tabId = 'design';
      setTimeout(() => {
        this._tabId = 'settings';
      }, 0);
    }
    else {
      this._tabId = 'settings';
    }
  }

  _onDesign () {
    this._tabId = 'design';
    this._splitMainViews();
  }

  _onEditFlowStep (flow, { detail }) {
    if (detail) {
      this._selectedFlowsId = [flow._id];
      this._currentFlowStep = { flow, step: detail.step, ...detail };
      if (detail.policy.schema) {
        const description = {
          title: 'Description',
          description: 'Description of flow step',
          type: 'string',
        };
        const schema = typeof detail.policy.schema === 'string' ? JSON.parse(detail.policy.schema) : detail.policy.schema;
        const properties = { description, ...schema.properties };
        this._flowStepSchema = { ...schema, properties };
      }
      this._splitMainViews();
      this._onOpenDocumentation();
    }
    else {
      this._currentFlowStep = null;
      this._maximizeTopView();
    }
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

  _onChangeFlowStepState ({ detail }) {
    const targetFlow = this._findFlowById(detail.flowId);
    const step = targetFlow[detail.flowKey][detail.position];
    step.enabled = detail.enabled;
    targetFlow._dirty = true;
    this.isDirty = true;
    this._refresh(false);
  }

  _resetEditable () {
    if (this._currentFlowStep) {
      this._currentFlowStep = null;
      this._flowStepSchema = null;
      this.documentation = null;
    }
  }

  _refresh (resetEditable = true) {
    if (resetEditable) {
      this._resetEditable();
    }
    this._definition = JSON.parse(JSON.stringify(this._definition));
  }

  _onSelectFlows ({ detail }) {
    this._resetEditable();
    this._selectedFlowsId = detail.flows;
    if (this._selectedFlowsId.length > 1) {
      this._onCloseDocumentation();
      this._tabId = 'design';
      this._splitMainViews();
    }
  }

  _onOpenDocumentationFromMenu ({ detail }) {
    this._resetEditable();
    if (this.getSelectedFlow()) {
      this._splitMainViews();
    }
    else {
      this._maximizeBottomView();
    }
    dispatchCustomEvent(this, 'fetch-documentation', detail);
  }

  _fetchDocumentation (policy) {
    dispatchCustomEvent(this, 'fetch-documentation', { policy });
  }

  _onOpenDocumentation () {
    if (this._currentFlowStep && this._currentFlowStep.policy) {
      this._fetchDocumentation(this._currentFlowStep.policy);
    }
  }

  _findFlowCollection (flowId) {
    const plan = this.definedPlans.find((plan) => plan.flows.find((flow) => flow._id === flowId) != null);
    return plan != null ? plan.flows : this.definedFlows;
  }

  _findFlowById (flowId) {
    const plansFlows = this.definedPlans.map((plan) => plan.flows).reduce((acc, val) => acc.concat(val), []);
    return [...plansFlows, ...this.definedFlows].find((flow) => flow._id === flowId);
  }

  getSelectedFlow (index = 0) {
    const selectedFlowId = this._selectedFlowsId[index];
    return this._findFlowById(selectedFlowId);
  }

  _onTargetPolicy ({ detail }) {
    this._dragPolicy = detail;
  }

  _onSubmitFlowStep ({ detail }) {
    const { description, ...configuration } = detail.values;
    this._currentFlowStep.step.description = description;
    this._currentFlowStep.step.configuration = configuration;
    this._currentFlowStep.step._dirty = true;
    if (this._currentFlowStep.flow) {
      this._currentFlowStep.flow._dirty = true;
    }
    this._definition = JSON.parse(JSON.stringify(this._definition));
    this.isDirty = true;
    this._refresh(true);
    this._maximizeTopView();
  }

  _onCancelFlowStep () {
    this._refresh(true);
  }

  _onCancelFlow () {
    this._onDesign();
  }

  _onSubmitFlow ({ detail: { values } }) {
    const selectedFlow = this.getSelectedFlow();
    selectedFlow.name = values.name || '';
    selectedFlow.description = values.description || '';
    selectedFlow.condition = values.condition || '';
    selectedFlow.path = values.path || '';
    selectedFlow.methods = values.methods || [];
    selectedFlow._dirty = true;
    this._refresh();
  }

  _onChangeTab ({ detail }) {
    this._tabId = detail.value;
  }

  _onDragStartFlowStep (flow, { detail }) {
    this._dropPolicy = detail;
    this._dragPolicy = detail;
  }

  _renderFlowEmptyState () {
    return html`<div slot="content" class="empty">
                      <div>Select a flow or <gv-button @gv-button:click="${this._onAddFlow}" outlined icon="code:plus" large>design new one</gv-button></div>
                  </div>`;
  }

  _renderFlow (index = 0, hasEmptyState = true) {
    const flow = this.getSelectedFlow(index);
    if (flow) {
      return html`
                <div slot="title" class="${classMap({ 'flow-name': true, subtitle: true, dirty: flow._dirty })}">
                    ${getFlowName(flow)}
                </div>
                <gv-flow 
                 .flow="${flow}"
                 .policies="${this.policies}"
                 slot="content"
                 .dragPolicy="${this._dragPolicy}"
                 .dropPolicy="${this._dropPolicy}"
                 .editableArea="${this._currentFlowStep}"
                 @gv-flow:drag-start="${this._onDragStartFlowStep.bind(this, flow)}"
                 @gv-flow:edit="${this._onEditFlowStep.bind(this, flow)}"
                 @gv-flow:change-state="${this._onChangeFlowStepState}"
                 @gv-flow:drop="${this._onDropPolicy}" 
                 @gv-flow:delete="${this._onDeletePolicy}"></gv-flow>`;
    }
    else if (hasEmptyState) {
      return this._renderFlowEmptyState();
    }
    return html``;
  }

  _onFetchResources (event) {
    const { element, type } = event.detail;
    const options = this.definedResources
      .filter((resource) => resource.type === type)
      .map((resource) => resource.configuration.name);
    element.options = options;
  }

  _renderPolicy () {
    if (this._flowStepSchema && this.documentation) {
      return html`<gv-resizable-views direction="horizontal">
                    <div slot="top">${this._renderFlowStepForm()}</div>
                    <div slot="bottom">
                      <gv-documentation .text="${this.documentation.content}" .image="${this.documentation.image}" @gv-documentation:close="${this._onCloseDocumentation}"></gv-documentation>
                    </div>
                  </gv-resizable-views>`;
    }
    else if (this.documentation) {
      return html`<gv-documentation .text="${this.documentation.content}" .image="${this.documentation.image}" @gv-documentation:close="${this._onCloseDocumentation}"></gv-documentation>`;
    }

    else if (this._flowStepSchema) {
      return this._renderFlowStepForm();
    }
    return html``;
  }

  _onResetFlowStep (id) {
    this.shadowRoot.querySelector(`#${id}`).reset();
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

  shouldUpdate (changedProperties) {
    // Just refresh gv-flow components
    if (changedProperties.has('_dragPolicy')) {
      this.shadowRoot.querySelectorAll('gv-flow').forEach((flow) => (flow.dragPolicy = this._dragPolicy));
      return false;
    }
    if (changedProperties.has('_dropPolicy')) {
      this.shadowRoot.querySelectorAll('gv-flow').forEach((flow) => (flow.dropPolicy = this._dropPolicy));
      return false;
    }
    return super.shouldUpdate(changedProperties);
  }

  updated (props) {
    if (props.has('documentation') && this.documentation != null && this._selectedFlowsId.length > 1) {
      this._selectedFlowsId = [this._selectedFlowsId[0]];
    }
  }

  _renderFlowStepForm () {
    return html`${cache(this._flowStepSchema && this._currentFlowStep
      ? html`<div class="flow-step__container">
             <div class="header">
               <gv-icon shape="design:edit"></gv-icon>
               <div class="title">${this._currentFlowStep.step.name}</div>
               ${this.documentation == null ? html`<gv-button link @gv-button:click="${this._onOpenDocumentation}">See documentation</gv-button>` : ''}
               <gv-button link @gv-button:click="${this._onResetFlowStep.bind(this, 'schema-form')}">Reset</gv-button>
           </div>      
           <div class="flow-step__form">
             <gv-schema-form id="schema-form" .schema="${this._flowStepSchema}" 
                .values="${{
        ...this._currentFlowStep.step.configuration, description: this._currentFlowStep.step.description,
      }}" 
                @gv-schema-form:fetch-resources="${this._onFetchResources}"
                @gv-schema-form:cancel="${this._onCancelFlowStep}"
                @gv-schema-form:submit="${this._onSubmitFlowStep}"></gv-schema-form>
            </div>
        </div>` : html``)}`;
  }

  _onCloseDocumentation () {
    this.documentation = null;
    if (this._currentFlowStep == null) {
      this._maximizeTopView();
    }
  }

  _onDeleteFlow ({ detail }) {
    const flowId = detail.content._id;
    const collection = this._findFlowCollection(flowId);
    const flow = collection.find((flow) => flow._id === flowId);
    this._deleteFlow(collection, flow);
  }

  get definedFlows () {
    return this._definition && this._definition.flows ? this._definition.flows : [];
  }

  get definedPlans () {
    return this._definition && this._definition.plans ? this._definition.plans : [];
  }

  get definedResources () {
    return this._definition && this._definition.resources ? this._definition.resources : [];
  }

  get definedProperties () {
    return this._definition && this._definition.properties ? this._definition.properties : [];
  }

  _onDuplicateFlow ({ detail }) {
    const flowId = detail.content._id;
    const collection = this._findFlowCollection(flowId);
    const flow = this._findFlowById(flowId);
    const duplicatedFlow = { ...flow, ...{ _dirty: true, _id: uuid() } };
    this._addFlow(collection, duplicatedFlow);

  };

  _onChangeFlowState ({ detail }) {
    const flow = this._findFlowById(detail.content._id);
    flow.disabled = !detail.enabled;
    flow._dirty = true;
    this.isDirty = true;
    this._refresh();
  }

  _onAddFlowPlan ({ detail }) {
    const newFlow = { _id: uuid(), name: 'New flow', pre: [], post: [], _dirty: true };
    const plan = this.definedPlans[detail.planIndex];
    this._addFlow(plan.flows, newFlow);
    if (!this._flowFilter.includes('plans')) {
      this._flowFilter.push('plans');
    }
  }

  _onAddFlow () {
    const newFlow = { _id: uuid(), name: 'New flow', pre: [], post: [], _dirty: true };
    this._addFlow(this._definition.flows, newFlow);
    if (!this._flowFilter.includes('api')) {
      this._flowFilter.push('api');
    }
  }

  _addFlow (collection, flow) {
    collection.push(flow);
    this.isDirty = true;
    this._selectedFlowsId = [flow._id];
    this._toSettingsTab();
    this._refresh();
  }

  _deleteFlow (collection, flow) {
    const index = collection.indexOf(flow);
    collection.splice(index, 1);
    this._selectedFlowsId = this._selectedFlowsId.filter((flowId) => flowId !== flow._id);
    this._selectFirstFlow();
    this._onDesign();
    this._refresh();
    this.isDirty = true;
  }

  _onUpdateFlows () {
    this.isDirty = true;
    this._refresh(false);
  }

  _onSearchPolicy ({ detail }) {
    this._searchPolicyQuery = detail;
  }

  _onClearPolicy () {
    this._searchPolicyQuery = null;
  }

  _onSearchFlows ({ detail }) {
    this._searchFlowQuery = detail;
  }

  _onClearFlows () {
    this._searchFlowsQuery = null;
  }

  _onResetAll () {
    this.definition = JSON.parse(JSON.stringify(this._initialDefinition));
    this._splitMainViews();
  }

  _removePrivateProperties (o) {
    const copy = { ...o };
    Object.keys(o).filter((key) => key.startsWith('_')).forEach((key) => {
      delete copy[key];
    });
    return copy;
  }

  _onSaveAll () {
    const plans = this._definition.plans.map((plan) => {
      const flows = plan.flows.map((f) => {
        const flow = this._removePrivateProperties(f);
        flow.pre = flow.pre.map(this._removePrivateProperties);
        flow.post = flow.post.map(this._removePrivateProperties);
        return flow;
      });
      return { ...plan, flows };
    });

    const flows = this._definition.flows.map((f) => {
      const flow = this._removePrivateProperties(f);
      flow.pre = flow.pre.map(this._removePrivateProperties);
      flow.post = flow.post.map(this._removePrivateProperties);
      return flow;
    });

    const resources = this._definition.resources.map(this._removePrivateProperties);

    const definition = { ...this._definition, flows, resources, plans };
    dispatchCustomEvent(this, 'save', { definition });
  }

  get filteredFlows () {
    if (this._flowFilter.includes('api')) {
      return this.definedFlows;
    }
    return null;
  }

  get filteredPlans () {
    if (this._flowFilter.includes('plan')) {
      return this.definedPlans;
    }
    return null;
  }

  _onFilterFlows ({ detail }) {
    if (this._flowFilter.includes(detail.id)) {
      this._flowFilter = this._flowFilter.filter((filter) => filter !== detail.id);
    }
    else {
      this._flowFilter = [...this._flowFilter, detail.id];
    }
  }

  _getFilteredPolicies () {
    if (this._policyFilter.length < 2) {
      return this.policies.filter((policy) => {
        return (policy.onRequest && this._policyFilter.includes('onRequest')) || (policy.onResponse && this._policyFilter.includes('onResponse'));
      });
    }
    return this.policies;
  }

  _onFilterPolicies ({ detail }) {
    if (this._policyFilter.includes(detail.id)) {
      this._policyFilter = this._policyFilter.filter((filter) => filter !== detail.id);
    }
    else {
      this._policyFilter = [...this._policyFilter, detail.id];
    }
  }

  _renderDesign () {
    return html`
           <div id="design" slot="content" class="design">
             <gv-resizable-views>
                <div slot="top">
                  ${this._renderFlow()}
                </div>            
           
                <div slot="bottom">
                  ${this._renderFlow(1, false)}
                  ${this._renderPolicy()}
                </div>
             </gv-resizable-views>
           <gv-policy-studio-menu
              class="right-menu"
              .policies="${this._getFilteredPolicies()}"
              .selectedIds="${[this._currentPolicyId]}"
              .query="${this._searchPolicyQuery}"
              @gv-policy-studio-menu:target-policy="${this._onTargetPolicy}"
              @gv-policy-studio-menu:fetch-documentation="${this._onOpenDocumentationFromMenu}"
              @gv-policy-studio-menu:dragend-policy="${this._onDragEndPolicy}">
                  
              <div slot="header" class="search-policies">
                <gv-option .options="${this._policyFilterOptions}" multiple outlined .value="${this._policyFilter}" small @gv-option:select="${this._onFilterPolicies}"></gv-option>
                <gv-input placeholder="Filter policies..." type="search" small 
                   .disabled="${this._policyFilter.length === 0}"
                    @gv-input:input="${this._onSearchPolicy}" 
                    @gv-input:clear="${this._onClearPolicy}"></gv-input>
              </div>
           </gv-policy-studio-menu>
         </div>`;
  }

  _renderSettings () {
    const flow = this.getSelectedFlow();
    if (flow) {
      const values = { ...flow };
      return html`<div id="settings" slot="content" class="flow-settings" @dragover="${this._onDesign}">
                    <div slot="title" class="${classMap({ 'flow-name': true, subtitle: true, dirty: flow._dirty })}">
                      ${getFlowName(flow)}
                    </div>
                    <gv-schema-form .schema="${this.flowSettingsForm}" 
                              .values="${values}"
                              @gv-schema-form:cancel="${this._onCancelFlow}"
                              @gv-schema-form:submit="${this._onSubmitFlow}"></gv-schema-form>
            </div>`;
    }
    else {
      return html`<div id="settings" slot="content" class="flow-settings" @dragover="${this._onDesign}">${this._renderFlowEmptyState()}</div>`;
    }
  }

  _onResourcesChange ({ detail }) {
    this.definition.resources = detail.resources;
    this.isDirty = true;
  }

  _onPropertiesChange ({ detail }) {
    this.definition.properties = detail.properties;
    this.isDirty = true;
  }

  render () {
    return html`<div class="box">
        <gv-policy-studio-menu
              class="left-menu"
              .api-name="${this._definition.name}"
              .flows="${this.filteredFlows}"
              .plans="${this.filteredPlans}"
              .selectedIds="${this._selectedFlowsId}"
              sortable
              .query="${this._searchFlowQuery}"
              @gv-policy-studio-menu:update-flows="${this._onUpdateFlows}"
              @gv-policy-studio-menu:change-flow-state="${this._onChangeFlowState}"
              @gv-policy-studio-menu:add-flow="${this._onAddFlow}"
              @gv-policy-studio-menu:add-flow-plan="${this._onAddFlowPlan}"
              @gv-policy-studio-menu:delete-flow="${this._onDeleteFlow}"
              @gv-policy-studio-menu:duplicate-flow="${this._onDuplicateFlow}"
              @gv-policy-studio-menu:select-flows="${this._onSelectFlows}">
              
                <div slot="header" class="header-actions">
                  <div class="title">${this._definition.name}</div>
                  <gv-option .options="${this._flowFilterOptions}" multiple outlined .value="${this._flowFilter}" small @gv-option:select="${this._onFilterFlows}"></gv-option>
                  <gv-input placeholder="Filter flows..." type="search" small
                    .disabled="${this._flowFilter.length === 0}"
                    @gv-input:input="${this._onSearchFlows}" 
                    @gv-input:clear="${this._onClearFlows}"></gv-input>
                </div>
                
                <div slot="footer" class="footer-actions">
                  <gv-button class="save" .disabled="${!this.isDirty}" @gv-button:click="${this._onSaveAll}">Save</gv-button>
                  <gv-button link .disabled="${!this.isDirty}" @gv-button:click="${this._onResetAll}">Reset</gv-button>
                </div>
         </gv-policy-studio-menu>

        <gv-tabs .value="${this._tabId}" .options="${this._tabs}" @gv-tabs:change="${this._onChangeTab}">
            ${this._renderDesign()}
            ${this._renderSettings()}
            <gv-properties id="properties" slot="content" class="properties"
                            @gv-properties:change="${this._onPropertiesChange}" 
                            .properties="${this.definedProperties}" 
                            .providers="${this.propertyProviders}"></gv-properties>
            <gv-resources id="resources" slot="content" class="resources"
                          @gv-resources:change="${this._onResourcesChange}" 
                          .resources="${this.definedResources}" 
                          .types="${this.resourceTypes}"></gv-resources>
        </gv-tabs>
         
      </div>`;
  }

}

window.customElements.define('gv-policy-studio', GvPolicyStudio);
