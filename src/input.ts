import { parser } from "./input/parser.ts"


import { defaultKeymap, history, historyKeymap, indentWithTab, insertTab, toggleComment } from "@codemirror/commands";
import { HighlightStyle, LRLanguage, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Prec } from "@codemirror/state";
import { /*drawSelection,*/ EditorView, keymap, placeholder, type Command, type KeyBinding } from "@codemirror/view";
import { styleTags, tags } from "@lezer/highlight";

const syntax_colors = syntaxHighlighting(
    HighlightStyle.define([
        { tag: tags.comment, color: "var(--grey1)" },
        // { tag: tags.special(tags.string), color: "var(--fg)" },
    ])
);

const language = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                Comment: tags.lineComment,
                Phrase: tags.special(tags.string),
            })
        ]
    }),
    languageData: {
        commentTokens: { line: "#" },
    },
})


let preventDefault: Command = (_ev: EditorView) => { return true }
const customBindings: KeyBinding[] = [
    {key: "Shift-Enter", run: preventDefault, preventDefault: true}, 
    {key: "Shift-Backspace", run: preventDefault , preventDefault: true},
    {key: "Ctrl-#", run: toggleComment , preventDefault: true},
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
            keymap.of(defaultKeymap),
            language,
            syntax_colors,
            // drawSelection(),
            // EditorState.allowMultipleSelections.of(true),
            placeholder("Input lexicon in IPA format e.g.\nhɛˈləʊ\nˈlɔː.ɹm̩\nˈɪp.sm̩"),
            EditorView.updateListener.of((view) => {
                if (view.docChanged) {
                    document.dispatchEvent(InputViewUpdateEvent);
                }
            }),
        ]
    });
}

const InputViewUpdateEvent = new CustomEvent("InputViewChange");

export function createInput(parent: Element, initial: string = "") {
    return new EditorView({ state: createState(initial), parent });
}
