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
	$("#demo").append(template);
	createRuleEvents();
}

function clearRules() {
	if (confirm("Are you sure you want to remove all rules?") === true) {
		$('.draggable-element').remove();
	}
}

function collapseRules() {
	let x = $(".draggable-element");

	x.each(function() {
		$(this).find(".maxmin").find("i").removeClass('fa-minus').addClass('fa-plus');
		$(this).find(".cont").addClass('invisible');
	})

}

function getRules() {
	let list = [];
	// document.querySelectorAll(".draggable-element").forEach(function(el){
	let x = $(".draggable-element");
	x.each(function () {
		let obj = {
			name: $(this).find(".name").val(),
			rule: $(this).find(".rule").val().split('\n'),
			description: $(this).find(".description").val()
		};
		list.push(obj);
	})
	return list
}

function createRuleEvents() {
	$("div.title").off("click");
	$("div.title").on("click", ".delete", function () {
		if (confirm("Are you sure you want to remove this rule?") === true) {
			$(this).closest("div.draggable-element").remove();
		}
	});

	$(".maxmin").off("click");
	$(".maxmin").click(function () {
		let i = $(this).find("i");
		if (i.hasClass('fa-minus')) {
			i.removeClass('fa-minus');
			i.addClass('fa-plus');
			$(this).closest(".draggable-element").find(".cont").toggleClass('invisible');
		} else {
			i.removeClass('fa-plus');
			i.addClass('fa-minus');
			$(this).closest(".draggable-element").find(".cont").toggleClass('invisible');
		}
	});
	
	// Custom field-sizing
	$(".rule").off("input");
	$(".rule").on('input', e=> resize(e.target))
	$(".rule").on('mousedown', function() { mouseIsDown = true })
	$(".rule").on('mouseup', function() { mouseIsDown = false })

	$(".description").off("input");
	$(".description").on('input', e=> resize(e.target))
	$(".description").on('mousedown', function() { mouseIsDown = true })
	$(".description").on('mouseup', function() { mouseIsDown = false })

	ro.observe(document.querySelector('.rule'))
	ro.observe(document.querySelector('.description'))
}
/** 
 * @returns	{boolean[]}
 */
function getRuleBoxStates() {
	let closedList = [];
	let x = $(".draggable-element");
	x.each(function() {
		if ($(this).find(".maxmin").find("i").hasClass('fa-plus')) {
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
	$("#demo").append(template);
	let de = $("#demo").children().last();

	de.find(".name").val(name);

	let r = de.find(".rule");
	r.val(rule);
	r.height("1px");
	r.height((r[0].scrollHeight)+"px");
	let d = de.find(".description");
	d.val(desc);
	d.height("1px");
	d.height((d[0].scrollHeight)+"px");

	if (ruleStates === true) {
		de.find(".maxmin").find("i").removeClass('fa-minus').addClass('fa-plus');
		de.find(".cont").toggleClass('invisible');
	}
	createRuleEvents();
};

// --------------------------------------------------

function onReaderLoad(event) {
	var obj = JSON.parse(event.target.result);
	$('.draggable-element').remove();
	for (let i = 0; i < obj.rules.length; i++) {
		makeRule(obj.rules[i].name, obj.rules[i].rule.join('\n'), obj.rules[i].description, false);
	}

	if (obj.words !== null) {
		let lex = document.querySelector('#lexicon');
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
	let wordList = document.querySelector("#lexicon").value;
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
	let rawWordList = document.querySelector("#lexicon").value;
	let rawRuleList = getRules();
	let ruleStates = getRuleBoxStates();

	console.log("Storing to local storage")
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

	let outputArea = document.querySelector('#output');
	outputArea.value = res.join('\n');
	outputArea.style.height = "1px";
	outputArea.style.height = (outputArea.scrollHeight)+"px";
	
}

function onLoad() {
	console.log("Loading local storage")
	let words = localStorage.getItem("words");
	let rules = JSON.parse(localStorage.getItem("rules"));
	let ruleStates = JSON.parse(localStorage.getItem("closedRules"));
	
	if (words !== null) {
		let lex = document.querySelector('#lexicon');
		lex.value = words;
		lex.style.height = "1px";
		lex.style.height = (lex.scrollHeight)+"px";
	}
	
	$('.draggable-element').remove();

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

// TODO: Move off JQuery, it's 2024!
// TODO: doesn't work on mobile
$("#demo").sortable({
	start: function (event, ui) {
		$(ui.helper).css('width',`${$(event.target).width()}px`);
	},
	cancel: "input, textarea"
});

// Button click events
$("#add").click(addRule);
$("#save").click(saveFile);
$("#load").change((e) => loadFile(e))
$("#run").click(runASCA);
$("#collapse").click(collapseRules)
$("#clearall").click(clearRules)

// ------------ Resizing ------------
// Mimicking field-sizing behaviour where if the user manually resizes a box, it no longer auto-resizes

function resize(el) {
	if (!el.classList.contains("user-resized")) {
		el.style.height = "1px";
		el.style.height = (el.scrollHeight)+"px";
	}
}

// Lets us check if the resize was done by using the resize dragger
let mouseIsDown = false;

// Events for the input box
$("#lexicon").on('input', e=> resize(e.target))
$("#lexicon").on('mousedown', function() { mouseIsDown = true })
$("#lexicon").on('mouseup', function() { mouseIsDown = false })

let ro = new ResizeObserver((e) => {
	if (mouseIsDown) {
		e[0].target.classList.add("user-resized");
	}
});

ro.observe(document.querySelector('#lexicon'));

// ----------------------------------

// NOTE: Must be called after assigning ResizeObserver
onLoad()