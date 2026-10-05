let editor = null;

function defineDarkTheme() {
  monaco.editor.defineTheme("minidb-dark", {
    base: "vs-dark",
    inherit: true,

    colors: {
      "editor.background": "#000000",
      "editor.foreground": "#f4f4f5",

      "editorLineNumber.foreground": "#52525b",
      "editorLineNumber.activeForeground": "#d4d4d8",

      "editorCursor.foreground": "#ffffff",

      "editor.selectionBackground": "#27272a",
      "editor.inactiveSelectionBackground": "#18181b",

      "editor.lineHighlightBackground": "#09090b",
      "editor.lineHighlightBorder": "#00000000",

      "editorGutter.background": "#000000",

      "editorIndentGuide.background": "#18181b",
      "editorIndentGuide.activeBackground": "#27272a",

      "editorWhitespace.foreground": "#18181b",

      "editorSuggestWidget.background": "#09090b",
      "editorSuggestWidget.border": "#27272a",
      "editorSuggestWidget.foreground": "#e4e4e7",
      "editorSuggestWidget.selectedBackground": "#27272a",

      "editorHoverWidget.background": "#09090b",
      "editorHoverWidget.border": "#27272a",

      "editorWidget.background": "#09090b",
      "editorWidget.border": "#27272a",

      "scrollbarSlider.background": "#27272a",
      "scrollbarSlider.hoverBackground": "#3f3f46",
      "scrollbarSlider.activeBackground": "#52525b",
    },

    rules: [
      {
        token: "keyword",
        foreground: "ffffff",
        fontStyle: "bold",
      },
      {
        token: "string",
        foreground: "a1a1aa",
      },
      {
        token: "number",
        foreground: "d4d4d8",
      },
      {
        token: "comment",
        foreground: "52525b",
      },
      {
        token: "identifier",
        foreground: "e4e4e7",
      },
      {
        token: "type",
        foreground: "d4d4d8",
      },
    ],
  });
}

export function createEditor(container) {
  defineDarkTheme();
  editor = monaco.editor.create(container, {
    value: `SELECT * FROM users;`,
    language: "sql",
    theme: "minidb-dark",

    automaticLayout: true,

    minimap: {
      enabled: false,
    },

    fontSize: 14,
    lineNumbers: "on",
    scrollBeyondLastLine: false,
    wordWrap: "on",
    padding: {
      top: 16,
      bottom: 16,
    },

    roundedSelection: false,
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    folding: true,
    glyphMargin: false,
    overviewRulerLanes: 0,
    tabSize: 2,
    insertSpaces: true,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  });

  return editor;
}

export function getQuery() {
  if (!editor) {
    throw new Error("Editor has not been initialized");
  }
  return editor.getValue();
}

export function setQuery(query) {
  if (!editor) {
    throw new Error("Editor has not been initialized");
  }
  editor.setValue(query);
}

export function clearQuery() {
  setQuery("");
}