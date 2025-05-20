import Sortable from "https://cdn.jsdelivr.net/npm/sortablejs@latest/+esm"
import init, { run_wasm } from '../libasca/asca.js'
await init()

const template = `
	<div class="draggable-element" tabindex="0">
		<div class="title">
			<input type="text" class="name" placeholder = "Sound Change Title...">
			<div class="title-btns">
				<!--<button class="onoff" title="Toggle Rule" aria-label="Toggle Rule"><i class="fas fa-chevron-up"></i></button>-->
				<!--<button class="onoff" title="Toggle Rule" aria-label="Toggle Rule"><i class="fas fa-chevron-down"></i></button>-->
				<button class="copy" title="Copy Rule Below" aria-label="Copy Rule"><i class="fas fa-copy"></i></button>
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

const outlexTemplate = `<div id="output" role="textbox" contenteditable="true" spellcheck="false" onbeforeinput="return false" aria-multiline="true"></div>`;

// ------------ Rule Functions ------------

function addRule() {
	if (dirEnd) {
		addRuleEnd()
	} else {
		addRuleBegin()
	}
}

function addRuleEnd() {
	let demo = document.getElementById("demo");
	demo.insertAdjacentHTML("beforeend", template);
	demo.lastElementChild.querySelector(".copy").querySelector("i").classList.add('fa-rotate-90')
	createRuleEvents(demo.lastElementChild);
	updateCollapse(true)
	updateActive(true)
}

function addRuleBegin() {
	let demo = document.getElementById("demo");
	demo.insertAdjacentHTML("afterbegin", template);
	demo.firstElementChild.querySelector(".copy").querySelector("i").title = "Copy Rule Above"
	createRuleEvents(demo.firstElementChild);
	updateCollapse(true)
	updateActive(true)
}

function changeDirection() {
	let addButton = document.getElementById("add");
	let upDownButton = document.getElementById("updown");
	let txt = "Copy Rule Above"
	if (dirEnd) {
		upDownButton.querySelector("i").classList.replace('fa-chevron-down', 'fa-chevron-up')
		upDownButton.title = "Change add direction to end"
		addButton.title = "Add rule to beginning"
		dirEnd = false
	} else {
		upDownButton.querySelector("i").classList.replace('fa-chevron-up', 'fa-chevron-down')
		upDownButton.title = "Change add direction to beginning"
		addButton.title = "Add rule to end"
		dirEnd = true
		txt = "Copy Rule Below"
	}

	document.querySelectorAll(".draggable-element").forEach(el => {
		let copyButton = el.querySelector(".copy").querySelector("i");
		copyButton.classList.toggle('fa-rotate-90')
		copyButton.title = txt
	})
}

function clearRules() {
	if (confirm("Are you sure you want to remove all rules?") === true) {
		document.querySelectorAll('.draggable-element').forEach(e => e.remove());
		updateCollapse(null)
		updateActive(null)
	}
}

function updateCollapse(col) {
	let button = document.getElementById("collapse");
	if (col === true) {
		button.disabled = false;
		button.innerHTML = "Collapse All"
		toCollapse = true
	} else if (col === false) {
		button.disabled = false;
		button.innerHTML = "Reexpand All"
		toCollapse = false
	} else {
		button.disabled = true;
		button.innerHTML = "Collapse All"
		toCollapse = true
	}
}

function updateActive(act) {
	let button = document.getElementById("activate");
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

	if (allActive) {
		els.forEach(el => {
			el.querySelector(".onoff").querySelector("i").classList.replace('fa-toggle-on', 'fa-toggle-off')
			el.classList.add('ignore');
		})
		updateActive(false)
	} else {
		els.forEach(el => {
			el.querySelector(".onoff").querySelector("i").classList.replace('fa-toggle-off', 'fa-toggle-on')
			el.classList.remove('ignore');
		})
		updateActive(true)
	}

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

	ruleEl.addEventListener('keydown', e => ruleHandleKeyboardDown(e));
	ruleEl.addEventListener('keyup', e => ruleHandleKeyboardUp(e));
	ruleEl.addEventListener('click', e => {
		if (e.target.classList.contains("title")) {
			e.preventDefault();
			ruleEl.focus();
		}
	})

	// x button
	ruleEl.querySelector('.delete').addEventListener('click', function() {
		if (confirm("Are you sure you want to remove this rule?") === true) {
			this.closest(".draggable-element").remove();
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

		if (i.classList.contains('fa-toggle-off')) {
			i.classList.replace('fa-toggle-off', 'fa-toggle-on');
			updateActive(!getRuleActiveBoxes().some((e) => e == false));
		} else {
			i.classList.replace('fa-toggle-on', 'fa-toggle-off');
			updateActive(false);
		}
		this.closest(".draggable-element").classList.toggle('ignore')
	})
	// Copy Button
	ruleEl.querySelector('.copy').addEventListener('click', function() {
		let el = this.closest(".draggable-element");
		let clone = el.cloneNode(true);
		createRuleEvents(clone)
		if (dirEnd) {
			el.parentNode.insertBefore(clone, el.nextSibling);
		} else {
			el.parentNode.insertBefore(clone, el);
		}
	})

	// VSCode-like Alt Reordering
	ruleEl.querySelector('.rule').addEventListener("keydown", (e) => checkMoveOrDup(e));

	// Custom field-sizing	
	addResizeEvents(ruleEl.querySelector('.rule'))
	addResizeEvents(ruleEl.querySelector('.description'))
}

function ruleHandleKeyboardDown(e) {
	if (e.target !== e.currentTarget) {
		// jump to outer
		if (e.shiftKey && e.key == 'Backspace') {
			e.preventDefault();
			e.target.closest(".draggable-element").focus();
		}
		return;
	}

	if (e.altKey) {
		if (e.key == 'ArrowUp') {
			e.preventDefault();
			let parent = document.getElementById("demo");
			parent.insertBefore(e.target, e.target.previousElementSibling);
			e.target.focus();
			console.log("fjdfn")
		} else if (e.key == 'ArrowDown') {
			e.preventDefault();
			let parent = document.getElementById("demo");

			if (e.target.nextElementSibling) {
				parent.insertBefore(e.target.nextElementSibling, e.target);
			} else {
				parent.insertBefore(e.target, parent.firstElementChild);
				e.target.focus();
			}
		}
		return;
	}

	if (e.shiftKey) {
		if (e.key == 'ArrowUp') {
			e.preventDefault();
			e.target.previousElementSibling?.focus()
		} else if (e.key == 'ArrowDown') {
			e.preventDefault();
			e.target.nextElementSibling?.focus()
		}
		return;
	}
}

function ruleHandleKeyboardUp(e) {
	if (e.shiftKey) {
		if (e.key == 'N') {
			// jump to title
			e.preventDefault();
			e.target.querySelector(".name").focus();
		} else if (e.key == 'R') {
			// jump to rule
			e.preventDefault();
			e.target.querySelector('.maxmin i').classList.replace('fa-plus', 'fa-minus');
			e.target.querySelector(".cont").classList.remove('invisible')
			e.target.querySelector(".rule").focus();
			updateCollapse(true)
		} else if (e.key == 'D') {
			// jump to description
			e.preventDefault();
			e.target.querySelector('.maxmin i').classList.replace('fa-plus', 'fa-minus');
			e.target.querySelector(".cont").classList.remove('invisible')
			e.target.querySelector(".description").focus();
			updateCollapse(true)
		} else if (e.key == 'T') {
			// toggle
			let i = e.target.querySelector('.onoff i');

			if (i.classList.contains('fa-toggle-off')) {
				i.classList.replace('fa-toggle-off', 'fa-toggle-on');
				updateActive(!getRuleActiveBoxes().some((e) => e == false));
			} else {
				i.classList.replace('fa-toggle-on', 'fa-toggle-off');
				updateActive(false);
			}
			e.target.classList.toggle('ignore')
		} else if (e.key === 'Home') {
			e.preventDefault();
			document.getElementById("demo")?.firstElementChild?.focus();
		} else if (e.key === 'End') {
			e.preventDefault();
			document.getElementById("demo")?.lastElementChild?.focus();
		}

		return;
	}

	if (e.target === e.currentTarget) {
		if (e.key === 'Delete') {
			e.preventDefault();
			if (confirm("Are you sure you want to remove this rule?") === true) {
				let el = e.target.closest(".draggable-element");
				if (el.previousElementSibling) {
					el.previousElementSibling.focus();
				} else if (el.nextElementSibling) {
					el.nextElementSibling.focus();
				}
				el.remove();
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
		} else if (e.key === 'Enter') {
			e.preventDefault();
			let i = e.target.querySelector('.maxmin i');
			if (i.classList.contains('fa-minus')) {
				i.classList.replace('fa-minus', 'fa-plus');
				if (!getRuleClosedBoxes().some((e) => e == false)) {
					updateCollapse(false)
				}
			} else {
				i.classList.replace('fa-plus', 'fa-minus');
				updateCollapse(true)
			}
			e.target.querySelector(".cont").classList.toggle('invisible')
		}

		return;
	}
}

function globalHandleKeyUp(e) {
	if (e.altKey) {
		switch (e.key) {
			// Move to rules
			case 'r': 
				e.preventDefault();
				document.getElementById("demo")?.firstElementChild?.focus();
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

function globalHandleKeyDown(e) {
	if (e.shiftKey) {
		if (e.key === 'Enter') {
			e.preventDefault();
		}
	}
}

/** 
 * @returns	{boolean[]}
 */
function getRuleActiveBoxes() {
	let activeList = [];
	let els = [...document.querySelectorAll(".draggable-element")];

	els.forEach(el => {
		if (el.querySelector('.onoff').querySelector('i').classList.contains('fa-toggle-on')) {
			activeList.push(true)
		} else {
			activeList.push(false)
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
	resize(r);
	let d = ruleElement.querySelector(".description");
	d.value = desc;
	resize(d);

	if (ruleClosed) {
		ruleElement.querySelector(".maxmin").querySelector("i").classList.replace('fa-minus', 'fa-plus')
		ruleElement.querySelector(".cont").classList.toggle('invisible');
	}

	if (!ruleActive) {
		ruleElement.querySelector(".onoff").querySelector("i").classList.replace('fa-toggle-on', 'fa-toggle-off')
		ruleElement.classList.add('ignore')
	}

	if (dirEnd) {
		ruleElement.querySelector(".copy").querySelector("i").classList.add('fa-rotate-90')
	}

	createRuleEvents(ruleElement);
};

// const U = document.getElementById("synchronise-scroll");
// var d = !1;
// x.addEventListener("scroll", (function(t) {
// 	if (U.checked)
// 		if (d)
// 			d = !1;
// 		else {
// 			const t = x.scrollTop / x.scrollHeight;
// 			d = !0,
// 			k.scrollTop = t * k.scrollHeight
// 		}
// }
// ));
// k.addEventListener("scroll", (function(t) {
// 	if (U.checked)
// 		if (d)
// 			d = !1;
// 		else {
// 			const t = k.scrollTop / k.scrollHeight;
// 			d = !0,
// 			x.scrollTop = t * x.scrollHeight
// 		}
// }
// ));

// --------------------------------------------------

function onReaderLoad(event) {
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
		let lex = document.getElementById('lexicon');
		lex.value = obj.words.join('\n');
		resize(lex);
	}

	let to = document.getElementById("alias-into");
	if (obj.into) { to.value = obj.into.join('\n'); } else { to.value = "" }
	resize(to);

	let fr = document.getElementById("alias-from");
	if (obj.from) { fr.value = obj.from.join('\n'); } else { fr.value = "" }
	resize(fr);

	updateTrace();

	console.log("File parsed")
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


// function getValues() {
// 	let selectElement = document.getElementById("trace");
// 	return [...selectElement.options].map(o => o.value)
// }
  
// function getOptionText() {
// 	let selectElement = document.getElementById("trace");
// 	return [...selectElement.options].map(o => o.text);
// }

function getTraceState() {
	return document.getElementById("trace").value
}

function updateTrace(e) {
	// console.log(e)
	let traceBox = document.getElementById("trace");
	let lex = document.getElementById("lexicon");
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
			opt.value = i;
			opt.innerHTML = w;
			traceBox.append(opt);
		}
	})

	traceBox.value = -1


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
	let rawWordList = document.getElementById("lexicon").value;
	let ruleList = getRules();
	let ruleClosed = getRuleClosedBoxes();
	let ruleActive = getRuleActiveBoxes();
	let traceState = getTraceState();
	let [aliasInto, aliasFrom] = getAliases();

	console.log("Saving to local storage")
	localStorage.setItem("words", rawWordList);	
	localStorage.setItem("rules", JSON.stringify(ruleList));
	localStorage.setItem("closedRules", JSON.stringify(ruleClosed));
	localStorage.setItem("activeRules", JSON.stringify(ruleActive));
	localStorage.setItem("aliasInto", aliasInto);
	localStorage.setItem("aliasFrom", aliasFrom);
	localStorage.setItem("trace", traceState);
	
	let wordList = rawWordList.split('\n')

	for (let i = ruleList.length - 1; i >= 0; i--) {
		if (!ruleActive[i]) {
			ruleList.splice(i, 1)
		}
	}

	let traceNumber = (traceState >= 0) ? traceState : null;
	console.log("Running ASCA...");
	let res = run_wasm(ruleList, wordList, aliasInto.split('\n'), aliasFrom.split('\n'), traceNumber);
	console.log("Done");

	let output = res.get_output();

	let outlexWrapper = document.querySelector(".outlex").querySelector(".scroller");
	outlexWrapper.innerHTML = outlexTemplate;

	let outputArea = document.getElementById('output');

	let outputJoined = "";
	
	// handle unknowns
	let unknowns = res.get_unknowns();
	console.log(unknowns.length)
	if (unknowns.length) {

		let unknownsMap = {};
		unknowns.forEach((val, i) => {
			if (!unknownsMap[val]) unknownsMap[val] = [];
			unknownsMap[val].push(i);
		})

		let unknownsUnique = [... new Set(unknowns)];

		let len = Object.keys(unknownsUnique).length;

		let colors = ["var(--green)", "var(--blue)", "var(--orange)", "var(--purple)",  "var(--red)", "var(--yellow)"]

		let occurence = -1;
		output.forEach((val) => {
			outputJoined += '<div class="out-line"><span>'
			let parts = val.split('�')
			if (parts.length == 1) {
				if (val == "") {
					outputJoined += "<br>"
				} else {
					outputJoined += val;
				}
			} else {
				for (let p = 0; p < parts.length; p++) {
					outputJoined += parts[p];
					
					if (p < parts.length - 1) {
						occurence += 1;
						let ind = unknownsUnique.indexOf(unknowns[occurence]);
						let color = (ind < len) ? colors[ind] : "var(--fg)";
						outputJoined += `<span style="color: ${color};" title="${unknowns[occurence]}">�</span>`
					}

				}
			}
			outputJoined += "</span></div>";
		});

		let string = unknownsUnique.map((val, ind) => {
			let color = (ind < len) ? colors[ind] : "var(--fg)";
			let number = unknownsMap[val].length;
			let counts = (number == 1) ? "count" : "counts";
			return `<div class="out-line"><span>${val} <span style="color: ${color};" title="${val}">�</span> ${number} ${counts}</span></div>`
		}).join('');

		outputJoined += '<div class="out-line"><span><br></span></div>';
		let header = '<div class="out-line"><span><strong>rut| manner |lar|lb|cr|dorsal|pr</strong></span></div>';
		outputJoined += `<div class="out-line"><span><b>${len} unique unknowns found:</b></span></div>${header}${string}`
	} else {
		output.forEach((val) => {
			if (val) {
				outputJoined += `<div class="out-line"><span>${val}</span></div>`
			} else {
				outputJoined += '<div class="out-line"><span><br></span></div>'
			}
		});
	}

	outputArea.innerHTML = outputJoined;
	outputArea.style.height = "1px";
	outputArea.style.height = (outputArea.scrollHeight+16)+"px";
}

function onLoad() {
	addResizeEvents(document.getElementById("lexicon"))
	addResizeEvents(document.getElementById("alias-into"))
	addResizeEvents(document.getElementById("alias-from"))

	console.log("Parsing local storage...")
	let words = localStorage.getItem("words");
	let rules = JSON.parse(localStorage.getItem("rules"));
	let ruleStates = JSON.parse(localStorage.getItem("closedRules"));
	let ruleActive = JSON.parse(localStorage.getItem("activeRules"));
	let traceState = JSON.parse(localStorage.getItem("trace"));
	console.log("Local storage parsed")

	if (ruleStates && rules) {
		if (ruleStates.length) {
			updateCollapse(ruleStates.some((e) => e == false))
		} else {
			updateCollapse(null)
		}
	} else if (rules) {
		updateCollapse(true)
	} else {
		updateCollapse(null)
	}
	
	if (ruleActive) {
		if (ruleActive.length) {
			updateActive(!ruleActive.some((e) => e == false));
		} else {
			updateActive(null)
		}
	} else if (rules) {
		updateActive(true)
	} else {
		updateActive(null)
	}

	let aliasInto = localStorage.getItem("aliasInto");
	let aliasFrom = localStorage.getItem("aliasFrom");
	
	// Populate textareas from local stortage
	let lex = document.getElementById("lexicon");
	if (words) { lex.value = words } else { lex.value = "" }
	resize(lex);

	let to = document.getElementById("alias-into");
	if (aliasInto) {to.value = aliasInto} else { to.value = aliasInto }
	resize(to);

	let fr = document.getElementById("alias-from");
	if (aliasFrom) {fr.value = aliasFrom} else { fr.value = aliasFrom }
	resize(fr);

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

	if (words) {
		let wordList = words.split('\n');
		let selectTag = document.getElementById("trace");

		wordList.map((w, i) => {
			if (w !== "") {
				let opt = document.createElement("option");
				opt.value = i;
				opt.innerHTML = w;
				selectTag.append(opt);

				if ((traceState || traceState === 0) && traceState === i) {
					selectTag.value = traceState;
				}
			}
		})		
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
let allActive = true;
let dirEnd = true;

// Button click events
document.getElementById("add").addEventListener("click", addRule);
document.getElementById("updown").addEventListener("click", changeDirection);
document.getElementById("save").addEventListener("click", saveFile);
document.getElementById("load-label").addEventListener("keyup", e => {
	const load = document.getElementById("load");
	if (e.key === "Enter" && load) {
		load.click();
	}
});
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
	resize(document.getElementById("alias-into"));
	resize(document.getElementById("alias-from"));
})
document.getElementById("alias-modal-close").addEventListener("click", () => document.getElementById('alias-modal').close());

document.querySelectorAll('dialog').forEach(item => {
	item.addEventListener('mousedown', event => {
		if (event.target === event.currentTarget) {
			event.currentTarget.close()
		}
	})
});

document.getElementById("lexicon").addEventListener("keyup", (e) => updateTrace(e));

document.addEventListener("keyup", (e) => globalHandleKeyUp(e));
document.addEventListener("keydown", (e) => globalHandleKeyDown(e));

// VSCode-like Alt Reordering
document.getElementById("lexicon").addEventListener("keydown", (e) => checkMoveOrDup(e));
document.getElementById("alias-into").addEventListener("keydown", (e) => checkMoveOrDup(e));
document.getElementById("alias-from").addEventListener("keydown", (e) => checkMoveOrDup(e));

function checkMoveOrDup(e) {
	if (e.altKey && e.shiftKey) {
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			dupUp(e);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			dupDown(e);
		}
	} else if (e.altKey) {
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			moveUp(e);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			moveDown(e);
		}
	}
}

function dupUp(event) {
	const textarea = event.currentTarget;

	let lines = textarea.value.split('\n');
	const posStart = textarea.selectionStart;
	const posEnd = textarea.selectionEnd;

	const lineStart = textarea.value.slice(0, posStart).match(/\r?\n/gu)?.length ?? 0;
	const lineEnd = textarea.value.slice(0, posEnd).match(/\r?\n/gu)?.length ?? 0;

	let els = lines.slice(lineStart, lineEnd+1);

	lines.splice(lineEnd+1, 0, ...els);

	textarea.value = lines.join("\n");
	textarea.setSelectionRange(posStart, posEnd)

	userResize(textarea)
}

function dupDown(event) {
	const textarea = event.currentTarget;

	let lines = textarea.value.split('\n');
	const posStart = textarea.selectionStart;
	const posEnd = textarea.selectionEnd;

	const lineStart = textarea.value.slice(0, posStart).match(/\r?\n/gu)?.length ?? 0;
	const lineEnd = textarea.value.slice(0, posEnd).match(/\r?\n/gu)?.length ?? 0;

	let els = lines.slice(lineStart, lineEnd+1);

	lines.splice(lineEnd+1, 0, ...els);

	let len = 0;

	els.forEach(el => { len += el.length + 1 });

	let newPosStart = posStart + len;
	let newPosEnd = newPosStart + (posEnd-posStart);
	

	textarea.value = lines.join("\n");
	textarea.setSelectionRange(newPosStart, newPosEnd)

	userResize(textarea)
}

function moveUp(event) {
	const textarea = event.currentTarget;
	
	let lines = textarea.value.split('\n');
	const posStart = textarea.selectionStart;
	const posEnd = textarea.selectionEnd;

	const lineStart = textarea.value.slice(0, posStart).match(/\r?\n/gu)?.length ?? 0;
	const lineEnd = textarea.value.slice(0, posEnd).match(/\r?\n/gu)?.length ?? 0;

	if (lineStart <= 0) return;

	let els = lines.slice(lineStart, lineEnd+1);

	let temp = lines[lineStart-1];

	let i= 0;
	for (; i < els.length; i++) {
		lines[lineStart-1+i] = els[i];
	}
	lines[lineStart-1+i] = temp;
	
	let newPosStart = posStart - 1 - lines[lineEnd].length
	let newPosEnd = newPosStart + (posEnd-posStart);
	
	textarea.value = lines.join("\n");
	textarea.setSelectionRange(newPosStart, newPosEnd)
}

function moveDown(event) {
	const textarea = event.currentTarget;

	let lines = textarea.value.split('\n');
	const posStart = textarea.selectionStart;
	const posEnd = textarea.selectionEnd;

	const lineStart = textarea.value.slice(0, posStart).match(/\r?\n/gu)?.length ?? 0;
	const lineEnd = textarea.value.slice(0, posEnd).match(/\r?\n/gu)?.length ?? 0;

	if (lineEnd+1 > lines.length-1) return;
	
	let els = lines.slice(lineStart, lineEnd+1);

	let temp = lines[lineEnd+1];

	lines[lineStart] = temp;
	for (let i = 1; i < els.length+1; i++) {
		lines[lineStart+i] = els[i-1];
	}

	let newPosStart = posStart + 1 + lines[lineStart].length;
	let newPosEnd = newPosStart + (posEnd-posStart);
	
	textarea.value = lines.join("\n");
	textarea.setSelectionRange(newPosStart, newPosEnd)
}

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
	el.addEventListener("input", e=> userResize(e.target));
	el.addEventListener("mousedown", function() { mouseIsDown = true });
	el.addEventListener("mouseup",   function() { mouseIsDown = false });

	resizeObserver.observe(el)
}

function userResize(el) {
	if (!el.classList.contains("user-resized")) {
		el.style.height = "1px"; el.style.height = (el.scrollHeight+16)+"px";
	}
}

function resize(el) {
	if (!el.classList.contains("user-resized")) {
		el.style.height = "1px"; el.style.height = (el.scrollHeight+16)+"px";
	}
}

// ----------------------------------

onLoad()