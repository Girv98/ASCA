// import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/+esm'
import Sortable from "https://cdn.jsdelivr.net/npm/sortablejs@latest/+esm"
import init, { run } from '../libasca/asca.js'
await init()

const template = `
	<div class="draggable-element">
		<div class="title">
			<input type="text" class="name" placeholder = "Sound Change Title...">
			<div class="title-btns">
			<button class="maxmin"><i class="fas fa-minus"></i></button>
			<button class="delete"><i class="fas fa-times"></i></button>
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
}

function clearRules() {
	if (confirm("Are you sure you want to remove all rules?") === true) {
		document.querySelectorAll('.draggable-element').forEach(e => e.remove());
	}
}

function collapseRules() {
	let els = document.querySelectorAll(".draggable-element");
	els.forEach(el => {
		el.querySelector(".maxmin").querySelector("i").classList.replace('fa-minus', 'fa-plus')
		el.querySelector(".cont").classList.add('invisible');
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
		} else {
			i.classList.replace('fa-plus', 'fa-minus');
		}
		this.closest(".draggable-element").querySelector(".cont").classList.toggle('invisible')
	})

	// Custom field-sizing	
	addResizeEvents(ruleEl.querySelector('.rule'))
	addResizeEvents(ruleEl.querySelector('.description'))
}
/** 
 * @returns	{boolean[]}
 */
function getRuleBoxStates() {
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
 * @param {string} name @param {string} rule
 * @param {string} desc @param {boolean} ruleStates
 */
function makeRule(name, rule, desc, ruleStates) {
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

	if (ruleStates === true) {
		ruleElement.querySelector(".maxmin").querySelector("i").classList.replace('fa-minus', 'fa-plus')
		ruleElement.querySelector(".cont").classList.toggle('invisible');
	}
	createRuleEvents(ruleElement);
};

// --------------------------------------------------

function onReaderLoad(event) {
	console.log("Loading from file")
	var obj = JSON.parse(event.target.result);
	document.querySelectorAll('.draggable-element').forEach(e => e.remove());
	for (let i = 0; i < obj.rules.length; i++) {
		makeRule(obj.rules[i].name, obj.rules[i].rule.join('\n'), obj.rules[i].description, false);
	}

	if (obj.words !== null) {
		let lex = document.getElementById('lexicon');
		lex.value = obj.words.join('\n');
		lex.style.height = "1px";
		lex.style.height = (lex.scrollHeight)+"px";
	}
};

function loadFile(event) {
	var reader = new FileReader();
	reader.onload = onReaderLoad;
	reader.readAsText(event.target.files[0]);
	document.getElementById("load").value = null;
};

// Saving to JSON
function saveFile() {
	let wordList = document.getElementById("lexicon").value;
	let list = getRules();

	let obj = {
		words: wordList.split('\n'),
		rules: list
	}
	let objJSON = JSON.stringify(obj);

	let a = document.createElement('a');
	a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(objJSON);
	a.download = 'sound_changes.json';
	a.click();
	a.remove();
}

// Run ASCA
function runASCA() {
	let rawWordList = document.getElementById("lexicon").value;
	let rawRuleList = getRules();
	let ruleStates = getRuleBoxStates();

	console.log("Saving to local storage")
	localStorage.setItem("words", rawWordList);	
	localStorage.setItem("rules", JSON.stringify(rawRuleList));
	localStorage.setItem("closedRules", JSON.stringify(ruleStates))
	
	let wordList = rawWordList.split('\n')

	var ruleList = [];
	rawRuleList.forEach((r) => {
		let rule = r.rule.filter(r => r);
		if (rule.length !== 0) {
			ruleList.push(rule)
		}
	});

	let flatRuleList = ruleList.flat();

	if (flatRuleList.length === 0 || wordList.length === 0) {
		return;
	}

	console.log("Running ASCA...");
	let res = run(flatRuleList, wordList);
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

	console.log("Loading local storage")
	let words = localStorage.getItem("words");
	let rules = JSON.parse(localStorage.getItem("rules"));
	let ruleStates = JSON.parse(localStorage.getItem("closedRules"));
	
	if (words !== null) {
		let lex = document.getElementById("lexicon");
		lex.value = words;
		lex.style.height = "1px";
		lex.style.height = (lex.scrollHeight)+"px";
	}
	
	document.querySelectorAll('.draggable-element').forEach(e => e.remove());

	if (rules !== null) {
		for (let i = 0; i < rules.length; i++) {
			// Otherwise, this would be a breaking change
			if (ruleStates === null) {
				makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, false);
			} else {
				makeRule(rules[i].name, rules[i].rule.join('\n'), rules[i].description, ruleStates[i]);
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
	// invertedSwapThreshold: 0.5,
	// SwapThreshold: 0,
	// animation: 200,
	// easing: "cubic-bezier(1, 0, 0, 1)",
	ghostClass: "sortable-ghost",
	dragClass: "sortable-drag",
	forceFallback: true,
});


// Button click events
document.getElementById("add").addEventListener("click", addRule);
document.getElementById("save").addEventListener("click", saveFile);
document.getElementById("load").addEventListener("change", e => loadFile(e));
document.getElementById("run").addEventListener("click", runASCA);
document.getElementById("collapse").addEventListener("click", collapseRules);
document.getElementById("clearall").addEventListener("click", clearRules);

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