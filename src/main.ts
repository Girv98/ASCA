import Sortable from 'sortablejs';

import { /*historyTemplate,*/ outlexTemplate } from "./templates";
import init, { run_wasm, WasmResult } from '../libasca/asca.js'
import { Rules as RulesClass }  from './rules.js';
import { type Rule } from './rules.js';
import { checkMoveOrDup, ruleHandleKeyboardDown, ruleHandleKeyboardUp } from './hotkeys.js';

let Rules = new RulesClass();


export function createRuleEvents(ruleEl: HTMLElement) {

    ruleEl.addEventListener('keydown', e => ruleHandleKeyboardDown(Rules, e));
    ruleEl.addEventListener('keyup', e => ruleHandleKeyboardUp(Rules, e));

    // x button
    ruleEl.querySelector('.delete')!.addEventListener('click', function(this: HTMLElement) {
        Rules.removeRule(this.closest(".draggable-element")!);
    })
    // +/- button
    ruleEl.querySelector('.maxmin')!.addEventListener('click', function(this: HTMLElement) {
        let i = this.querySelector('i')!;
        if (i.classList.contains('fa-minus')) {
            i.classList.replace('fa-minus', 'fa-plus');
            if (!RulesClass.getRuleClosedBoxes().some((e) => e == false)) {
                Rules.updateCollapse(false)
            }
        } else {
            i.classList.replace('fa-plus', 'fa-minus');
            Rules.updateCollapse(true)
        }
        this.closest(".draggable-element")!.querySelector(".cont")!.classList.toggle('invisible')
    })
    // On/Off Button
    ruleEl.querySelector('.onoff')!.addEventListener('click', function(this: HTMLElement) {
    
        let i = this.querySelector('i')!;

        if (i.classList.contains('fa-toggle-off')) {
            i.classList.replace('fa-toggle-off', 'fa-toggle-on');
            Rules.updateActive(!RulesClass.getRuleActiveBoxes().some((e) => e == false));
        } else {
            i.classList.replace('fa-toggle-on', 'fa-toggle-off');
            Rules.updateActive(false);
        }
        this.closest(".draggable-element")!.classList.toggle('ignore')
    })
    // Copy Button
    ruleEl.querySelector('.clone')!.addEventListener('click', function(this: HTMLElement) {
		Rules.cloneRule(this.closest(".draggable-element")!)
    })

    // VSCode-like Alt Reordering
    // ruleEl.querySelector('.rule')!.addEventListener("keydown", (e) => checkMoveOrDup(e as KeyboardEvent));

    // Custom field-sizing	
    // addResizeEvents(ruleEl.querySelector('.rule')!)
    addResizeEvents(ruleEl.querySelector('.description')!)
}


function getAliases() {
	return [((document.getElementById("alias-into") as HTMLTextAreaElement).value), ((document.getElementById("alias-from") as HTMLTextAreaElement).value)]
}

function globalHandleKeyUp(e: KeyboardEvent) {
	if (e.altKey) {
		switch (e.key) {
			// Move to rules
			case 'r': 
				e.preventDefault();
				(document.getElementById("demo")!.firstElementChild as HTMLDivElement).focus();
				return;
			// Move to input
			case 'w':
				e.preventDefault();
				document.getElementById("lexicon")?.focus();
				return;
			// Add rule
			case 'a': e.preventDefault(); Rules.addRule(); return;
			case 'q': e.preventDefault(); Rules.toggleDirection(); return;
			// Collapse
			case 'c': e.preventDefault(); Rules.collapseRules(); return;
			// Clear
			case 'x': e.preventDefault(); Rules.clearRules(); return;
			// Toggle
			case 'z': e.preventDefault(); Rules.activateRules(); return;
			case 'l': e.preventDefault(); showAliasModal(); return; 
			case 's': e.preventDefault(); saveFile(); return; 
			// case 'o': e.preventDefault(); loadFile(); return; 
			default: return;
		}
	}
	if (e.shiftKey && e.key === 'Enter') {
		e.preventDefault();
		runASCA();
	}
}

function globalHandleKeyDown(e: KeyboardEvent) {
	if (e.shiftKey && e.key === 'Enter') {
		e.preventDefault();
	}
}

// --------------------------------------------------

function onReaderLoad(event: any) {
	console.log("Parsing file...")
	var obj = JSON.parse(event.target.result);

	if (!obj.words && !obj.rules) {
		alert("Not able to parse json")
		return
	} 

	Rules.clearForLoad();

	for (let i = 0; i < obj.rules.length; i++) {
		Rules.makeRule(obj.rules[i].name, obj.rules[i].rule.join('\n'), obj.rules[i].description, false, true);
	}
	if (obj.rules.length) {
		Rules.updateCollapse(true);
		Rules.updateActive(true);
		(document.getElementById("clear-all") as HTMLButtonElement).disabled = false;
	} else {
		Rules.updateCollapse(null);
		Rules.updateActive(null);
		(document.getElementById("clear-all") as HTMLButtonElement).disabled = true;
	}

	if (obj.words) {
		let lex = document.getElementById('lexicon') as HTMLTextAreaElement;
		lex.value = obj.words.join('\n');
		resize(lex);
	}

	let to = document.getElementById("alias-into") as HTMLTextAreaElement;
	if (obj.into) { to.value = obj.into.join('\n'); } else { to.value = "" }
	resize(to);

	let fr = document.getElementById("alias-from") as HTMLTextAreaElement;
	if (obj.from) { fr.value = obj.from.join('\n'); } else { fr.value = "" }
	resize(fr);

	updateTrace();

	console.log("File parsed")
};

function loadFile(event: any) {
	// console.log(event)
	var reader = new FileReader();
	reader.onload = onReaderLoad;
	reader.readAsText(event.target.files[0]);
	(document.getElementById("load") as HTMLInputElement).value = '';
};

// TODO: see https://www.reddit.com/r/conlangs/comments/1h2ryxf/comment/m10lko8/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
// Saving to JSON
function saveFile() {
	let wordList = (document.getElementById("lexicon") as HTMLTextAreaElement).value;
	let rules = Rules.getRules();
	let into = (document.getElementById("alias-into") as HTMLTextAreaElement).value;
	let from = (document.getElementById("alias-from") as HTMLTextAreaElement).value;

	let obj = {
		words: wordList.split('\n'),
		rules, 
		into: into.split('\n'), 
		from: from.split('\n')
	}
	let objJSON = JSON.stringify(obj);

	let a = document.createElement('a');
	a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(objJSON);
	a.download = 'sound_changes.json';
	a.click();
	a.remove();
}

function getTraceState(): string {
    return (document.getElementById("trace") as HTMLSelectElement).value
}

function updateTrace() {
    // console.log(e)
    let traceBox = document.getElementById("trace") as HTMLSelectElement;
    let lex = document.getElementById("lexicon") as HTMLTextAreaElement;
    let lexList = lex.value.split('\n');
    // let traceText = [...traceBox.options].map(o => o.text);
    // let traceVals = [...traceBox.options].map(o => o.value);
    
    // let lexLines = lex.value.substr(0, lex.selectionStart).split("\n");
    // let lexLineNum = lexLines.length;
    // let lexColNum = lexLines[lexLines.length-1].length+1;

    // let eLines = lex.value.substr(0, e.target.selectionStart).split("\n");
    // let eLineNum = eLines.length;
    // let eColNum = eLines[eLines.length-1].length+1;
    
    traceBox.length = 1;
    lexList.map((w, i) => {
        if (w.trim() !== "") {
            let opt = document.createElement("option");
            opt.value = `${i}`;
            opt.innerHTML = w;
            traceBox.append(opt);
        }
    })

    traceBox.value = "-1"


    // if (e.key === 'Enter') {
    // 	traceBox.length = 1;
    // 	lexList.map((w, i) => {
    // 		if (w !== "") {
    // 			let opt = document.createElement("option");
    // 			opt.value = i;
    // 			opt.innerHTML = w;
    // 			traceBox.append(opt);
    // 		}
    // 	})
    // } else if (e.key === 'Backspace') {
    // 	console.log(`lex {${lexLineNum},${lexColNum}}`)
    // } else if (e.key === 'Delete') { 
    // 	console.log(`lex {${lexLineNum},${lexColNum}}`)
    // } else if (lexList[lexLineNum-1].trim() !== "") {
    // 	if (traceText.length <= 1) {
    // 		let opt = document.createElement("option");
    // 		opt.value = lexLineNum;
    // 		opt.innerHTML = lexList[lexLineNum-1];
    // 		traceBox.append(opt);
    // 	} else {
    // 		traceBox.querySelector(`option[value='${lexLineNum}']`).text = lexList[lexLineNum-1]
    // 	}
    // }

}

// function updateHistory(rulesString: string) {
    // let histTime = new Date();

    // let storedHistory: string[] = JSON.parse(localStorage.getItem("ruleHistory") || '[]');
    // let storedTimes: string[] = JSON.parse(localStorage.getItem("ruleHistTimes") || '[]');

    // let history = (storedHistory) ? storedHistory : [];
    // let times = (storedTimes) ? storedTimes : [];

    // if (history.length && history[history.length - 1] === rulesString) { return }
    // if (history.length >= 5) { history.shift(); storedTimes.shift() }
    // history.push(rulesString);
    // times.push(histTime.toISOString());
    // localStorage.setItem("ruleHistory", JSON.stringify(history));
    // localStorage.setItem("ruleHistTimes", JSON.stringify(times));
// }

function updateLocalStorage(
    rawWordList: string, 
    ruleList: Rule[], 
    ruleClosed: boolean[], 
    ruleActive: boolean[], 
    aliasInto: string, 
    aliasFrom: string, 
    traceState: string 
) {
    console.log("Saving to local storage")
    let rulesString = JSON.stringify(ruleList);
    localStorage.setItem("words", rawWordList);	
    localStorage.setItem("rules", rulesString);
    localStorage.setItem("closedRules", JSON.stringify(ruleClosed));
    localStorage.setItem("activeRules", JSON.stringify(ruleActive));
    localStorage.setItem("aliasInto", aliasInto);
    localStorage.setItem("aliasFrom", aliasFrom);
    localStorage.setItem("trace", traceState);

    // updateHistory(rulesString);
}

// Run ASCA
function runASCA() {
	RulesClass.removeTrace();

	// Rules.printEditors();

    let rawWordList = (document.getElementById("lexicon") as HTMLTextAreaElement).value;
    let ruleList = Rules.getRules();
    let ruleClosed = RulesClass.getRuleClosedBoxes();
    let ruleActive = RulesClass.getRuleActiveBoxes();
    let traceState = getTraceState();
    let [aliasInto, aliasFrom] = getAliases();

    updateLocalStorage(rawWordList, ruleList, ruleClosed, ruleActive, aliasInto, aliasFrom, traceState);
    
    let wordList = rawWordList.split('\n')

    // filter inactive rules
    ruleList = ruleList.filter((val, index) => { if (ruleActive[index]) { return val } });

    let traceNumber = (+traceState >= 0) ? +traceState : null;
    console.log("Running ASCA...");
    let res = run_wasm(ruleList, wordList, aliasInto.split('\n'), aliasFrom.split('\n'), traceNumber);
    console.log("Done");

    // handle result
    
    let outputJoined = createOutput(res);
    
    document.getElementById("outlex")!.querySelector(".scroller")!.innerHTML = outlexTemplate;
    let outputArea = document.getElementById('output')!;
    outputArea.innerHTML = outputJoined;
    resize(outputArea);

	// handle traces

	let trace_indices = res.get_traces();

	RulesClass.traceRules(trace_indices);
}

function escapeHTML(str: string): string {
	return str.replace(
    /[&<>'"]/g,
    tag =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
  )
}

function createOutput(res: WasmResult) {
	let outputJoined = "";
	let output = res.get_output();
	let unknowns = res.get_unknowns();
	// If no unknowns
	if (!unknowns.length) {
		output.forEach((val) => {
			val = escapeHTML(val);
			if (val) {
				if (val.startsWith('Applied &quot;')) {
					val = val.replace('Applied &quot;', '<span style="color: var(--green);">&quot;');
					val = val.replace(new RegExp(':$'), '</span>:');
				} else {
					val = val.replace("=&gt;", '<span style="color: var(--blue);">=&gt;</span>');
				}
				outputJoined += `<div class="out-line"><span>${val}</span></div>`
			} else {
				outputJoined += '<div class="out-line"><span><br></span></div>'
			}
		});
		return outputJoined;
	}
	// else handle unknowns
	let unknownsMap: Map<string, number[]> = new Map;
	unknowns.forEach((val, i) => {
        if (!unknownsMap.has(val)) unknownsMap.set(val, []);
		unknownsMap.get(val)!.push(i);
	})

	let unknownsUnique = [... new Set(unknowns)];
	let lenUnique = Object.keys(unknownsUnique).length;
	let colours = ["var(--green)", "var(--blue)", "var(--orange)", "var(--purple)", "var(--red)", "var(--yellow)"]

	let occurence = -1;
	output.forEach((val) => {
		val = escapeHTML(val);
		outputJoined += '<div class="out-line"><span>'
		if (val.startsWith('Applied &quot;')) {
			val = val.replace('Applied &quot;', '<span style="color: var(--green);">&quot;');
			val = val.replace(new RegExp(':$'), '</span>:');
		} else {
			val = val.replace("=&gt;", '<span style="color: var(--blue);">=&gt;</span>');
		}
		let parts = val.split('�')
		if (parts.length == 1) {
			outputJoined += (val == "") ? "<br>" : val;
		} else {
			for (let p = 0; p < parts.length - 1; p++) {
				occurence += 1;
				outputJoined += parts[p];
				let ind = unknownsUnique.indexOf(unknowns[occurence]);
				let color = (ind < lenUnique) ? colours[ind] : "var(--fg)";
				outputJoined += `<span style="color: ${color};" title="${unknowns[occurence]}">�</span>`
			}
			outputJoined += parts[parts.length - 1];
		}
		outputJoined += "</span></div>";
	});

	let string = unknownsUnique.map((val, ind) => {
		let color = (ind < lenUnique) ? colours[ind] : "var(--fg)";
		let number = unknownsMap.get(val)!.length;
		let counts = (number == 1) ? "count" : "counts";
		val = escapeHTML(val);
		return `<div class="out-line"><span>${val} <span style="color: ${color};" title="${val}">�</span> ${number} ${counts}</span></div>`
	}).join('');

	outputJoined += '<div class="out-line"><span><br></span></div>';
	let header = '<div class="out-line"><span><strong>rut| manner |lar|lb|cr|dorsal|pr</strong></span></div>';
	outputJoined += `<div class="out-line"><span><b>${lenUnique} unique unknowns found:</b></span></div>${header}${string}`

	return outputJoined;
}

function onLoad() {
    addResizeEvents(document.getElementById("lexicon")!)
    addResizeEvents(document.getElementById("alias-into")!)
    addResizeEvents(document.getElementById("alias-from")!)

    console.log("Parsing local storage...")

    let words = localStorage.getItem("words") || '';
	let rules = JSON.parse(localStorage.getItem("rules") || '[]')  ;
	let ruleStates: boolean[] = JSON.parse(localStorage.getItem("closedRules") || '[]');
	let ruleActive: boolean[] = JSON.parse(localStorage.getItem("activeRules") || '[]');
	let traceState: number = JSON.parse(localStorage.getItem("trace") || '-1');
	let aliasInto = localStorage.getItem("aliasInto") || '';
	let aliasFrom = localStorage.getItem("aliasFrom") || '';

    console.log("Local storage parsed")

    if (ruleStates && rules) {
		if (ruleStates.length) {
			Rules.updateCollapse(ruleStates.some((e) => e == false))
		} else {
			Rules.updateCollapse(null)
		}
	} else if (rules.length > 0) { Rules.updateCollapse(true) } else { Rules.updateCollapse(null) }
	
	if (ruleActive) {
		if (ruleActive.length) {
			Rules.updateActive(!ruleActive.some((e) => e == false));
		} else {
			Rules.updateActive(null)
		}
	} else if (rules.length > 0) { Rules.updateActive(true) } else { Rules.updateActive(null) }

	if (rules.length === 0) {
		(document.getElementById("clear-all") as HTMLButtonElement).disabled = true;
	}

    // Populate textareas from local stortage
	let lex = document.getElementById("lexicon")! as HTMLTextAreaElement;
	if (words) { lex.value = words } else { lex.value = '' }
	resize(lex);

	let to = document.getElementById("alias-into")! as HTMLTextAreaElement;
	if (aliasInto) {to.value = aliasInto} else { to.value = '' }
	resize(to);

	let fr = document.getElementById("alias-from")! as HTMLTextAreaElement;
	if (aliasFrom) {fr.value = aliasFrom} else { fr.value = '' }
	resize(fr);

    document.querySelectorAll('.draggable-element').forEach(e => e.remove());

	if (rules) {
		for (let i = 0; i < rules.length; i++) {
			// Otherwise, this would be a breaking change
			let rs = ruleStates ? ruleStates[i] : true;
			let ra = ruleActive ? ruleActive[i] : true;
			Rules.makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, rs, ra);
		}
	}

	if (words) {
		let wordList = words.split('\n');
		let selectTag = document.getElementById("trace")! as HTMLSelectElement;

		wordList.map((w, i) => {
			if (w !== "") {
				let opt = document.createElement("option");
				opt.value = `${i}`;
				opt.innerHTML = w;
				selectTag.append(opt);

				if ((traceState || traceState === 0) && traceState === i) {
					selectTag.value = `${traceState}`;
				}
			}
		})		
	}
}

// Drag and drop
Sortable.create(document.getElementById('demo')!, {
	handle: ".title",
	filter: "button, input",
	preventOnFilter: false,
	direction: 'horizontal',
	// swapThreshold: 0.13,
    // invertSwap: true,
	animation: 30,
	easing: "cubic-bezier(1, 0, 0, 1)",
	ghostClass: "sortable-ghost",
	dragClass: "sortable-drag",
	forceFallback: true,
	onEnd(evt) {
		Rules.move(evt.oldIndex!, evt.newIndex!);
	},
});


// Button click events
document.getElementById("input-minimax")!.addEventListener("click", function(this: HTMLElement) {
	let i = this.querySelector("i")!;

	if (i.classList.contains('fa-minus')) {
		i.classList.replace('fa-minus', 'fa-plus');
	} else {
		i.classList.replace('fa-plus', 'fa-minus');
	}
	document.getElementById("lex-wrap")!.classList.toggle('invisible')
});

document.getElementById("rule-minimax")!.addEventListener("click", function(this: HTMLElement) {
	let i = this.querySelector("i")!;

	if (i.classList.contains('fa-minus')) {
		i.classList.replace('fa-minus', 'fa-plus');
	} else {
		i.classList.replace('fa-plus', 'fa-minus');
	}
	document.getElementById("demo")!.classList.toggle('invisible');
	document.getElementById("rule-thing")!.classList.toggle('invisible');
})

document.getElementById("add")!.addEventListener("click", _ => Rules.addRule());
document.getElementById("updown")!.addEventListener("click", _ => Rules.toggleDirection());
document.getElementById("save")!.addEventListener("click", saveFile);
document.getElementById("load-label")!.addEventListener("keyup", e => {
	const load = document.getElementById("load");
	if (e.key === "Enter" && load) {
		load.click();
	}
});
document.getElementById("load")!.addEventListener("change", e => loadFile(e));
document.getElementById("run")!.addEventListener("click", _ => runASCA());
document.getElementById("collapse")!.addEventListener("click", _ => Rules.collapseRules());
document.getElementById("activate")!.addEventListener("click", _ => Rules.activateRules());
document.getElementById("clear-all")!.addEventListener("click", _ => Rules.clearRules());

document.getElementById("version-modal-close")!.addEventListener("click", () => (document.getElementById('version-modal')! as HTMLDialogElement).close());
document.getElementById("version-modal-open")!.addEventListener("click", () => (document.getElementById('version-modal')! as HTMLDialogElement).showModal())

document.getElementById("alias-modal-close")!.addEventListener("click", () => (document.getElementById('alias-modal')! as HTMLDialogElement).close());
document.getElementById("alias-modal-open")!.addEventListener("click", () => showAliasModal())

function showAliasModal() {
	(document.getElementById('alias-modal')! as HTMLDialogElement).showModal();
	// This has to go here for some reason... I assume closed modals don't calculate style changes
	resize(document.getElementById("alias-into")!);
	resize(document.getElementById("alias-from")!);
}

// document.getElementById("history-modal-close")!.addEventListener("click", () => (document.getElementById('history-modal')! as HTMLDialogElement).close());
// document.getElementById("history-modal-open")!.addEventListener("click", () => {
// 	let modal = (document.getElementById('history-modal')! as HTMLDialogElement);

// 	populateHistory(modal);

// 	modal.showModal();

// })

// function getTimeDiff(now: Date, then: Date) {
//     let diffSecs = now.getSeconds() - then.getSeconds();
//     let diffDays = now.getDate() - then.getDate();
//     let diffMonths = now.getMonth() - then.getMonth();
//     let diffYears = now.getFullYear() - then.getFullYear();

//     if (diffSecs < 60) {
//         return `${diffSecs} sec ago`
//     }

//     if(diffYears === 0 && diffDays === 0 && diffMonths === 0) {
//         return then.toLocaleTimeString([], {timeStyle: 'short'})
//     } else if (diffYears === 0 && diffDays === 1 && diffMonths === 0) {
//         return `Yesterday at ${then.toLocaleTimeString([], {timeStyle: 'short'})}`
//     } else {
//         return then.toLocaleDateString([], {dateStyle: 'short', timeStyle: 'short'})
//     }
// }

// function populateHistory(modal: HTMLDialogElement) {
//     let content = modal.querySelector(".modal-content")!;
//     content.querySelectorAll(".history-item").forEach(e => e.remove());
    
//     let storedHistory: string[] = JSON.parse(localStorage.getItem("ruleHistory") || '[]');
//     let storedTimes: string[] = JSON.parse(localStorage.getItem("ruleHistTimes") || '[]');
    
//     let now = new Date();
//     storedHistory.findLast((_val: any, ind: number) => {
//         content.insertAdjacentHTML("beforeend", historyTemplate);
//         let el = content.lastElementChild!;
//         // el.querySelector(".history-title").innerText = "Hi"
//         let time = el.querySelector(".history-time time")! as HTMLTimeElement;
//         let then = new Date(storedTimes[ind]);
//         time.innerText = getTimeDiff(now, then);
//         time.setAttribute("datetime", then.toISOString());

//         (el.querySelector(".history-text")! as HTMLDivElement).innerText = "Test";

//         // add events
//     });
// }

document.querySelectorAll('dialog').forEach(item => {
    item.addEventListener('mousedown', event => {
        if (event.target === event.currentTarget) {
            (event.currentTarget as HTMLDialogElement).close()
        }
    })
});

document.getElementById("lexicon")!.addEventListener("keyup", () => updateTrace());

document.addEventListener("keyup", (e) => globalHandleKeyUp(e));
document.addEventListener("keydown", (e) => globalHandleKeyDown(e));

// VSCode-like Alt Reordering
document.getElementById("lexicon")!.addEventListener("keydown", (e) => checkMoveOrDup(e));
document.getElementById("alias-into")!.addEventListener("keydown", (e) => checkMoveOrDup(e));
document.getElementById("alias-from")!.addEventListener("keydown", (e) => checkMoveOrDup(e));


// ------------ Resizing ------------
// Mimicking field-sizing behaviour where if the user manually resizes a box, it no longer auto-resizes


let resizeObserver = new ResizeObserver(e => {
	if (mouseIsDown) { e[0].target.classList.add("user-resized"); }
});

// Lets us check if the resize was done by using the resize dragger
let mouseIsDown = false;

export function addResizeEvents(el: /*HTMLElement |*/ HTMLElement) {
	el.addEventListener("input", e => userResize(e.target as HTMLElement));
	el.addEventListener("mousedown", function() { mouseIsDown = true });
	el.addEventListener("mouseup",   function() { mouseIsDown = false });

	resizeObserver.observe(el)
}

export function userResize(el: /*HTMLElement |*/ HTMLElement) {
	if (!el.classList.contains("user-resized")) {
		el.style.height = "1px"; el.style.height = (el.scrollHeight+16)+"px";
	}
}

export function resize(el: HTMLElement) {
	if (!el.classList.contains("user-resized")) {
		el.style.height = "1px"; el.style.height = (el.scrollHeight+16)+"px";
	}
}


await init()
onLoad()