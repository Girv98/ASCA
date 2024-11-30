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


// ------------ Loading rules from JSON ------------

function makeRules(name, rule, desc) {
	$("#demo").append(template)
		.children().last().find(".name").val(name).closest(".draggable-element").find(".rule").val(rule).closest(".draggable-element").find(".description").val(desc);
	createRuleEvents();
};

function onReaderLoad(event) {
	var obj = JSON.parse(event.target.result);
	$('.draggable-element').remove();
	for (let i = 0; i < obj.rules.length; i++) {
		makeRules(obj.rules[i].name, obj.rules[i].rule.join('\n'), obj.rules[i].description);
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

// ------------ On page load events ------------

// TODO: Move off JQuery, it's 2024!
// TODO: doesn't work on mobile
$("#demo").sortable({
	start: function (event, ui) {
		$(ui.helper).css('width',`${$(event.target).width()}px`);
	},
	cancel: "input, textarea"
});
$("#demo").disableSelection().animate();

$("#add").click(addRule);

$("#load").change((e) => loadFile(e))

$("#run").click(function () {
	
	let rawWordList = document.querySelector("#lexicon").value;
	let rawRuleList = getRules();

	console.log("Storing to local storage")
	localStorage.setItem("words", rawWordList);	
	localStorage.setItem("rules", JSON.stringify(rawRuleList));
	
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

	let outlex = document.querySelector(".outlex").querySelector(".wrapper");
	outlex.innerHTML = outlexTemplate;

	let output = document.querySelector('#output');
	output.value = res.join('\n');

	if (window.navigator.userAgent.includes("Firefox")) {
		output.style.height = "1px";
		output.style.height = (25+output.scrollHeight)+"px";
	}

});

// Saving to JSON

$("#save").click(function() {
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
});

function onLoad() {
	console.log("Loading local storage")
	let words = localStorage.getItem("words");
	let rules = JSON.parse(localStorage.getItem("rules"));
	
	if (words !== null) {
		document.querySelector('#lexicon').value = words;
	}
	
	$('.draggable-element').remove();
	for (let i = 0; i < rules.length; i++) {
		makeRules(rules[i].name, rules[i].rule.join('\n'), rules[i].description);
	}
}


$('.draggable-element').remove();
onLoad()