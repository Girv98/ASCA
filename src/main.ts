// import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import Sortable from 'sortablejs';

import { /*historyTemplate,*/ outlexTemplate } from "./templates";
import init, { run_wasm, WasmResult } from '../libasca/asca.js'
import { activateRules, addRule, changeDirection, clearRules, collapseRules, getRuleActiveBoxes, getRuleClosedBoxes, getRules, makeRule, updateActive, updateCollapse, type Rule } from './rules.js';
import { checkMoveOrDup } from './hotkeys.js';


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
			case 'a': e.preventDefault(); addRule(); return;
			case 'q': e.preventDefault(); changeDirection(); return;
			// Collapse
			case 'c': e.preventDefault(); collapseRules(); return;
			// Clear
			case 'x': e.preventDefault(); clearRules(); return;
			// Toggle
			case 'z': e.preventDefault(); activateRules(); return;
			default: return;
		}
	}
	if (e.shiftKey) {
		if (e.key === 'Enter') {
			e.preventDefault();
			runASCA();
		}
	}
}

function globalHandleKeyDown(e: KeyboardEvent) {
	if (e.shiftKey) {
		if (e.key === 'Enter') {
			e.preventDefault();
		}
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

	document.querySelectorAll('.draggable-element').forEach(e => e.remove());
	for (let i = 0; i < obj.rules.length; i++) {
		makeRule(obj.rules[i].name, obj.rules[i].rule.join('\n'), obj.rules[i].description, false, true);
	}
	if (obj.rules.length) {
		updateCollapse(true)
		updateActive(true)
	} else {
		updateCollapse(null)
		updateActive(null)
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
	var reader = new FileReader();
	reader.onload = onReaderLoad;
	reader.readAsText(event.target.files[0]);
	(document.getElementById("load") as HTMLInputElement).value = '';
};

// TODO: see https://www.reddit.com/r/conlangs/comments/1h2ryxf/comment/m10lko8/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
// Saving to JSON
function saveFile() {
	let wordList = (document.getElementById("lexicon") as HTMLTextAreaElement).value;
	let rules = getRules();
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
    let rawWordList = (document.getElementById("lexicon") as HTMLTextAreaElement).value;
    let ruleList = getRules();
    let ruleClosed = getRuleClosedBoxes();
    let ruleActive = getRuleActiveBoxes();
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
}

function createOutput(res: WasmResult) {
	let outputJoined = "";
	let output = res.get_output();
	let unknowns = res.get_unknowns();
	// If no unknowns
	if (!unknowns.length) {
		output.forEach((val) => {
			if (val) {
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
		outputJoined += '<div class="out-line"><span>'
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
			updateCollapse(ruleStates.some((e) => e == false))
		} else {
			updateCollapse(null)
		}
	} else if (rules) { updateCollapse(true) } else { updateCollapse(null) }
	
	if (ruleActive) {
		if (ruleActive.length) {
			updateActive(!ruleActive.some((e) => e == false));
		} else {
			updateActive(null)
		}
	} else if (rules) { updateActive(true) } else { updateActive(null) }

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
			makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, rs, ra);
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
});


// Button click events

document.getElementById("add")!.addEventListener("click", addRule);
document.getElementById("updown")!.addEventListener("click", changeDirection);
document.getElementById("save")!.addEventListener("click", saveFile);
document.getElementById("load-label")!.addEventListener("keyup", e => {
	const load = document.getElementById("load");
	if (e.key === "Enter" && load) {
		load.click();
	}
});
document.getElementById("load")!.addEventListener("change", e => loadFile(e));
document.getElementById("run")!.addEventListener("click", runASCA);
document.getElementById("collapse")!.addEventListener("click", collapseRules);
document.getElementById("activate")!.addEventListener("click", activateRules);
document.getElementById("clear-all")!.addEventListener("click", clearRules);

document.getElementById("version-modal-close")!.addEventListener("click", () => (document.getElementById('version-modal')! as HTMLDialogElement).close());
document.getElementById("version-modal-open")!.addEventListener("click", () => (document.getElementById('version-modal')! as HTMLDialogElement).showModal())

document.getElementById("alias-modal-close")!.addEventListener("click", () => (document.getElementById('alias-modal')! as HTMLDialogElement).close());
document.getElementById("alias-modal-open")!.addEventListener("click", () => {
	(document.getElementById('alias-modal')! as HTMLDialogElement).showModal();
	// This has to go here for some reason... I assume closed modals don't calculate style changes
	resize(document.getElementById("alias-into")!);
	resize(document.getElementById("alias-from")!);
})

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