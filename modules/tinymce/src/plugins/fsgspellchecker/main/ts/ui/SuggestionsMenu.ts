/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';
import Tools from 'tinymce/core/api/util/Tools';

import * as Actions from '../core/Actions';
import { DomTextMatcher } from '../core/DomTextMatcher';

type LastSuggestion = Actions.LastSuggestion;

const ignoreAll = true;

const getSuggestions = (editor: Editor, pluginUrl: string, lastSuggestionsState: Cell<LastSuggestion | null>, startedState: Cell<boolean>,
                        textMatcherState: Cell<DomTextMatcher | null>, currentLanguageState: Cell<string>, word: string, spans: HTMLSpanElement[]): Menu.ContextMenuContents[] => {
  const items: Menu.ContextMenuContents[] = [];
  const lastSuggestion = lastSuggestionsState.get() as LastSuggestion;

  const suggestions = lastSuggestion.suggestions[word];
  Tools.each(suggestions, (suggestion) => {
    items.push({
      text: suggestion,
      onAction: () => {
        editor.insertContent(editor.dom.encode(suggestion));
        editor.dom.remove(spans);
        Actions.checkIfFinished(editor, startedState, textMatcherState);
      }
    });
  });

  const hasDictionarySupport = lastSuggestion.hasDictionarySupport;
  if (hasDictionarySupport) {
    items.push({ type: 'separator' });
    items.push({
      text: 'Add to dictionary',
      onAction: () => {
        Actions.addToDictionary(editor, pluginUrl, startedState, textMatcherState, currentLanguageState, word, spans);
      }
    });
  }

  items.push.apply(items, [
    {
      type: 'separator'
    },
    {
      text: 'Ignore',
      onAction: () => {
        Actions.ignoreWord(editor, startedState, textMatcherState, word, spans);
      }
    },

    {
      text: 'Ignore all',
      onAction: () => {
        Actions.ignoreWord(editor, startedState, textMatcherState, word, spans, ignoreAll);
      }
    }
  ]);
  return items;
};

const setup = (editor: Editor, pluginUrl: string, lastSuggestionsState: Cell<LastSuggestion | null>, startedState: Cell<boolean>,
               textMatcherState: Cell<DomTextMatcher | null>, currentLanguageState: Cell<string>): void => {
  const update = (element: Element): Menu.ContextMenuContents[] => {
    const target = element;
    if (target.className === 'mce-spellchecker-word') {
      const elmIndex = Actions.getElmIndex(target);
      if (elmIndex != null) {
        const spans = Actions.findSpansByIndex(editor, elmIndex);
        if (spans.length > 0) {
          const rng = editor.dom.createRng();
          rng.setStartBefore(spans[0]);
          rng.setEndAfter(spans[spans.length - 1]);
          editor.selection.setRng(rng);
          const word = target.getAttribute('data-mce-word') as string;
          return getSuggestions(editor, pluginUrl, lastSuggestionsState, startedState, textMatcherState, currentLanguageState, word, spans);
        }
      }
    }
    return [];
  };

  editor.ui.registry.addContextMenu('spellchecker', {
    update
  });
};

export {
  setup
};