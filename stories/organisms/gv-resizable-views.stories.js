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
import notes from '../../.docs/gv-resizable-views.md';
import '../../src/organisms/gv-resizable-views';
import { makeStory } from '../lib/make-story';

export default {
  title: 'Organisms/gv-resizable-views',
  component: 'gv-header',
  parameters: {
    notes,
  },
};

const conf = {
  component: 'gv-resizable-views',
  css: `
    :host {
      height: 100vh;
    }
    
    .content {
      padding: 0 0.5rem;
      box-sizing: border-box;
    }
  `,
};

export const Basics = makeStory(conf, {
  items: [{ innerHTML: '<div slot="top" class="content"> <h1>TOP</h1> <p>resizable content</p> </div><div slot="bottom" class="content"> <h2>BOTTOM</h2> <p>resizable content</p> </div>' }],
});
