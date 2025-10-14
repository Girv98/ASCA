import { parser } from "./editor/parser.ts"

import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, toggleComment, indentWithTab, insertTab } from "@codemirror/commands";
import { HighlightStyle, LRLanguage, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap, placeholder, type Command, type KeyBinding } from "@codemirror/view";
import { styleTags, tags } from "@lezer/highlight";


// Very much work in progress
const syntax_colors = syntaxHighlighting(
  HighlightStyle.define(
    [
    //   { tag: tags.name, color: "var(--fg)" },
      { tag: tags.propertyName, color: "var(--purple)" },
      { tag: tags.variableName, color: "var(--yellow)" },
      { tag: tags.comment, color: "var(--grey1)" },
      { tag: tags.atom, color: "var(--blue)" },

      { tag: tags.punctuation, color: "var(--grey1)" },
      { tag: tags.literal, color: "var(--green)" },

      { tag: tags.operator, color: "var(--blue)", /*fontWeight: "bold"*/ },
      { tag: tags.keyword, color: "var(--red)" },
      { tag: tags.number, color: "var(--purple)" },
			
      { tag: tags.angleBracket, color: "var(--red)" },
      { tag: tags.brace, color: "var(--red)" },
      { tag: tags.paren, color: "var(--aqua)" },
      { tag: tags.separator, color: "var(--grey1)" },
      { tag: tags.squareBracket, color: "var(--grey1)" },

      { tag: tags.special(tags.atom), color: "var(--orange)" },
      { tag: tags.special(tags.keyword), color: "var(--orange)" },
      { tag: tags.special(tags.operator), color: "var(--blue)" },
    ],
    // { all: { color: "#585858" } }
  )
);


const parserWithMeta = parser.configure({
    props: [
        styleTags({
            Comment: tags.lineComment,
            String: tags.propertyName,
            Number: tags.number,
            ",": tags.separator,
            "[ ]": tags.squareBracket,
            ":{ }:": tags.brace,
            "{ }": tags.brace,
            "( )": tags.paren,
            ":": tags.operator,
            "=": tags.operator,
            Ellipsis: tags.operator,
            StructOpenSimp: tags.angleBracket,  // <
            StructCloseSimp: tags.angleBracket, // >
            StructOpenComp: tags.angleBracket,  // ⟨
            StructCloseComp: tags.angleBracket, // ⟩
            Underline: tags.operator,
            Pipe: tags.special(tags.operator),
            Slash: tags.special(tags.operator),
            Arrow: tags.special(tags.operator),
            ArgMod: tags.atom,
            Upper: tags.atom,
            Greek: tags.atom,
            Ipa: tags.literal,
            Group: tags.variableName,
            Empty: tags.special(tags.atom),
            Meta:  tags.special(tags.atom),
            CrossBound: tags.keyword,
            WordBound: tags.keyword,
            SyllBound: tags.keyword,
            Syllable: tags.special(tags.keyword),
        })
    ]
});
    
const language = LRLanguage.define({
        parser: parserWithMeta,
        languageData: {
        commentTokens: { line: ";;" },
    },
});

// So that hotkeys still work
let preventDefault: Command = (_ev: EditorView) => { return true }
const customBindings: KeyBinding[] = [
  {key: "Shift-Enter", run: preventDefault, preventDefault: true}, 
  {key: "Shift-Backspace", run: preventDefault , preventDefault: true},
  {key: "Ctrl-;", run: toggleComment , preventDefault: true},
  {key: "Tab", run: insertTab, preventDefault: true}
]

function createState(initial: string) {
    return EditorState.create({
          doc: initial,
          extensions: [
            history(),
            Prec.highest(keymap.of(customBindings)),
            keymap.of([indentWithTab]),
            keymap.of(historyKeymap),
            keymap.of(closeBracketsKeymap),
            keymap.of(defaultKeymap),
            language,
            language.data.of({closeBrackets: {brackets: [":{", "(", "[", '{', '<', '⟨']}}),
            closeBrackets(),
            syntax_colors,
            placeholder("Enter rule(s) here..."),
          ],
    });
}

export function createEditor(parent: Element, initial: string = "") {
    return new EditorView({ state: createState(initial), parent });
}

