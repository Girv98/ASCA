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
			<textarea class="rule" spellcheck="false" rows=4 placeholder="Enter rule(s) here..."></textarea>
			<textarea class="description" rows=3 placeholder="Rule description..."></textarea>
		</div>
	</div>`;

const outlexTemplate = `<textarea id="output" spellcheck="false" readonly></textarea>`;

function addRule() {
	$("#demo").append(template);
	createRuleEvents();
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
		if (confirm("Are you sure you want to delete this rule?") == true) {
			$(this).closest("div.draggable-element").remove();
		}
	});

	$(".maxmin").off("click");
	$(".maxmin").click(function () {
		if ($(this).find("i").hasClass('fa-minus')) {
			$(this).find("i").removeClass('fa-minus');
			$(this).find("i").addClass('fa-plus');
			$(this).closest(".draggable-element").find(".cont").toggleClass('invisible');
		} else {
			$(this).find("i").removeClass('fa-plus');
			$(this).find("i").addClass('fa-minus');
			$(this).closest(".draggable-element").find(".cont").toggleClass('invisible');
		}
	});
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
	de.find(".rule").val(rule);
	de.find(".description").val(desc);

	if (ruleStates === true) {
		de.find(".maxmin").find("i").removeClass('fa-minus').addClass('fa-plus');
		de.find(".cont").toggleClass('invisible');
	}
	createRuleEvents();
};

function onReaderLoad(event) {
	var obj = JSON.parse(event.target.result);
	$('.draggable-element').remove();
	for (let i = 0; i < obj.rules.length; i++) {
		makeRule(obj.rules[i].name, obj.rules[i].rule.join('\n'), obj.rules[i].description, false);
	}

	if (obj.words !== null) {
		document.querySelector('#lexicon').value = obj.words.join('\n');
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

	// Firefox and Safari do not have the field-sizing property yet
	if (window.navigator.userAgent.includes("Firefox") || window.navigator.userAgent.includes("Safari")) {
		outputArea.style.height = "1px";
		outputArea.style.height = (outputArea.scrollHeight)+"px";
	}
}

function onLoad() {
	console.log("Loading local storage")
	let words = localStorage.getItem("words");
	let rules = JSON.parse(localStorage.getItem("rules"));
	let ruleStates = JSON.parse(localStorage.getItem("closedRules"));
	
	if (words !== null) {
		document.querySelector('#lexicon').value = words;
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

function collapseRules() {
	let x = $(".draggable-element");

	x.each(function() {
		$(this).find(".maxmin").find("i").removeClass('fa-minus').addClass('fa-plus');
		$(this).find(".cont").addClass('invisible');
	})

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

$("#add").click(addRule);

$("#save").click(saveFile);

$("#load").change((e) => loadFile(e))

$("#run").click(runASCA);

$("#collapse").click(collapseRules)

$('.draggable-element').remove();
onLoad()