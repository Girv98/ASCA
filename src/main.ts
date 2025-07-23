import Sortable from 'sortablejs';

import { outlexTemplate } from "./templates";
import init, { run_wasm, WasmResult } from '../libasca/asca.js'
import { Rules as RulesClass }  from './rules.js';
import { type Rule } from './rules.js';
import { checkMoveOrDup, ruleHandleKeyboardDown, ruleHandleKeyboardUp } from './hotkeys.js';
import { Lines } from './history.js';

let RULES_VIEW = new RulesClass();
let LINES = new Lines(RULES_VIEW);

let DEMO = document.getElementById("demo") as HTMLDivElement;
let ALIAS_INTO = document.getElementById("alias-into") as HTMLTextAreaElement;
let ALIAS_FROM = document.getElementById("alias-from") as HTMLTextAreaElement;
let ALIAS_OPEN = document.getElementById("alias-modal-open") as HTMLButtonElement;
let ALIAS_TOGGLE= document.getElementById('alias-from-toggle') as HTMLButtonElement;
let LEXICON = document.getElementById("lexicon") as HTMLTextAreaElement;
let TRACE = document.getElementById("trace") as HTMLSelectElement;
let FORMAT = document.getElementById("format") as HTMLSelectElement;
let OUTLEX = document.getElementById("outlex") as HTMLDivElement;

export function createHistoryEvents(el: Element) {
	let loadButton = el.querySelector<HTMLButtonElement>(".history-item-load")!;
	let exportButton = el.querySelector<HTMLButtonElement>(".history-item-save")!;
	let deleteButton = el.querySelector<HTMLButtonElement>(".history-item-delete")!;

	let idField = el.querySelector<HTMLSpanElement>(".history-id")!;

	let originalVal = idField.innerText;

	idField.addEventListener('focusout', function() {
		LINES.histRename(idField.innerText, originalVal);
	});

	idField.addEventListener('keydown', function(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			(e.target as HTMLElement).blur();
		}
	});

	loadButton.addEventListener("click", function() {
		let item = this.closest(".history-item") as HTMLElement;
		if (LINES.histLoad(item.querySelector<HTMLSpanElement>(".history-id")!.innerText)) {
			document.querySelectorAll(".history-item").forEach((i) => i.classList.remove('active'));
			item.classList.add("active");
		}
	});

	exportButton.addEventListener("click", function() {
		LINES.histExport(this.closest(".history-item")!.querySelector<HTMLSpanElement>(".history-id")!.innerText)
	});

	deleteButton.addEventListener("click", function(this: HTMLButtonElement) {
		let item = this.closest(".history-item") as HTMLElement;
		LINES.histDelete(item.querySelector<HTMLSpanElement>(".history-id")!.innerText);
	})
}


export function createRuleEvents(ruleEl: HTMLElement) {

    ruleEl.addEventListener('keydown', e => ruleHandleKeyboardDown(RULES_VIEW, e));
    ruleEl.addEventListener('keyup', e => ruleHandleKeyboardUp(RULES_VIEW, e));

    // x button
    ruleEl.querySelector('.delete')!.addEventListener('click', function(this: HTMLElement) {
        RULES_VIEW.removeRule(this.closest(".draggable-element")!);
    })
    // +/- button
    ruleEl.querySelector('.maxmin')!.addEventListener('click', function(this: HTMLElement) {
        let i = this.querySelector('i')!;
        if (i.classList.contains('fa-minus')) {
            i.classList.replace('fa-minus', 'fa-plus');
            if (!RulesClass.getRuleClosedBoxes().some((e) => e == false)) {
                RULES_VIEW.updateCollapse(false)
            }
        } else {
            i.classList.replace('fa-plus', 'fa-minus');
            RULES_VIEW.updateCollapse(true)
        }
        this.closest(".draggable-element")!.querySelector(".cont")!.classList.toggle('invisible')
    })
    // On/Off Button
    ruleEl.querySelector('.onoff')!.addEventListener('click', function(this: HTMLElement) {
    
        let i = this.querySelector('i')!;

        if (i.classList.contains('fa-toggle-off')) {
            i.classList.replace('fa-toggle-off', 'fa-toggle-on');
            RULES_VIEW.updateActive(!RulesClass.getRuleActiveBoxes().some((e) => e == false));
        } else {
            i.classList.replace('fa-toggle-on', 'fa-toggle-off');
            RULES_VIEW.updateActive(false);
        }
        this.closest(".draggable-element")!.classList.toggle('ignore')
    })
    // Copy Button
    ruleEl.querySelector('.clone')!.addEventListener('click', function(this: HTMLElement) {
		RULES_VIEW.cloneRule(this.closest(".draggable-element")!)
    })

    // VSCode-like Alt Reordering
    // ruleEl.querySelector('.rule')!.addEventListener("keydown", (e) => checkMoveOrDup(e as KeyboardEvent));

    // Custom field-sizing	
    // addResizeEvents(ruleEl.querySelector('.rule')!)
    addResizeEvents(ruleEl.querySelector('.description')!)
}

function getAliases() {
	if (ALIAS_FROM.classList.contains('ignore')) {
		return [ALIAS_INTO.value, ""]
	} else {
		return [ALIAS_INTO.value, ALIAS_FROM.value]
	}
}

function globalHandleKeyUp(e: KeyboardEvent) {
	if (e.altKey) {
		switch (e.key) {
			// Move to rules
			case 'r': 
				e.preventDefault();
				(DEMO.firstElementChild as HTMLDivElement).focus();
				return;
			// Move to input
			case 'w':
				e.preventDefault();
				LEXICON.focus();
				return;
			// Add rule
			case 'a': e.preventDefault(); RULES_VIEW.addRule(); return;
			case 'q': e.preventDefault(); RULES_VIEW.toggleDirection(); return;
			// Collapse
			case 'c': e.preventDefault(); RULES_VIEW.collapseRules(); return;
			// Clear
			case 'x': e.preventDefault(); RULES_VIEW.clearRules(); return;
			// Toggle
			case 'z': e.preventDefault(); RULES_VIEW.activateRules(); return;
			case 'l': e.preventDefault(); showAliasModal(); return; 
			case 's': e.preventDefault(); LINES.exportActive(); return; 
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

function importLine(event: any) {
	var reader = new FileReader();
	reader.onload = function (env: any) {
		let id = event.target.files[0].name.replace(/.json/, "");

		if (LINES.contains(id)) {
			if (!confirm(`An ID by the name "${id}" already exists, do you wish to overwrite it?`)) {
				return;
			}
		}

		console.log("Parsing file...")
		var obj = JSON.parse(env.target.result);

		if (!obj.words && !obj.rules) {
			alert("Not able to parse json.")
			return
		}

		console.log("File parsed.")

		LINES.create(obj.words, obj.rules, obj.from, obj.into, id);
		LINES.partialSetStorage(id);
        LINES.updateModal();

		if (LINES.getActiveId() == id) { LINES.loadId(id); }
	};
	reader.readAsText(event.target.files[0]);
	// LOAD.value = '';
}

function loadExample() {

	let id = 'pie-to-proto-germanic';

	if (LINES.contains(id)) {
		if (!confirm(`An ID by the name "${id}" already exists, do you wish to overwrite it?`)) {
			return;
		}
	}
	
	fetch(`/examples/${id}.json`)
		.then(response => response.json())
		.then(response => {
			console.log(`Loading ${id} example`);
			LINES.create(response.words, response.rules, response.from, response.into, id, new Array<boolean>(response.rules.length).fill(true));
			LINES.partialSetStorage(id);
			LINES.updateModal();

			if (LINES.getActiveId() == id) { LINES.loadId(id); }
		})
}

// TODO: see https://www.reddit.com/r/conlangs/comments/1h2ryxf/comment/m10lko8/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

export type OutputFormat = "out" | ">" | "+>" | "=>" | "+=>" | "->" | "+->";

function getFormatState(): OutputFormat {
    return FORMAT.value as OutputFormat
}

function getTraceState(): string {
    return TRACE.value
}

export function updateTrace() {
    // console.log(e)
    let traceBox = TRACE;
    // let traceText = [...traceBox.options].map(o => o.text);
    // let traceVals = [...traceBox.options].map(o => o.value);
    
    // let lexLines = lex.value.substr(0, lex.selectionStart).split("\n");
    // let lexLineNum = lexLines.length;
    // let lexColNum = lexLines[lexLines.length-1].length+1;

    // let eLines = lex.value.substr(0, e.target.selectionStart).split("\n");
    // let eLineNum = eLines.length;
    // let eColNum = eLines[eLines.length-1].length+1;
    
    traceBox.length = 1;
    LEXICON.value.split('\n').forEach((w, i) => {
		let x = w.trim()
        if (x !== "" && !x.startsWith("#")) {
            let opt = document.createElement("option");
            opt.value = `${i}`;
            opt.innerHTML = w;
            traceBox.append(opt);
        }
    })

    traceBox.value = "-1";
	FORMAT.disabled = TRACE.value !== "-1";


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

// Run ASCA
function runASCA() {
	RulesClass.removeTrace();

    let rawWordList = LEXICON.value;
    let ruleList = RULES_VIEW.getRules();
    // let ruleClosed = RulesClass.getRuleClosedBoxes();
    let ruleActive = RulesClass.getRuleActiveBoxes();
    let traceState = getTraceState();
    let [aliasInto, aliasFrom] = getAliases();
	let formatType = getFormatState();

    LINES.updateActiveStorage();

    let wordList = rawWordList.split('\n').map((line) => { return line.replace(/#.*/, "").trimEnd(); });

    // filter inactive rules
    ruleList = ruleList.filter((_val, index) => ruleActive[index]);

    let traceNumber = (+traceState >= 0) ? +traceState : null;
    console.log("Running ASCA...");
    let res = run_wasm(ruleList, wordList, aliasInto.split('\n'), aliasFrom.split('\n'), traceNumber);
    console.log("Done");

    // handle result
	
    let outputJoined = res.was_ok() 
	? (traceNumber === null ? createOutput(res, formatType) : createOutputTraced(res))
	: createError(res);
    
    OUTLEX.querySelector(".scroller")!.innerHTML = outlexTemplate;
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

function createError(res: WasmResult): string {
	let outputJoined = "";
	let lines = res.get_output()[0].split("\n").map((l) => escapeHTML(l));

	let [head, ...tail] = lines[0].split(":");
	head = `<span style="color: var(--red);">${head}:</span>`;
	let rest = tail.join(':');

	let line = `${head}${rest}`;
	outputJoined += `<div class="out-line"><span>${line}</span></div>`;


	var rg = new RegExp('\\^(\\^| )*');
	if (lines.length > 3) {
		let maybe_carets = rg.exec(lines[lines.length-2]);
		if (maybe_carets && maybe_carets.length) {
			let carets = maybe_carets[0];
			lines[lines.length-2] = lines[lines.length-2].replace(carets, `<span style="color: var(--red);">${carets}</span>`)
			lines[lines.length-1] = lines[lines.length-1].replace('@', '<span style="color: var(--blue);">@</span>');
		}
	} else {
		let maybe_carets = rg.exec(lines[lines.length-1]);
		if (maybe_carets && maybe_carets.length) {
			let carets = maybe_carets[0];
			lines[lines.length-1] = lines[lines.length-1].replace(carets, `<span style="color: var(--red);">${carets}</span>`)
		}
	}

	for(let i = 1; i < lines.length; i++) {
		let line = lines[i].replace('|', '<span style="color: var(--blue);">|</span>');
		outputJoined += `<div class="out-line"><span>${line}</span></div>`;
	}

	return outputJoined
}

function createOutputTraced(res: WasmResult) {
	let outputJoined = "";
	let output = res.get_output();
	let unknowns = res.get_unknowns();
	// If no unknowns
	if (!unknowns.length) {
		output.forEach((line) => {
			line = escapeHTML(line);
			if (line) {
				if (line.startsWith('Applied &quot;')) {
					line = line.replace('Applied &quot;', '<span style="color: var(--green);">&quot;');
					line = line.replace(new RegExp(':$'), '</span>:');
				} else {
					line = line.replace("=&gt;", '<span style="color: var(--blue);">=&gt;</span>');
				}
				outputJoined += `<div class="out-line"><span>${line}</span></div>`
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
	const colours = ["var(--green)", "var(--blue)", "var(--orange)", "var(--purple)", "var(--red)", "var(--yellow)"]

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
// →
function formatLine(val: string, formatType: OutputFormat, input: string, align: number): string {
	val = escapeHTML(val);
	if (val) {
		switch (formatType) {
			case "out": return `<div class="out-line"><span>${val}</span></div>`;
			case "=>":  return `<div class="out-line"><span>${input} <span style="color: var(--blue);">=&gt;</span> ${val}</span></div>`;
			case "->":  return `<div class="out-line"><span>${input} <span style="color: var(--blue);">-&gt;</span> ${val}</span></div>`;
			case ">":   return`<div class="out-line"><span>${input} <span style="color: var(--blue);">&gt;</span> ${val}</span></div>`;
			case "+=>": {
				let pad = " ".repeat(align-input.length+fixUnicodePadding(input));
				return`<div class="out-line"><span>${input} ${pad}<span style="color: var(--blue);">=&gt;</span> ${val}</span></div>`;
			}
			case "+->": {
				let pad = " ".repeat(align-input.length+fixUnicodePadding(input));
				return`<div class="out-line"><span>${input} ${pad}<span style="color: var(--blue);">-&gt;</span> ${val}</span></div>`;
			}
			case "+>": {
				let pad = " ".repeat(align-input.length+fixUnicodePadding(input));
				return`<div class="out-line"><span>${input} ${pad}<span style="color: var(--blue);">&gt;</span> ${val}</span></div>`;
			}
		}
	} else {
		return '<div class="out-line"><span><br></span></div>'
	}
}

// A copy of asca::util::fix_combining_char_pad()
function fixUnicodePadding(str: string): number {
	let pad = 0;
	[...str].forEach(ch => {
		let code = ch.charCodeAt(0);

		if (
			   (code >= 0x0300 && code <= 0x036F) // Combining Diacritical Marks 
			|| (code >= 0x1AB0 && code <= 0x1AFF) // Combining Diacritical Marks Extended
			|| (code >= 0x1DC0 && code <= 0x1DFF) // Combining Diacritical Marks Supplement
			|| (code >= 0x20D0 && code <= 0x20FF) // Combining Diacritical Marks for Symbols 
			|| (code >= 0x2DE0 && code <= 0x2DFF) // Cyrillic Extended-A
			|| (code >= 0xFE20 && code <= 0xFE2F) // Combining Half Marks
			||  code == 0x3099 // Dakuten
			||  code == 0x309A // Handakuten
		) {
			pad += 1;
		}
	});

	return pad;
}

function getAlignment(res: WasmResult) {
	let alignLength = 0;

	res.get_input().forEach((line) => {
		let len = line.length - fixUnicodePadding(line);
		if (len > alignLength) {
			alignLength = len;
		}
	})
	return alignLength;
}

function createOutput(res: WasmResult, formatType: OutputFormat) {
	let outputJoined = "";
	let input = res.get_input();
	let output = res.get_output();
	let unknowns = res.get_unknowns();

	let alignment = formatType.startsWith("+") ? getAlignment(res) : 0;

	// If no unknowns
	if (!unknowns.length) {
		output.forEach((val, ind) => {
			outputJoined += formatLine(val, formatType, input[ind], alignment)
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
	const colours = ["var(--green)", "var(--blue)", "var(--orange)", "var(--purple)", "var(--red)", "var(--yellow)"]

	let occurence = -1;
	output.forEach((line, ind) => {
		line = formatLine(line, formatType, input[ind], alignment);
		let parts = line.split('�')
		if (parts.length == 1) {
			outputJoined += line;
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

function updateTo14() {
    // if localstorage, move to new, then create lines

    if (localStorage.getItem("asca-data")) { return false }

    let words = localStorage.getItem("words") || '';
	let rules: Rule[] = JSON.parse(localStorage.getItem("rules") || '[]')  ;
	let ruleStates: boolean[] = JSON.parse(localStorage.getItem("closedRules") || '[]');
	let ruleActive: boolean[] = JSON.parse(localStorage.getItem("activeRules") || '[]');
	let traceState: number = JSON.parse(localStorage.getItem("trace") || '-1');
	let aliasInto = localStorage.getItem("aliasInto") || '';
	let aliasFrom = localStorage.getItem("aliasFrom") || '';

	let id = LINES.create(
		words.split('\n'),
		rules,
		aliasFrom.split('\n'),
		aliasInto.split('\n'),
		undefined,
		ruleStates,
		ruleActive,
		traceState,
	)
	
	LINES.setLineStorage();
	LINES.loadId(id);

	return true
}

function onLoadNew() {
	addResizeEvents(LEXICON)
    addResizeEvents(ALIAS_INTO)
    addResizeEvents(ALIAS_FROM)

	if (!updateTo14()) {
		LINES.loadFromStorage();
	}
}

// Drag and drop
Sortable.create(DEMO, {
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
		RULES_VIEW.move(evt.oldIndex!, evt.newIndex!);
	},
});


// ---------- Button Events ---------

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
	DEMO.classList.toggle('invisible');
	document.getElementById("rule-thing")!.classList.toggle('invisible');
})

document.getElementById("history-new")!.addEventListener("click", _ => { LINES.createNew(); })
document.getElementById("history-load")!.addEventListener("change", e => { importLine(e); });
document.getElementById("history-example")!.addEventListener("click", _ => { loadExample(); });

document.getElementById("history-load-label")!.addEventListener("keyup", e => {
	const load = document.getElementById("history-load");
	if (e.key === "Enter" && load) {
		load.click();
	}
});

document.getElementById("add")!.addEventListener("click", _ => RULES_VIEW.addRule());
document.getElementById("updown")!.addEventListener("click", _ => RULES_VIEW.toggleDirection());
document.getElementById("run")!.addEventListener("click", _ => runASCA());
document.getElementById("collapse")!.addEventListener("click", _ => RULES_VIEW.collapseRules());
document.getElementById("activate")!.addEventListener("click", _ => RULES_VIEW.activateRules());
document.getElementById("clear-all")!.addEventListener("click", _ => RULES_VIEW.clearRules());

document.getElementById("version-modal-close")!.addEventListener("click", () => (document.getElementById('version-modal')! as HTMLDialogElement).close());
document.getElementById("version-modal-open")!.addEventListener("click", () => (document.getElementById('version-modal')! as HTMLDialogElement).showModal())

document.getElementById("alias-modal-close")!.addEventListener("click", () => (document.getElementById('alias-modal')! as HTMLDialogElement).close());
document.getElementById("alias-modal-open")!.addEventListener("click", () => showAliasModal())

function showAliasModal() {
	(document.getElementById('alias-modal')! as HTMLDialogElement).showModal();
	// This has to go here for some reason... I assume closed modals don't calculate style changes
	resize(ALIAS_INTO);
	resize(ALIAS_FROM);
}

document.getElementById("history-modal-close")!.addEventListener("click", () => (document.getElementById('history-modal')! as HTMLDialogElement).close());
document.getElementById("history-modal-open")!.addEventListener("click", () => {
	let modal = (document.getElementById('history-modal') as HTMLDialogElement);

	LINES.updateModal();

	modal.showModal();

})

document.getElementById('alias-from-toggle')!.addEventListener("click", () => {
	let x = ALIAS_TOGGLE.querySelector('i')!;

	
	if (x.classList.contains('fa-toggle-off')) {
		x.classList.replace('fa-toggle-off', 'fa-toggle-on');
		ALIAS_TOGGLE.classList.remove('red');
		ALIAS_OPEN.classList.remove('red');
		ALIAS_FROM.classList.remove('ignore');
	} else {
		x.classList.replace('fa-toggle-on', 'fa-toggle-off');
		ALIAS_TOGGLE.classList.add('red');
		ALIAS_OPEN.classList.add('red');
		ALIAS_FROM.classList.add('ignore');
	}
})

document.querySelectorAll('dialog').forEach(item => {
    item.addEventListener('mousedown', event => {
        if (event.target === event.currentTarget) {
            (event.currentTarget as HTMLDialogElement).close()
        }
    })
});

LEXICON.addEventListener("keyup", () => updateTrace());

TRACE.addEventListener("change", () => {
	FORMAT.disabled = TRACE.value !== "-1";
})

document.addEventListener("keyup", (e) => globalHandleKeyUp(e));
document.addEventListener("keydown", (e) => globalHandleKeyDown(e));

// VSCode-like Alt Reordering
LEXICON.addEventListener("keydown", (e) => checkMoveOrDup(e));
ALIAS_INTO.addEventListener("keydown", (e) => checkMoveOrDup(e));
ALIAS_FROM.addEventListener("keydown", (e) => checkMoveOrDup(e));


// ------------ Resizing ------------
// Mimicking field-sizing behaviour where if the user manually resizes a box, it no longer auto-resizes


let resizeObserver = new ResizeObserver(e => {
	if (mouseIsDown) { e[0].target.classList.add("user-resized"); }
});

// Lets us check if the resize was done by using the resize dragger
let mouseIsDown = false;

export function addResizeEvents(el: HTMLElement) {
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

// ----------------------------------

await init()
onLoadNew()