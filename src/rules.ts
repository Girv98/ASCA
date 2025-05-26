
import { checkMoveOrDup, ruleHandleKeyboardDown, ruleHandleKeyboardUp } from "./hotkeys";
import { addResizeEvents, resize } from "./main";
import { blockTemplate } from "./templates";

let toCollapse = true;
let allActive = true;
let dirEnd = true;

export function addRule() {
	if (dirEnd) {
		addRuleEnd()
	} else {
		addRuleBegin()
	}
}

export function addRuleEnd() {
    let demo = document.getElementById("demo")!;
    demo.insertAdjacentHTML("beforeend", blockTemplate);
    demo.lastElementChild!.querySelector(".clone i")!.classList.add('fa-rotate-90')
    createRuleEvents(demo.lastElementChild as HTMLElement);
    updateCollapse(true)
    updateActive(true)
}

export function addRuleBegin() {
	let demo = document.getElementById("demo")!;
	demo.insertAdjacentHTML("afterbegin", blockTemplate);
	demo.firstElementChild!.querySelector(".clone")!.querySelector("i")!.title = "Copy Rule Above"
	createRuleEvents(demo.firstElementChild as HTMLElement);
	updateCollapse(true)
	updateActive(true)
}

export function changeDirection() {
	let addButton = document.getElementById("add")!;
	let upDownButton = document.getElementById("updown")!;
	let txt = "Copy Rule Above"
	if (dirEnd) {
		upDownButton.querySelector("i")!.classList.replace('fa-chevron-down', 'fa-chevron-up')
		upDownButton.title = "Change add direction to end"
		addButton.title = "Add rule to beginning"
		dirEnd = false
	} else {
		upDownButton.querySelector("i")!.classList.replace('fa-chevron-up', 'fa-chevron-down')
		upDownButton.title = "Change add direction to beginning"
		addButton.title = "Add rule to end"
		dirEnd = true
		txt = "Copy Rule Below"
	}

	document.querySelectorAll(".draggable-element").forEach(el => {
		let copyButton = el.querySelector(".clone")!.querySelector("i")!;
		copyButton.classList.toggle('fa-rotate-90')
		copyButton.title = txt
	})
}

export function clearRules() {
	if (confirm("Are you sure you want to remove all rules?") === true) {
		document.querySelectorAll('.draggable-element').forEach(e => e.remove());
		updateCollapse(null)
		updateActive(null)
	}
}

export function updateCollapse(col: boolean | null) {
	let button = document.getElementById("collapse")! as HTMLButtonElement;
	if (col === true) {
		button.disabled = false;
		button.innerHTML = "Collapse"
		toCollapse = true
	} else if (col === false) {
		button.disabled = false;
		button.innerHTML = "Reexpand"
		toCollapse = false
	} else {
		button.disabled = true;
		button.innerHTML = "Collapse"
		toCollapse = true
	}
}

export function updateActive(act: boolean | null) {
	let button = document.getElementById("activate") as HTMLButtonElement;
	if (act === true) {
		button.disabled = false;
		button.innerHTML = "Disable All"
		allActive = true;
	} else if (act === false) {
		button.disabled = false;
		button.innerHTML = "&nbspEnable All"
		allActive = false;
	} else {
		button.disabled = true;
		button.innerHTML = "Enable&nbsp All"
		allActive = true;
	}
}


export function collapseRules() {
	let els = document.querySelectorAll(".draggable-element");

	if (toCollapse) {
		els.forEach(el => {
			el.querySelector(".maxmin i")!.classList.replace('fa-minus', 'fa-plus')
			el.querySelector(".cont")!.classList.add('invisible');
		})
		updateCollapse(false)
	} else {
		els.forEach(el => {
			el.querySelector(".maxmin i")!.classList.replace('fa-plus', 'fa-minus')
			el.querySelector(".cont")!.classList.remove('invisible');
		})
		updateCollapse(true)
	}
}

export function activateRules() {
	let els = document.querySelectorAll(".draggable-element");

	if (allActive) {
		els.forEach(el => {
			el.querySelector(".onoff i")!.classList.replace('fa-toggle-on', 'fa-toggle-off')
			el.classList.add('ignore');
		})
		updateActive(false)
	} else {
		els.forEach(el => {
			el.querySelector(".onoff i")!.classList.replace('fa-toggle-off', 'fa-toggle-on')
			el.classList.remove('ignore');
		})
		updateActive(true)
	}
}

export function traceRules(indices: Uint32Array<ArrayBufferLike>) {
    let els = document.querySelectorAll(".draggable-element");

    indices.forEach((val) => {
        els[val].classList.add('traced');
	})
}

export function removeTrace() {
    let els = document.querySelectorAll(".draggable-element");
    els.forEach((el) => el.classList.remove('traced'));
}

export type Rule = {
    name: string,
    rule: string[], 
    description: string
}


export function getRules(): Rule[] {
	let list: Rule[] = [];
	let els = document.querySelectorAll(".draggable-element");

	els.forEach(el => {
		let name = (el.querySelector('.name')! as HTMLInputElement).value;
		let rule = (el.querySelector('.rule')! as HTMLTextAreaElement).value.split('\n');
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

export function createRuleEvents(ruleEl: HTMLElement) {

    ruleEl.addEventListener('keydown', e => ruleHandleKeyboardDown(e));
    ruleEl.addEventListener('keyup', e => ruleHandleKeyboardUp(e));

    // x button
    ruleEl.querySelector('.delete')!.addEventListener('click', function(this: HTMLElement) {
        if (confirm("Are you sure you want to remove this rule?") === true) {
            this.closest(".draggable-element")!.remove();
            let activeArr = getRuleActiveBoxes();
            if (!activeArr.length) {
                updateActive(null);
            } else if (!activeArr.some((e) => e == false)) {
                updateActive(true);
            }
            let closedArr = getRuleClosedBoxes();
            if (!closedArr.length) {
                updateCollapse(null) 
            } else if (!closedArr.some((e) => e == false)) {
                updateCollapse(false)
            }
        }
    })
    // +/- button
    ruleEl.querySelector('.maxmin')!.addEventListener('click', function(this: HTMLElement) {
        let i = this.querySelector('i')!;
        if (i.classList.contains('fa-minus')) {
            i.classList.replace('fa-minus', 'fa-plus');
            if (!getRuleClosedBoxes().some((e) => e == false)) {
                updateCollapse(false)
            }
        } else {
            i.classList.replace('fa-plus', 'fa-minus');
            updateCollapse(true)
        }
        this.closest(".draggable-element")!.querySelector(".cont")!.classList.toggle('invisible')
    })
    // On/Off Button
    ruleEl.querySelector('.onoff')!.addEventListener('click', function(this: HTMLElement) {
    
        let i = this.querySelector('i')!;

        if (i.classList.contains('fa-toggle-off')) {
            i.classList.replace('fa-toggle-off', 'fa-toggle-on');
            updateActive(!getRuleActiveBoxes().some((e) => e == false));
        } else {
            i.classList.replace('fa-toggle-on', 'fa-toggle-off');
            updateActive(false);
        }
        this.closest(".draggable-element")!.classList.toggle('ignore')
    })
    // Copy Button
    ruleEl.querySelector('.clone')!.addEventListener('click', function(this: HTMLElement) {
        let el = this.closest(".draggable-element")!;
        let clone = el.cloneNode(true) as HTMLElement;
        createRuleEvents(clone)
        if (dirEnd) {
            el.parentNode!.insertBefore(clone, el.nextSibling);
        } else {
            el.parentNode!.insertBefore(clone, el);
        }
    })

    // VSCode-like Alt Reordering
    ruleEl.querySelector('.rule')!.addEventListener("keydown", (e) => checkMoveOrDup(e as KeyboardEvent));

    // Custom field-sizing	
    addResizeEvents(ruleEl.querySelector('.rule')!)
    addResizeEvents(ruleEl.querySelector('.description')!)
}


export function getRuleActiveBoxes(): boolean[] {
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


export function getRuleClosedBoxes(): boolean[] {
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

export function makeRule(name: string, rule: string, desc: string, ruleClosed: boolean, ruleActive: boolean) {
    let demo = document.getElementById("demo")!;
    demo.insertAdjacentHTML("beforeend", blockTemplate);
    let ruleElement = demo.lastChild! as HTMLElement;

    (ruleElement.querySelector(".name")! as HTMLInputElement).value = name;

    let r = ruleElement.querySelector(".rule")! as HTMLTextAreaElement;
    r.value = rule;
    resize(r);
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

    if (dirEnd) {
        ruleElement.querySelector(".clone i")!.classList.add('fa-rotate-90')
    }

    createRuleEvents(ruleElement);
};

