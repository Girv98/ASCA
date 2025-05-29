
import { createEditor } from "./editor";
// import { checkMoveOrDup, ruleHandleKeyboardDown, ruleHandleKeyboardUp } from "./hotkeys";
import { /*addResizeEvents, */createRuleEvents, resize } from "./main";
import { blockTemplate } from "./templates";
import { EditorView } from '@codemirror/view';


export type Rule = {
    name: string,
    rule: string[], 
    description: string
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

    public addRuleEnd() {
        let demo = document.getElementById("demo")!;
        demo.insertAdjacentHTML("beforeend", blockTemplate);
        demo.lastElementChild!.querySelector(".clone i")!.classList.add('fa-rotate-90')
        this.attachEditor(demo.lastElementChild as HTMLElement, true);
        createRuleEvents(demo.lastElementChild as HTMLElement);
        this.updateCollapse(true);
        this.updateActive(true);
    }

    public addRuleBegin() {
        let demo = document.getElementById("demo")!;
        demo.insertAdjacentHTML("afterbegin", blockTemplate);
        demo.firstElementChild!.querySelector(".clone")!.querySelector("i")!.title = "Copy Rule Above"
        this.attachEditor(demo.firstElementChild as HTMLElement, false);
        createRuleEvents(demo.firstElementChild as HTMLElement);
        this.updateCollapse(true)
        this.updateActive(true)
    }

    public addRule() {
        (document.getElementById("clear-all") as HTMLButtonElement).disabled = false;
        if (this.dirEnd) {
            this.addRuleEnd();
        } else {
            this.addRuleBegin();
        }
    }

    public changeDirection() {
        let addButton = document.getElementById("add")!;
        let upDownButton = document.getElementById("updown")!;
        let txt = "Copy Rule Above"
        if (this.dirEnd) {
            upDownButton.querySelector("i")!.classList.replace('fa-chevron-down', 'fa-chevron-up')
            upDownButton.title = "Change add direction to end"
            addButton.title = "Add rule to beginning"
            this.dirEnd = false;
        } else {
            upDownButton.querySelector("i")!.classList.replace('fa-chevron-up', 'fa-chevron-down')
            upDownButton.title = "Change add direction to beginning"
            addButton.title = "Add rule to end"
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
        (document.getElementById("clear-all") as HTMLButtonElement).disabled = true;
    }

    public clearRules() {
        if (!this.editors.length) { return }

        if (confirm("Are you sure you want to remove all rules?") === true) {
            document.querySelectorAll('.draggable-element').forEach(e => e.remove());
            this.editors.length = 0;
            this.updateCollapse(null);
            this.updateActive(null);
            (document.getElementById("clear-all") as HTMLButtonElement).disabled = true;
        }
    }

    public updateCollapse(col: boolean | null) {
        let button = document.getElementById("collapse")! as HTMLButtonElement;
        if (col === true) {
            button.disabled = false;
            button.innerHTML = "Collapse"
            this.toCollapse = true;
        } else if (col === false) {
            button.disabled = false;
            button.innerHTML = "Reexpand"
            this.toCollapse = false;
        } else {
            button.disabled = true;
            button.innerHTML = "Collapse"
            this.toCollapse = true;
        }
    }

    public updateActive(act: boolean | null) {
        let button = document.getElementById("activate") as HTMLButtonElement;
        if (act === true) {
            button.disabled = false;
            button.innerHTML = "Disable All"
            this.allActive = true;
        } else if (act === false) {
            button.disabled = false;
            button.innerHTML = "&nbspEnable All"
            this.allActive = false;
        } else {
            button.disabled = true;
            button.innerHTML = "&nbspEnable All"
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
        let els = document.querySelectorAll(".draggable-element");

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
            // let rule = (el.querySelector('.rule')! as HTMLTextAreaElement).value.split('\n');
            // this.editors.forEach((val) => val.state.doc.toString())
            let rule = this.editors[index].state.doc.toString().split('\n');
            let description = (el.querySelector('.description')! as HTMLTextAreaElement).value;
            let obj: Rule = {
                name,
                rule,
                description
            };
            list.push(obj);
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
                (document.getElementById("clear-all") as HTMLButtonElement).disabled = true;
            }
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
        let demo = document.getElementById("demo")!;
        demo.insertAdjacentHTML("beforeend", blockTemplate);
        let ruleElement = demo.lastChild! as HTMLElement;

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
    }
}

