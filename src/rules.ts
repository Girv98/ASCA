
import { createEditor } from "./editor";
import { /*addResizeEvents, */createRuleEvents, resize } from "./main";
import { blockTemplate } from "./templates";
import { EditorView } from '@codemirror/view';

let DEMO = document.getElementById("demo")!;
let CLEAR_ALL= document.getElementById("clear-all") as HTMLButtonElement;
let RULE_HIDDEN = document.getElementById("rule-thing")!.querySelector(".hidden-text")!;
let ADD_BUTTON = document.getElementById("add")!;
let DIR_BUTTON = document.getElementById("updown")!;
let COL_BUTTON = document.getElementById("collapse")! as HTMLButtonElement;
let ACT_BUTTON = document.getElementById("activate") as HTMLButtonElement;

export type Rule = {
    name: string,
    rule: string[], 
    description: string
}

export function ruleEquals(a: Rule, b: Rule) {
    return a.name === b.name 
        && a.rule.join() === b.rule.join() 
        && a.description === b.description
}

export class Rules {
    private editors: EditorView[];
    private toCollapse: boolean;
    private allActive: boolean;
    private dirEnd: boolean;


    constructor() {
        this.editors = []
        this.toCollapse = true;
        this.allActive = true;
        this.dirEnd = true;
    }

    public printEditors() {
        this.editors.forEach(val => console.log(val.state.doc.toString()));
    }

    public move(x: number, y:number) {
        if (x !== y){
            let tmp = this.editors[x];
            this.editors.splice(x, 1);
            this.editors.splice(y, 0, tmp);
        }
        // this.printEditors();
    }

    public moveEnd(x: number) {
        let len = this.editors.length;
        if (len && len > x) {
            this.move(x, len-1)
        }
    }

    public moveBegin(x: number) {
        let len = this.editors.length;
        if (len && len > x) {
            this.move(x, 0)
        }
    }

    public moveUpWrap(x: number) {
        let len = this.editors.length;
        if (!len) return;

        if (x > 0) {
            this.move(x, x-1)
        } else if (x === 0) {
            this.move(x, len-1)
        }
    }

    public moveDownWrap(x: number) {
        let len = this.editors.length;
        if (!len) return;

        if (len - 1 > x) {
            this.move(x, x+1)
        } else if (x > 0) {
            this.move(x, 0)
        }
    }

    private attachEditor(ruleEl: HTMLElement, at_end: boolean) {
        let view = createEditor(ruleEl.querySelector(".rule-cont")!);
        if (at_end) {
            this.editors.push(view)
        } else {
            this.editors.unshift(view)
        }
    }

    private updateHidden() {
        let plurality = (this.editors.length === 1) ? "rule" : "rules";
        RULE_HIDDEN.textContent = `${this.editors.length} ${plurality} hidden`;
    }

    public addHandle(ruleEl: HTMLElement) {
        if (window.innerWidth > 650 ) {
            ruleEl.querySelector(".title")!.classList.add("handle");
            ruleEl.querySelector(".grabber")!.classList.remove("handle");
        } else {
            ruleEl.querySelector(".title")!.classList.remove("handle");
            ruleEl.querySelector(".grabber")!.classList.add("handle");
        }
    }

    public handleLeftRight(ruleEl: HTMLElement) {
        console.log("Hiu")
        if (document.getElementById("small-screen-direction")!.querySelector("i")!.classList.contains("fa-align-right")) {
            ruleEl.querySelector(".element-asdf")!.classList.add("right");
        } else {
            ruleEl.querySelector(".element-asdf")!.classList.remove("right");
        }
    }

    public addRuleEnd() {
        DEMO.insertAdjacentHTML("beforeend", blockTemplate);
        DEMO.lastElementChild!.querySelector(".clone i")!.classList.add('fa-rotate-90')
        this.attachEditor(DEMO.lastElementChild as HTMLElement, true);
        createRuleEvents(DEMO.lastElementChild as HTMLElement);
        this.updateCollapse(true);
        this.updateActive(true);
        this.addHandle(DEMO.lastElementChild as HTMLElement);
        this.handleLeftRight(DEMO.lastElementChild as HTMLElement)
        this.updateHidden();
    }

    public addRuleBegin() {
        DEMO.insertAdjacentHTML("afterbegin", blockTemplate);
        DEMO.firstElementChild!.querySelector(".clone")!.querySelector("i")!.title = "Copy Rule Above"
        this.attachEditor(DEMO.firstElementChild as HTMLElement, false);
        createRuleEvents(DEMO.firstElementChild as HTMLElement);
        this.updateCollapse(true);
        this.updateActive(true);
        this.addHandle(DEMO.firstElementChild as HTMLElement);
        this.handleLeftRight(DEMO.firstElementChild as HTMLElement)
        this.updateHidden();
    }

    public addRule() {
        CLEAR_ALL.disabled = false;
        if (this.dirEnd) {
            this.addRuleEnd();
        } else {
            this.addRuleBegin();
        }
    }

    public changeDirectionUp() {
        if (this.dirEnd) {
            this.toggleDirection()
        }
    }

    public changeDirectionDown() {
        if (!this.dirEnd) {
            this.toggleDirection()
        }
    }

    public toggleDirection() {
        let txt = "Copy Rule Above"
        if (this.dirEnd) {
            DIR_BUTTON.querySelector("i")!.classList.replace('fa-chevron-down', 'fa-chevron-up')
            DIR_BUTTON.title = "Change add direction to end"
            ADD_BUTTON.title = "Add rule to beginning"
            this.dirEnd = false;
        } else {
            DIR_BUTTON.querySelector("i")!.classList.replace('fa-chevron-up', 'fa-chevron-down')
            DIR_BUTTON.title = "Change add direction to beginning"
            ADD_BUTTON.title = "Add rule to end"
            this.dirEnd = true;
            txt = "Copy Rule Below"
        }

        document.querySelectorAll(".draggable-element").forEach(el => {
            let copyButton = el.querySelector(".clone")!.querySelector("i")!;
            copyButton.classList.toggle('fa-rotate-90')
            copyButton.title = txt
        })
    }

    public clearForLoad() {
        document.querySelectorAll('.draggable-element').forEach(e => e.remove());
        this.editors.length = 0;
        this.updateHidden();
    }

    public clearRules() {
        if (!this.editors.length) { return }

        if (confirm("Are you sure you want to remove all rules?") === true) {
            document.querySelectorAll('.draggable-element').forEach(e => e.remove());
            this.editors.length = 0;
            this.updateCollapse(null);
            this.updateActive(null);
            CLEAR_ALL.disabled = true;
            this.updateHidden();
        }
    }

    public updateCollapse(col: boolean | null) {
        if (col === true) {
            COL_BUTTON.disabled = false;
            COL_BUTTON.innerHTML = "Collapse"
            this.toCollapse = true;
        } else if (col === false) {
            COL_BUTTON.disabled = false;
            COL_BUTTON.innerHTML = "&nbsp;Expand&nbsp;"
            this.toCollapse = false;
        } else {
            COL_BUTTON.disabled = true;
            COL_BUTTON.innerHTML = "Collapse"
            this.toCollapse = true;
        }
    }

    public updateActive(act: boolean | null) {
        if (act === true) {
            ACT_BUTTON.disabled = false;
            ACT_BUTTON.innerHTML = "Disable All"
            this.allActive = true;
        } else if (act === false) {
            ACT_BUTTON.disabled = false;
            ACT_BUTTON.innerHTML = "&nbspEnable All"
            this.allActive = false;
        } else {
            ACT_BUTTON.disabled = true;
            ACT_BUTTON.innerHTML = "&nbspEnable All"
            this.allActive = true;
        }
    }

    public collapseRules() {
        if (!this.editors.length) { return }

        let els = document.querySelectorAll(".draggable-element");

        if (this.toCollapse) {
            els.forEach(el => {
                el.querySelector(".maxmin i")!.classList.replace('fa-minus', 'fa-plus')
                el.querySelector(".cont")!.classList.add('invisible');
            })
            this.updateCollapse(false)
        } else {
            els.forEach(el => {
                el.querySelector(".maxmin i")!.classList.replace('fa-plus', 'fa-minus')
                el.querySelector(".cont")!.classList.remove('invisible');
            })
            this.updateCollapse(true)
        }
    }

    public activateRules() {
        if (!this.editors.length) { return }

        let els = document.querySelectorAll(".draggable-element");

        if (this.allActive) {
            els.forEach(el => {
                el.querySelector(".onoff i")!.classList.replace('fa-toggle-on', 'fa-toggle-off')
                el.classList.add('ignore');
            })
            this.updateActive(false)
        } else {
            els.forEach(el => {
                el.querySelector(".onoff i")!.classList.replace('fa-toggle-off', 'fa-toggle-on')
                el.classList.remove('ignore');
            })
            this.updateActive(true)
        }
    }

    public static traceRules(indices: Uint32Array<ArrayBufferLike>) {
        let els = [...document.querySelectorAll(".draggable-element")];

        let actives = this.getRuleActiveBoxes();

        els = els.filter((_val, index) => actives[index])

        indices.forEach((val) => {
            els[val].classList.add('traced');
        })
    }

    public static removeTrace() {
        let els = document.querySelectorAll(".draggable-element");
        els.forEach((el) => el.classList.remove('traced'));
    }

    public getRules(): Rule[] {
        let list: Rule[] = [];
        let els = document.querySelectorAll(".draggable-element");

        els.forEach((el, index) => {
            let name = (el.querySelector('.name')! as HTMLInputElement).value;
            let rule = this.editors[index].state.doc.toString().split('\n');
            let description = (el.querySelector('.description')! as HTMLTextAreaElement).value;
            let ruleObj: Rule = {
                name,
                rule,
                description
            };
            list.push(ruleObj);
        })

        return list
    }

    public removeRule(el: HTMLElement) {
        if (confirm("Are you sure you want to remove this rule?") === true) {
            let index = Array.prototype.indexOf.call(el.parentNode!.children, el)
            this.editors.splice(index, 1);
            
            el.remove();
            let activeArr = Rules.getRuleActiveBoxes();
            if (!activeArr.length) {
                this.updateActive(null);
            } else if (!activeArr.some((e) => e == false)) {
                this.updateActive(true);
            }
            let closedArr = Rules.getRuleClosedBoxes();
            if (!closedArr.length) {
                this.updateCollapse(null) 
            } else if (!closedArr.some((e) => e == false)) {
                this.updateCollapse(false)
            }

            if (!this.editors.length) {
                CLEAR_ALL.disabled = true;
            }
            this.updateHidden();
        }
    }

    public static getRuleActiveBoxes(): boolean[] {
        let activeList: boolean[] = [];
        let els = [...document.querySelectorAll(".draggable-element")];

        els.forEach(el => {
            if (el.querySelector('.onoff i')!.classList.contains('fa-toggle-on')) {
                activeList.push(true)
            } else {
                activeList.push(false)
            }
        })
        return activeList
    }

    public static getRuleClosedBoxes(): boolean[] {
        let closedList: boolean[] = [];
        let els = [...document.querySelectorAll(".draggable-element")];

        els.forEach(el => {
            if (el.querySelector('.maxmin i')!.classList.contains('fa-plus')) {
                closedList.push(true)
            } else {
                closedList.push(false)
            }
        })
        return closedList
    }

    public makeRule(name: string, rule: string, desc: string, ruleClosed: boolean, ruleActive: boolean) {
        DEMO.insertAdjacentHTML("beforeend", blockTemplate);
        let ruleElement = DEMO.lastChild! as HTMLElement;

        (ruleElement.querySelector(".name")! as HTMLInputElement).value = name;

        let view = createEditor(ruleElement.querySelector(".rule-cont")!, rule);
        this.editors.push(view);

        let d = ruleElement.querySelector(".description") ! as HTMLTextAreaElement;
        d.value = desc;
        resize(d);

        if (ruleClosed) {
            ruleElement.querySelector(".maxmin i")!.classList.replace('fa-minus', 'fa-plus')
            ruleElement.querySelector(".cont")!.classList.toggle('invisible');
        }

        if (!ruleActive) {
            ruleElement.querySelector(".onoff i")!.classList.replace('fa-toggle-on', 'fa-toggle-off')
            ruleElement.classList.add('ignore')
        }

        if (this.dirEnd) {
            ruleElement.querySelector(".clone i")!.classList.add('fa-rotate-90')
        }

        createRuleEvents(ruleElement);
        this.addHandle(ruleElement);
        this.handleLeftRight(ruleElement);
        this.updateHidden();
    }

    public cloneRuleFocus(el: HTMLElement) {
        this.dirEnd = !this.dirEnd;
        this.cloneRule(el);
        this.dirEnd = !this.dirEnd;
    }

    public cloneRule(el: HTMLElement) {
        let index = Array.prototype.indexOf.call(el.parentNode!.children, el)
        let clone = el.cloneNode(true) as HTMLElement;

        clone.querySelector(".cm-editor")!.remove()

        let clonedView = createEditor(clone.querySelector(".rule-cont")!, this.editors[index].state.doc.toString())
        createRuleEvents(clone)
        if (this.dirEnd) {
            el.parentNode!.insertBefore(clone, el.nextSibling);
            this.editors.splice(index+1, 0, clonedView)
        } else {
            el.parentNode!.insertBefore(clone, el);
            this.editors.splice(index, 0, clonedView)
        }
        this.updateHidden();
    }
}

