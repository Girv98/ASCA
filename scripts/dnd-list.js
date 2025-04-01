// import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/+esm'
import Sortable from "https://cdn.jsdelivr.net/npm/sortablejs@latest/+esm"
import init, { run_wasm } from '../libasca/asca.js'
await init()

const template = `
	<div class="draggable-element">
		<div class="title">
			<input type="text" class="name" placeholder = "Sound Change Title...">
			<div class="title-btns">
			<button class="onoff" title="Toggle Rule" aria-label="Toggle Rule"><i class="fas fa-toggle-on"></i></button>
			<button class="maxmin" title="Minimise Rule" aria-label="Minimise Rule"><i class="fas fa-minus"></i></button>
			<button class="delete" title="Remove Rule" aria-label="Remove Rule"><i class="fas fa-times"></i></button>
			</div>
		</div>
		<div class="cont">
			<textarea class="rule" spellcheck="false" placeholder="Enter rule(s) here..."></textarea>
			<textarea class="description" placeholder="Rule description..."></textarea>
		</div>
	</div>`;

const outlexTemplate = `<textarea id="output" spellcheck="false" readonly></textarea>`;

// ------------ Rule Functions ------------

function addRule() {
	let demo = document.getElementById("demo");
	demo.insertAdjacentHTML( "beforeend", template);
	createRuleEvents(demo.lastChild);
	updateCollapse(true)
}

function clearRules() {
	if (confirm("Are you sure you want to remove all rules?") === true) {
		document.querySelectorAll('.draggable-element').forEach(e => e.remove());
	}
	updateCollapse(true)
}

function updateCollapse(coll) {
	let colButton = document.getElementById("collapse");
	if (coll) {
		colButton.innerHTML = "Collapse"
		toCollapse = true
	} else {
		colButton.innerHTML = "Expand"
		toCollapse = false
	}
}

function collapseRules() {
	let els = document.querySelectorAll(".draggable-element");

	if (toCollapse) {
		els.forEach(el => {
			el.querySelector(".maxmin").querySelector("i").classList.replace('fa-minus', 'fa-plus')
			el.querySelector(".cont").classList.add('invisible');
		})
		updateCollapse(false)
	} else {
		els.forEach(el => {
			el.querySelector(".maxmin").querySelector("i").classList.replace('fa-plus', 'fa-minus')
			el.querySelector(".cont").classList.remove('invisible');
		})
		updateCollapse(true)
	}
}

function activateRules() {
	let els = document.querySelectorAll(".draggable-element");
	els.forEach(el => {
		el.querySelector(".onoff").querySelector("i").classList.replace('fa-toggle-off', 'fa-toggle-on')
		el.classList.remove('ignore');
	})
}

function getRules() {
	let list = [];
	let els = document.querySelectorAll(".draggable-element");

	els.forEach(el => {
		let name = el.querySelector('.name').value;
		let rule = el.querySelector('.rule').value.split('\n');
		let description = el.querySelector('.description').value;
		let obj = {
			name,
			rule,
			description
		};
		list.push(obj);
	})

	return list
}

function getAliases() {
	return [(document.getElementById("alias-into").value), (document.getElementById("alias-from").value)]
}

function createRuleEvents(ruleEl) {
	// x button
	ruleEl.querySelector('.delete').addEventListener('click', function() {
		if (confirm("Are you sure you want to remove this rule?") === true) {
			this.closest(".draggable-element").remove();
		}
	})
	// +/- button
	ruleEl.querySelector('.maxmin').addEventListener('click', function() {
		let i = this.querySelector('i');
		if (i.classList.contains('fa-minus')) {
			i.classList.replace('fa-minus', 'fa-plus');
			if (!getRuleClosedBoxes().some((e) => e == false)) {
				updateCollapse(false)
			}
		} else {
			i.classList.replace('fa-plus', 'fa-minus');
			updateCollapse(true)
		}
		this.closest(".draggable-element").querySelector(".cont").classList.toggle('invisible')
	})

	// On/Off Button
	ruleEl.querySelector('.onoff').addEventListener('click', function() {
		let i = this.querySelector('i');
		if (i.classList.contains('fa-toggle-on')) {
			i.classList.replace('fa-toggle-on', 'fa-toggle-off');
		} else {
			i.classList.replace('fa-toggle-off', 'fa-toggle-on');
		}
		this.closest(".draggable-element").classList.toggle('ignore')
	})
	// Custom field-sizing	
	addResizeEvents(ruleEl.querySelector('.rule'))
	addResizeEvents(ruleEl.querySelector('.description'))
}

/** 
 * @returns	{boolean[]}
 */
function getRuleActiveBoxes() {
	let activeList = [];
	let els = [...document.querySelectorAll(".draggable-element")];

	els.forEach(el => {
		if (el.classList.contains('ignore')) {
			activeList.push(false)
		} else {
			activeList.push(true)
		}
	})
	return activeList
}

/** 
 * @returns	{boolean[]}
 */
function getRuleClosedBoxes() {
	let closedList = [];
	let els = [...document.querySelectorAll(".draggable-element")];

	els.forEach(el => {
		if (el.querySelector('.maxmin').querySelector('i').classList.contains('fa-plus')) {
			closedList.push(true)
		} else {
			closedList.push(false)
		}
	})
	return closedList
}
/**
 *
 * @param {string} name @param {string} rule @param {string} desc 
 * @param {boolean} ruleClosed @param {boolean} ruleActive
 */
function makeRule(name, rule, desc, ruleClosed, ruleActive) {
	let demo = document.getElementById("demo");
	demo.insertAdjacentHTML( "beforeend", template);
	let ruleElement = demo.lastChild;

	ruleElement.querySelector(".name").value = name;

	let r = ruleElement.querySelector(".rule");
	r.value = rule;
	r.style.height = "1px";
	r.style.height = (r.scrollHeight)+"px";
	let d = ruleElement.querySelector(".description");
	d.value = desc;
	d.style.height = "1px";
	d.style.height = (d.scrollHeight)+"px";

	if (ruleClosed) {
		ruleElement.querySelector(".maxmin").querySelector("i").classList.replace('fa-minus', 'fa-plus')
		ruleElement.querySelector(".cont").classList.toggle('invisible');
	}

	if (!ruleActive) {
		ruleElement.querySelector(".onoff").querySelector("i").classList.replace('fa-toggle-on', 'fa-toggle-off')
		ruleElement.classList.add('ignore')
	}

	createRuleEvents(ruleElement);
};

// --------------------------------------------------

function onReaderLoad(event) {
	console.log("Loading from file")
	var obj = JSON.parse(event.target.result);

	if (!obj.words && !obj.rules) {
		alert("Not able to parse json")
		return
	} 

	document.querySelectorAll('.draggable-element').forEach(e => e.remove());
	for (let i = 0; i < obj.rules.length; i++) {
		makeRule(obj.rules[i].name, obj.rules[i].rule.join('\n'), obj.rules[i].description, false, true);
	}
	updateCollapse(true)

	if (obj.words) {
		let lex = document.getElementById('lexicon');
		lex.value = obj.words.join('\n');
		lex.style.height = "1px";
		lex.style.height = (lex.scrollHeight)+"px";
	}

	let to = document.getElementById("alias-into");
	if (obj.into) {
		to.value = obj.into.join('\n');
	} else {
		to.value = ""
	}
	to.style.height = "1px";
	to.style.height = (to.scrollHeight)+"px";

	let fr = document.getElementById("alias-from");
	if (obj.from) {
		fr.value = obj.from.join('\n');
	} else {
		fr.value = ""
	}
	fr.style.height = "1px";
	fr.style.height = (fr.scrollHeight)+"px";
};

function loadFile(event) {
	var reader = new FileReader();
	reader.onload = onReaderLoad;
	reader.readAsText(event.target.files[0]);
	document.getElementById("load").value = null;
};

// TODO: see https://www.reddit.com/r/conlangs/comments/1h2ryxf/comment/m10lko8/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
// Saving to JSON
function saveFile() {
	let wordList = document.getElementById("lexicon").value;
	let rules = getRules();
	let into = document.getElementById("alias-into").value;
	let from = document.getElementById("alias-from").value;

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

// function saveFile() {
// 	let wordList = document.getElementById("lexicon").value;
// 	let list = getRules();

// 	let obj = {
// 		words: wordList.split('\n'),
// 		rules: list
// 	}
// 	let objJSON = JSON.stringify(obj);

// 	let downloading = browser.downloads.download({
// 		url: "data:text/plain;charset=utf-8," + encodeURIComponent(objJSON),
// 		filename: 'sound_changes.json',
// 		saveAs: true,
// 	  });
// }


// Run ASCA
function runASCA() {
	let rawWordList = document.getElementById("lexicon").value;
	let ruleList = getRules();
	let ruleClosed = getRuleClosedBoxes();
	let ruleActive = getRuleActiveBoxes();

	let [aliasInto, aliasFrom] = getAliases();

	console.log("Saving to local storage")
	localStorage.setItem("words", rawWordList);	
	localStorage.setItem("rules", JSON.stringify(ruleList));
	localStorage.setItem("closedRules", JSON.stringify(ruleClosed));
	localStorage.setItem("activeRules", JSON.stringify(ruleActive));
	localStorage.setItem("aliasInto", aliasInto);
	localStorage.setItem("aliasFrom", aliasFrom);
	
	let wordList = rawWordList.split('\n')

	// if (ruleList.length === 0 || wordList.length === 0) {
	// 	return;
	// }

	for (let i = ruleList.length - 1; i >= 0; i--) {
		if (!ruleActive[i]) {
			ruleList.splice(i, 1)
		}
	}

	// if (ruleList.length === 0) {
	// 	return;
	// }

	console.log("Running ASCA...");
	let res = run_wasm(ruleList, wordList, aliasInto.split('\n'), aliasFrom.split('\n'));
	console.log("Done");

	let outlexWrapper = document.querySelector(".outlex").querySelector(".wrapper");
	outlexWrapper.innerHTML = outlexTemplate;

	let outputArea = document.getElementById('output');
	outputArea.value = res.join('\n');
	outputArea.style.height = "1px";
	outputArea.style.height = (outputArea.scrollHeight)+"px";
	
}

function onLoad() {
	addResizeEvents(document.getElementById("lexicon"))
	addResizeEvents(document.getElementById("alias-into"))
	addResizeEvents(document.getElementById("alias-from"))

	console.log("Loading local storage")
	let words = localStorage.getItem("words");
	let rules = JSON.parse(localStorage.getItem("rules"));
	let ruleStates = JSON.parse(localStorage.getItem("closedRules"));
	let ruleActive = JSON.parse(localStorage.getItem("activeRules"));

	if (ruleStates && !ruleStates.some((e) => e == false)) {
		updateCollapse(false)
	}

	let aliasInto = localStorage.getItem("aliasInto");
	let aliasFrom = localStorage.getItem("aliasFrom");
	
	// Populate textareas from local stortage
	let lex = document.getElementById("lexicon");
	if (words) { lex.value = words } else { lex.value = "" }
	lex.style.height = "1px";
	lex.style.height = (lex.scrollHeight)+"px";

	let to = document.getElementById("alias-into");
	if (aliasInto) {to.value = aliasInto} else { to.value = aliasInto }
	to.style.height = "1px";
	to.style.height = (to.scrollHeight)+"px";

	let fr = document.getElementById("alias-from");
	if (aliasFrom) {fr.value = aliasFrom} else { fr.value = aliasFrom }
	fr.style.height = "1px";
	fr.style.height = (fr.scrollHeight)+"px";

	document.querySelectorAll('.draggable-element').forEach(e => e.remove());

	if (rules) {
		for (let i = 0; i < rules.length; i++) {
			// Otherwise, this would be a breaking change
			if (!ruleStates && !ruleActive) {
				makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, false, true);
			} else if (!ruleActive) {
				makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, ruleStates[i], true);
			} else if (!ruleStates) { 
				makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, false, ruleActive[i]);
			} else {
				makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, ruleStates[i], ruleActive[i]);
			}
		}
	}
}

// ------------ On page load events ------------

// Drag and drop
Sortable.create(document.getElementById('demo'), {
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

let toCollapse = true;

// Button click events
document.getElementById("add").addEventListener("click", addRule);
document.getElementById("save").addEventListener("click", saveFile);
document.getElementById("load").addEventListener("change", e => loadFile(e));
document.getElementById("run").addEventListener("click", runASCA);
document.getElementById("collapse").addEventListener("click", collapseRules);
document.getElementById("activate").addEventListener("click", activateRules);
document.getElementById("clear-all").addEventListener("click", clearRules);

document.getElementById("version-modal-open").addEventListener("click", () => document.getElementById('version-modal').showModal())
document.getElementById("version-modal-close").addEventListener("click", () => document.getElementById('version-modal').close());

document.getElementById("alias-modal-open").addEventListener("click", () => {
	document.getElementById('alias-modal').showModal();
	// This has to go here for some reason... I assume closed modals don't calculate style changes
	let to = document.getElementById("alias-into");
	to.style.height = "1px"; to.style.height = (to.scrollHeight)+"px";
	let fr = document.getElementById("alias-from");
	fr.style.height = "1px"; fr.style.height = (fr.scrollHeight)+"px";
})
document.getElementById("alias-modal-close").addEventListener("click", () => document.getElementById('alias-modal').close());

document.querySelectorAll('dialog').forEach(item => {
	item.addEventListener('mousedown', event => {
		if (event.target === event.currentTarget) {
			event.currentTarget.close()
		}
	})
});

// ------------ Resizing ------------
// Mimicking field-sizing behaviour where if the user manually resizes a box, it no longer auto-resizes

let resizeObserver = new ResizeObserver(e => {
	if (mouseIsDown) {
		e[0].target.classList.add("user-resized");
	}
});
// Lets us check if the resize was done by using the resize dragger
let mouseIsDown = false;

function addResizeEvents(el) {
	el.addEventListener("input", e=> resize(e.target));
	el.addEventListener("mousedown", function() { mouseIsDown = true });
	el.addEventListener("mouseup",   function() { mouseIsDown = false });

	resizeObserver.observe(el)
}

function resize(el) {
	if (!el.classList.contains("user-resized")) {
		el.style.height = "1px";
		el.style.height = (el.scrollHeight)+"px";
	}
}

// ----------------------------------

onLoad()