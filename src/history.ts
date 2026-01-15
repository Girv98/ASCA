import { nanoid } from "nanoid";
import { historyTemplate } from "./templates";
import { type Rule, Rules as RulesClass }  from './rules.js';
import { createHistoryEvents, escapeHTML, resize, type OutputFormat } from "./main.js";
import { encode } from "js-base64";
import type { EditorView } from "@codemirror/view";
import { createInput } from "./input.js";

let ALIAS_INTO = document.getElementById("alias-into") as HTMLTextAreaElement;
let ALIAS_FROM = document.getElementById("alias-from") as HTMLTextAreaElement;
let ALIAS_OPEN = document.getElementById("alias-modal-open") as HTMLButtonElement;
let ALIAS_TOGGLE= document.getElementById('alias-from-toggle') as HTMLButtonElement;
let CLEAR_ALL= document.getElementById("clear-all") as HTMLButtonElement;
let TRACE = document.getElementById("trace") as HTMLSelectElement;
let FORMAT = document.getElementById("format") as HTMLSelectElement;
let HIST_MODAL = document.getElementById('history-modal') as HTMLDialogElement;

export class Data {
    id: string;

    words: string[];
    rules: Rule[];
    aliasFrom: string[];
    aliasInto: string[];

    ruleStates: boolean[];
    ruleActives: boolean[];
    traceState: number;
    formatState: OutputFormat;

    aliasFromOn: boolean;

    createdAt: number;
    lastModified: number;

    constructor(
        id: string,

        words?: string[], 
        rules?: Rule[], 
        aliasFrom?: string[], 
        aliasInto?: string[], 

        ruleStates?: boolean[],
        ruleActives?: boolean[],
        traceState?: number,
        formatState?: OutputFormat,

        aliasFromOn?: boolean,

        createdAt?: number, 
        lastModified?: number,
    ) {
        this.id = id;
        this.words = words ?? [];
        this.rules = rules ?? []
        this.aliasFrom = aliasFrom ?? [];
        this.aliasInto = aliasInto ?? [];

        this.ruleStates = ruleStates ?? new Array<boolean>(this.rules.length).fill(false);
        this.ruleActives = ruleActives ?? new Array<boolean>(this.rules.length).fill(true);
        this.traceState = traceState ?? -1;
        this.formatState = formatState ?? "out";

        this.aliasFromOn = aliasFromOn ?? true;

        this.createdAt = createdAt ?? Date.now();
        this.lastModified = lastModified ?? this.createdAt;
    }

    public equals(other: Data): boolean {
        return this.words.join() === other.words.join()
            && JSON.stringify(this.rules) === JSON.stringify(other.rules)
            && this.aliasFrom.join() === other.aliasFrom.join()
            && this.aliasInto.join() === other.aliasInto.join()
            && this.ruleStates.join() === other.ruleStates.join()
            && this.ruleActives.join() === other.ruleActives.join()
            && this.traceState === other.traceState
            && this.formatState === other.formatState
            && this.aliasFromOn === other.aliasFromOn
    }
}


export class InputView {

    private editor: EditorView;
    
    constructor(parentElement: HTMLElement) {
        this.editor = createInput(parentElement)
    }

    public getString() {
        return this.editor.state.doc.toString()
    }

    public getLines() {
        return this.editor.state.doc.toString().split('\n')
    }

    setContent(str: string) {
        this.editor.dispatch(this.editor.state.update({
            changes: {
                from: 0, 
                to: this.editor.state.doc.length, 
                insert: str
            }
        }))
    }

    // public getSplit() {
    //     // TODO: return ([words], [comments])
    // }

    // TODO: Optimise so that we aren't recreating lines that haven't changed
    public updateTrace() {
        TRACE.length = 1;
        this.getLines().forEach((w, i) => {
            let line = w.trim();
            if (line && !line.startsWith("#")) {
                let opt = document.createElement("option");
                opt.value = `${i}`
                opt.innerHTML = escapeHTML(line);
                TRACE.append(opt)
            }
        })

        TRACE.value = "-1";
	    FORMAT.disabled = TRACE.value !== "-1";
    }

    // clearForLoad() { }
}

export class Lines {
    private inputView: InputView;
    private rulesView: RulesClass;
    private lines: Map<string, Data>;
    private activeId: string;

    constructor(editorView: RulesClass, inputView: InputView) {
        this.inputView = inputView
        this.rulesView = editorView;
        this.lines = new Map();
        this.activeId = "";
    }

    createId() { return nanoid(12) }

    public contains(id: string) {
        return this.lines.has(id)
    }

    // getSessionStorageActive() {
    //     return typeof sessionStorage["activeID"] !== 'undefined' ? sessionStorage["activeID"] : "";
    // }
    // setSessionStorageActive(val?: any) {
    //     if (typeof val === 'undefined') {
    //         delete sessionStorage["activeID"]
    //     } else {
    //         sessionStorage["activeID"] = val
    //     }
    // }

    public getActiveId() { return this.activeId; }
    
    public getActiveIdStorage() { return localStorage.getItem("asca-last-active") }
    
    public setActiveId(line: string) { 
        this.activeId = line; 
        localStorage.setItem("asca-last-active", line);
    }

    isValidID(id: string) { return id != null && id.length > 0; }

    getLineData(id: string) { 
        return this.lines.get(id); 
    }

    // WHY JAVASCRIPT WHY
    sharedEq(shared: Data): boolean {
        let x = this.getLineStorage().get(shared.id);
        if (x === undefined) { return false }
        
        let d = new Data(
            x.id,
            x.words,
            x.rules,
            x.aliasFrom,
            x.aliasInto,
            x.ruleStates,
            x.ruleActives,
            x.traceState,
            x.formatState,
            x.aliasFromOn,
            x.createdAt,
            x.lastModified
        );
        
        return d.equals(shared)
    }

    createShare(id: string) {
        const line = this.getLineData(id)!;        
        const encodedLine = encode(JSON.stringify(line), true);

        return `https://asca.girv.dev/?share=${encodedLine}`
    }

    parseData(str: string): Data | null {
        str = str != null && str.length ? str : '{}';
        try {
            return JSON.parse(str) as Data;
        } catch {
            return null;
        }
    }

    parseJSON(json: any): Map<string, Data> {
        json = json != null && json.length ? json : '{}';
        try {
            return new Map(JSON.parse(json));
        } catch {
            return new Map();
        }
    };

    getLineStorage() { return this.parseJSON(localStorage.getItem("asca-data")) ?? new Map<string, Data> }

    setLineStorage() {
        localStorage.setItem("asca-data", JSON.stringify([...this.lines]));
    }

    partialSetStorage(id: string) {
        let storage = this.getLineStorage();
        storage.set(id, this.lines.get(id)!);
        localStorage.setItem("asca-data", JSON.stringify([...storage]));
    }

    partialDeleteStorage(id: string) {
        let storage = this.getLineStorage();
        storage.delete(id);
        localStorage.setItem("asca-data", JSON.stringify([...storage]));
    }

    clearLineStorage() {
        localStorage.setItem("asca-data", "[]");
    }

    loadFromStorage() {
        this.lines = this.getLineStorage();

        let lastId = this.getActiveIdStorage();
        if (lastId === null) {
            CLEAR_ALL.disabled = true;
			document.querySelectorAll('.draggable-element').forEach(e => e.remove());
            return;
        }

        this.loadId(lastId);
    }

    create(
        words?: string[], 
        rules?: Rule[], 
        aliasFrom?: string[], 
        aliasTo?: string[], 
        id?: string,
        ruleStates?: boolean[],
        ruleActives?: boolean[],
        traceState?: number,
        formatState?: OutputFormat,
        aliasFromOn?: boolean,
        createdAt?: number, 
        lastModified?: number,
    ) {
        let newID = id ?? this.createId();
        this.lines.set(
            newID, 
            new Data(newID, words, rules, aliasFrom, aliasTo, ruleStates, ruleActives, traceState, formatState, aliasFromOn, createdAt, lastModified)
        )

        return newID;
    }

    public createNew() {
        if (!this.checkUnsaved()) { return }

        let id = this.create();
        this.partialSetStorage(id);
        this.loadId(id);
        this.updateModal();
    }

    setNewCustomId(curId: string, newId: string) {
        if (curId === newId) { return }

        if (!newId.trim()) {
            alert("New ID cannot be empty.");
            return this.populateModal(HIST_MODAL);
        }

        if (this.lines.has(newId)) {
            alert(`A save of the ID "${newId}" already exists.`);
            return this.populateModal(HIST_MODAL);
        }

        let x = structuredClone((this.lines.get(curId) as Data));
        x.id = newId;
        this.lines.set(newId, x);
        this.lines.delete(curId);
        
        this.partialSetStorage(newId);
        this.partialDeleteStorage(curId);

        if (this.activeId === curId) {
            this.setActiveId(newId);
        }

        this.populateModal(HIST_MODAL);
    }

    getDeFacto() {
        return new Data(
            this.activeId,
            this.inputView.getLines(),
            this.rulesView.getRules(),
            ALIAS_FROM.value.split("\n"),
            ALIAS_INTO.value.split("\n"),
            RulesClass.getRuleClosedBoxes(),
            RulesClass.getRuleActiveBoxes(),
            +(TRACE.value),
            FORMAT.value as OutputFormat,
            !ALIAS_FROM.classList.contains('ignore')
        )
    }

    updateID(
        id: string,
        words?: string[], 
        rules?: Rule[], 
        aliasFrom?: string[], 
        aliasTo?: string[], 
        ruleStates?: boolean[],
        ruleActives?: boolean[],
        traceState?: number,
        formatState?: OutputFormat,
        aliasFromOn?: boolean,
        createdAt?: number, 
        lastModified?: number,
    ) {

        let data = this.getLineData(id)!;
        
        data.words = words ?? this.inputView.getLines();
        data.rules = rules ?? this.rulesView.getRules();
        data.aliasFrom = aliasFrom ?? ALIAS_FROM.value.split("\n");
        data.aliasInto = aliasTo ?? ALIAS_INTO.value.split("\n");
        data.ruleStates = ruleStates ?? RulesClass.getRuleClosedBoxes();
        data.ruleActives = ruleActives ?? RulesClass.getRuleActiveBoxes();
        data.traceState = traceState ?? +(TRACE.value);
        data.formatState = formatState ?? FORMAT.value as OutputFormat; 
        data.createdAt = createdAt ?? data.createdAt;
        data.lastModified = lastModified ?? Date.now();

        data.aliasFromOn = aliasFromOn ?? !ALIAS_FROM.classList.contains('ignore');

        this.lines.set(id, data);
        this.partialSetStorage(id);
    }

    public updateActiveStorage() {
        this.updateID(this.activeId);
    }

    public loadId(id: string) {

        let line = this.getLineData(id)!;

        let words = line.words;
        let rules = line.rules;
        let aliasFrom = line.aliasFrom;
        let aliasTo = line.aliasInto;
        
        let ruleStates = line.ruleStates;
        let ruleActive = line.ruleActives;
        let traceState = line.traceState ?? -1;
        let formatState = line.formatState ?? "out";

        let aliasFromOn = line.aliasFromOn ?? true;

        this.rulesView.clearForLoad();

        if (ruleStates && rules) {
            if (ruleStates.length) {
                this.rulesView.updateCollapse(ruleStates.some((e) => e == false))
            } else {
                this.rulesView.updateCollapse(null)
            }
	    } else if (rules.length > 0) { this.rulesView.updateCollapse(true) } else { this.rulesView.updateCollapse(null) }
	
        if (ruleActive) {
            if (ruleActive.length) {
                this.rulesView.updateActive(!ruleActive.some((e) => e == false));
            } else {
                this.rulesView.updateActive(null)
            }
        } else if (rules.length > 0) { this.rulesView.updateActive(true) } else { this.rulesView.updateActive(null) }


        CLEAR_ALL.disabled = !rules.length;

        // Populate textareas 
        if (words) {
            this.inputView.setContent(words.join('\n'));
        } else {
            this.inputView.setContent('');
        }
        
        if (aliasTo) { ALIAS_INTO.value = aliasTo.join('\n') } else { ALIAS_INTO.value = '' }
        resize(ALIAS_INTO);
    
        if (aliasFrom) { ALIAS_FROM.value = aliasFrom.join('\n') } else { ALIAS_FROM.value = '' }
        resize(ALIAS_FROM);

        if (rules) {
            for (let i = 0; i < rules.length; i++) {
                // Otherwise, this would be a breaking change
			    let rs = ruleStates ? ruleStates[i] : true;
			    let ra = ruleActive ? ruleActive[i] : true; 
                this.rulesView.makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, rs, ra);
            }
        }

        if (words) {
            words.map((w: string, i: number) => {
                if (w !== "") {
                    let opt = document.createElement("option");
                    opt.value = `${i}`;
                    opt.innerHTML = w;
                    TRACE.append(opt);
                }
            })		
        }
        
        this.inputView.updateTrace();
        TRACE.value =  `${traceState}`;
        FORMAT.value = formatState;
        FORMAT.disabled  = TRACE.value !== "-1"

        let ti = ALIAS_TOGGLE.querySelector('i')!;
        if (aliasFromOn) {
            ti.classList.replace('fa-toggle-off', 'fa-toggle-on');
            ALIAS_FROM.classList.remove('ignore');
            ALIAS_OPEN.classList.remove('off');
            ALIAS_TOGGLE.classList.remove('off');
        } else {
            ti.classList.replace('fa-toggle-on', 'fa-toggle-off');
            ALIAS_TOGGLE.classList.add('off');
            ALIAS_OPEN.classList.add('off');
            ALIAS_FROM.classList.add('ignore');
        }

        this.setActiveId(id);
        console.log(id + " loaded");
    }

    public clearAll() {
        if (confirm("This will permanently delete everything. Are you really sure?")) {
            this.clearLineStorage();
            let id = this.create();
            this.loadId(id);
        }
    }

    private checkUnsaved() {
        let current  = this.getDeFacto();
        let stored = this.getLineStorage().get(this.activeId)!;

        if (stored === undefined || current.equals(stored)) { return true }


        return confirm("You have unstored changes. Are you sure you wish to load a new save?");
    }

    public exportLine(id: string) {
        let line = (id === this.activeId) ? this.getDeFacto() : this.getLineData(id)!;

        let obj = {
            words: line.words,
            rules: line.rules, 
            into: line.aliasInto, 
            from: line.aliasFrom
        }

        let objJSON = JSON.stringify(obj);

        let name = id.length ? id : "sound_changes";

        let a = document.createElement('a');
        a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(objJSON);
        a.download = `${name}.json`;
        a.click();
        a.remove();
    }

    public populateModal(modal: HTMLDialogElement) {

        let sortedLines = [...this.lines].sort((a, b) => 
            a[1].createdAt - b[1].createdAt
        )

        let content = modal.querySelector(".modal-content")!;
        content.querySelectorAll(".history-item").forEach(e => e.remove());

        let now = new Date();
        sortedLines.forEach(([valId, val]) => {
            content.insertAdjacentHTML("beforeend", historyTemplate);
            let el = content.lastElementChild!;
            let id_span = el.querySelector(".history-id") as HTMLSpanElement;
            id_span.innerText = val.id;

            // let created_time = el.querySelector(".history-made-time time") as HTMLTimeElement;
            // let created = new Date(val.createdAt);
            // created_time.innerText = getTimeDiff(now, created);
            // created_time.setAttribute("datetime", created.toISOString());

            let mod_time = el.querySelector(".history-mod-time time") as HTMLTimeElement;
            let then = new Date(val.lastModified);
            mod_time.innerText = getTimeDiff(now, then);
            mod_time.setAttribute("datetime", then.toISOString());

            if (valId === this.activeId) {
                el.classList.add("active")
            }

            createHistoryEvents(el);
        });
    }

    public updateModal() {
        this.populateModal(HIST_MODAL);
    }

    public histLoad(id: string) {
        if (!this.checkUnsaved()) { return false }

        this.loadId(id);

        return true;
    }

    public exportActive() {
        this.exportLine(this.activeId)
    }

    public histExport(id: string) {
        this.exportLine(id);
    }

    public histShare(id: string) {
        const link = this.createShare(id);
        console.log(link);
        navigator.clipboard.writeText(link);
        alert(`Link for '${id}' copied to clipboard. Backup printed to browser console.`);
    }

    public histRename(newId: string, origId: string) {
        this.setNewCustomId(origId, newId)
    }

    public histDelete(id: string) {
        let sortedKeys = Array.from(new Map([...this.lines].sort((a, b) => 
            a[1].createdAt - b[1].createdAt
        )).keys());

        if (sortedKeys.length === 1) {
            alert("Cannot delete the only save");
            return;
        }

        if (!confirm(`This will permanently delete "${id}". Are you really sure?`)) {
            return;
        }            

        if (id === this.activeId) {
            let ind = sortedKeys.findIndex((val) => val === id);

            if (ind === 0) { 
                // We know there is at least 2 
                this.loadId(sortedKeys[1])
            } else {
                this.loadId(sortedKeys[ind-1])
            }
        }

        this.lines.delete(id);
        this.partialDeleteStorage(id);

        this.populateModal(HIST_MODAL);
    }
}

function getTimeDiff(now: Date, then: Date) {
    let diffSecs = Math.floor((now.getTime() - then.getTime()) / 1000);
    let diffDays = now.getDate() - then.getDate();
    let diffMonths = now.getMonth() - then.getMonth();
    let diffYears = now.getFullYear() - then.getFullYear();

    if (diffDays === 0 && diffSecs < 60) {
        let secs = diffSecs == 1 ? "sec" : "secs";
        return `${diffSecs} ${secs} ago`
    }

    if(diffYears === 0 && diffDays === 0 && diffMonths === 0) {
        return then.toLocaleTimeString([], {timeStyle: 'short'})
    } else if (diffYears === 0 && diffDays === 1 && diffMonths === 0) {
        return `Yesterday ${then.toLocaleTimeString([], {timeStyle: 'short'})}`
    } else {
        return `${then.toLocaleDateString([], {dateStyle: 'short'})} ${then.toLocaleTimeString([], {timeStyle: 'short'})}`
    }
}