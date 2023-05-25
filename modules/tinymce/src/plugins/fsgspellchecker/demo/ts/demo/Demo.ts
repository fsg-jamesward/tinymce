declare let tinymce: any;

tinymce.init({
  language: 'es',
  selector: 'textarea.tinymce',
  theme: 'silver',

  plugins: 'fsgspellchecker code',
  toolbar: 'fsgspellchecker code',

  spellchecker_language: 'en',
  spellchecker_languages: 'English=en,Spanish=es',
  spellchecker_callback: (method: string, text: string, success: (data?: any) => void, _failure: (message: string) => void) => {
    const words = text.match(tinymce.activeEditor.plugins.fsgspellchecker.getWordCharPattern());

    if (method === 'spellcheck' && words != null) {
      const suggestions: Record<string, string[]> = {};
      for (let i = 0; i < words.length; i++) {
        suggestions[words[i]] = [ 'First', 'Second' ];
      }
      // tinymce.activeEditor.plugins.fsgspellchecker.markErrors({ words: suggestions, dictionary: [ ] });
      success({ words: suggestions });
    }
  },
  height: 600
});

export {};
