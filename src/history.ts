import { nanoid } from "nanoid";
import { historyTemplate } from "./templates";
import { type Rule, Rules as RulesClass }  from './rules.js';
import { createHistoryEvents, resize } from "./main.js";

let ALIAS_INTO = document.getElementById("alias-into") as HTMLTextAreaElement;
let ALIAS_FROM = document.getElementById("alias-from") as HTMLTextAreaElement;
let CLEAR_ALL= document.getElementById("clear-all") as HTMLButtonElement;
let LEXICON = document.getElementById("lexicon") as HTMLTextAreaElement;
let TRACE = document.getElementById("trace") as HTMLSelectElement;
let HIST_MODAL = document.getElementById('history-modal') as HTMLDialogElement;

class Data {
    id: string;

    words: string[];
    rules: Rule[];
    aliasFrom: string[];
    aliasInto: string[];

    ruleStates: boolean[];
    ruleActives: boolean[];
    traceState: number;

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

        createdAt?: number, 
        lastModified?: number
    ) {
        this.id = id;
        this.words = words ?? [];
        this.rules = rules ?? []
        this.aliasFrom = aliasFrom ?? [];
        this.aliasInto = aliasInto ?? [];

        this.ruleStates = ruleStates ?? new Array<boolean>(this.rules.length).fill(false);
        this.ruleActives = ruleActives ?? new Array<boolean>(this.rules.length).fill(true);
        this.traceState = traceState ?? -1;

        this.createdAt = createdAt ?? Date.now();
        this.lastModified = lastModified ?? this.createdAt;
    }

    equals(other: Data): boolean {
        return this.words.join() === other.words.join()
            && JSON.stringify(this.rules) === JSON.stringify(other.rules)
            && this.aliasFrom.join() === other.aliasFrom.join()
            && this.aliasInto.join() === other.aliasInto.join()
            && this.ruleStates.join() === other.ruleStates.join()
            && this.ruleActives.join() === other.ruleActives.join()
            && this.traceState === other.traceState
    }
}

export class Lines {
    private view: RulesClass;
    private lines: Map<string, Data>;
    private activeId: string;

    constructor(editorView: RulesClass) {
        this.view = editorView;
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
        createdAt?: number, 
        lastModified?: number,
    ) {
        let newID = id ?? this.createId();
        this.lines.set(
            newID, 
            new Data(newID, words, rules, aliasFrom, aliasTo, ruleStates, ruleActives, traceState, createdAt, lastModified)
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

        if (newId === "") {
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
            LEXICON.value.split("\n"),
            this.view.getRules(),
            ALIAS_FROM.value.split("\n"),
            ALIAS_INTO.value.split("\n"),
            RulesClass.getRuleClosedBoxes(),
            RulesClass.getRuleActiveBoxes(),
            +(TRACE.value)
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
        createdAt?: number, 
        lastModified?: number,
    ) {

        let data = this.getLineData(id)!;
        
        data.words = words ?? LEXICON.value.split("\n");
        data.rules = rules ?? this.view.getRules();
        data.aliasFrom = aliasFrom ?? ALIAS_FROM.value.split("\n");
        data.aliasInto = aliasTo ?? ALIAS_INTO.value.split("\n");
        data.ruleStates = ruleStates ?? RulesClass.getRuleClosedBoxes();
        data.ruleActives = ruleActives ?? RulesClass.getRuleActiveBoxes();
        data.traceState = traceState ?? +(TRACE.value);
        data.createdAt = createdAt ?? data.createdAt;
        data.lastModified = lastModified ?? Date.now();

        this.lines.set(id, data);
        this.partialSetStorage(id);
    }

    public updateActiveStorage() {
        this.updateID(this.activeId);
    }

    public loadId(id: string) {
        // console.log("Loading " + id);

        let line = this.getLineData(id)!;

        let words = line.words;
        let rules = line.rules;
        let aliasFrom = line.aliasFrom;
        let aliasTo = line.aliasInto;
        
        let ruleStates = line.ruleStates;
        let ruleActive = line.ruleActives;
        let traceState = line.traceState;

        this.view.clearForLoad();

        if (ruleStates && rules) {
            if (ruleStates.length) {
                this.view.updateCollapse(ruleStates.some((e) => e == false))
            } else {
                this.view.updateCollapse(null)
            }
	    } else if (rules.length > 0) { this.view.updateCollapse(true) } else { this.view.updateCollapse(null) }
	
        if (ruleActive) {
            if (ruleActive.length) {
                this.view.updateActive(!ruleActive.some((e) => e == false));
            } else {
                this.view.updateActive(null)
            }
        } else if (rules.length > 0) { this.view.updateActive(true) } else { this.view.updateActive(null) }


        CLEAR_ALL.disabled = !rules.length;

        
        // Populate textareas 
        if (words) { LEXICON.value = words.join('\n') } else { LEXICON.value = '' }
        resize(LEXICON);
    
        if (aliasTo) { ALIAS_INTO.value = aliasTo.join('\n') } else { ALIAS_INTO.value = '' }
        resize(ALIAS_INTO);
    
        if (aliasFrom) { ALIAS_FROM.value = aliasFrom.join('\n') } else { ALIAS_FROM.value = '' }
        resize(ALIAS_FROM);

        if (rules) {
            for (let i = 0; i < rules.length; i++) {
                // Otherwise, this would be a breaking change
			    let rs = ruleStates ? ruleStates[i] : true;
			    let ra = ruleActive ? ruleActive[i] : true; 
                this.view.makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, rs, ra);
            }
        }

        if (words) {
            words.map((w: string, i: number) => {
                if (w !== "") {
                    let opt = document.createElement("option");
                    opt.value = `${i}`;
                    opt.innerHTML = w;
                    TRACE.append(opt);

                    if ((traceState || traceState === 0) && traceState === i) {
                        TRACE.value = `${traceState}`;
                    }
                }
            })		
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
        let stored = this.getLineStorage().get(this.activeId);

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


// TODO: option to load examples using this system