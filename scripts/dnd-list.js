

// const template_old = `
// 	<div class="draggable-element">
// 		<div class="title">
// 			<input type="text" class="name" placeholder = "Sound Change Title...">
// 			<button class="delete">&#x2715;</button>
// 			<button class="maxmin">–</button>
// 		</div>
// 		<div class="cont">
// 			<textarea class="rule" spellcheck="false" rows=3 placeholder="Enter rules here..."></textarea>
// 			<textarea class="description" rows=5 placeholder="Rule description..."></textarea>
// 		</div>
// 	</div>`;

const template = `
	<div class="draggable-element">
		<div class="title">
			<input type="text" class="name" placeholder = "Sound Change Title...">
			<button class="delete"><i class="fas fa-times"></i></button>
			<button class="maxmin"><i class="fas fa-minus"></i></button>
		</div>
		<div class="cont">
			<textarea class="rule" spellcheck="false" rows=3 placeholder="Enter rules here..."></textarea>
			<textarea class="description" rows=5 placeholder="Rule description..."></textarea>
		</div>
	</div>`;


$(function () {

	$("#demo").sortable({
        start: function (event, ui) {
            $(ui.helper).css('width',`${$(event.target).width()}px`);
        },
		cancel: "input, textarea"
    });
	$("#demo").disableSelection().animate();


	$("#run").click(function () {
		var list = [];
		var x = $(".draggable-element textarea.rule");

		//console.log(x);

		x.each(function () {
			console.log($(this).val());
			list.push($(this).val());
		});

		console.log(list);
	});

	$("#add").click(function () {
		$("#demo").append(template);

		$(".div.title").off("click");
		$("div.title").on("click", ".delete", function () {
			console.log("dsknfdkjsdf");
			$(this).closest("div.draggable-element").remove();
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

	});


	$(".title").on("click", ".delete", function () {
		$(this).closest("div.draggable-element").remove();
	});

	$("#save").click(function () {
		var list = [];
		var x = $(".draggable-element");

		x.each(function () {
			nameVal = $(this).find(".name").val();
			ruleVal = $(this).find(".rule").val();
			descVal = $(this).find(".description").val();

			var obj = {
				name: nameVal,
				rule: ruleVal,
				description: descVal
			};
			list.push(obj);
		})

		console.log(list);

		s = JSON.stringify(list);
		console.log(s);

		let a = document.createElement('a');
		a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(s);
		a.download = 'sound changes.json';
		a.click();
	});

});

function makeRules(name, rule, desc) {
	$("#demo").append(template)
		.children().last().find(".name").val(name).closest(".draggable-element").find(".rule").val(rule).closest(".draggable-element").find(".description").val(desc);

	$(".div.title").off("click");
	$("div.title").on("click", ".delete", function () {
		$(this).closest("div.draggable-element").remove();
	});

	$(".maxmin").off("click");
	$(".maxmin").click(function () {

		if ($(this).find("i").hasClass('fa-minus')) {
			$(this).find("i").removeClass('fa-minus');
			$(this).find("i").addClass('fa-plus');
			$(this).closest(".draggable-element").find(".cont").toggleClass('invisible');

		} else {
			$(this).find("i").addClass('fa-minus');
			$(this).closest(".draggable-element").find(".cont").toggleClass('invisible');
		}

	});
};

function onReaderLoad(event) {
	console.log(event.target.result);
	var obj = JSON.parse(event.target.result);
	$('.draggable-element').remove();
	for (i = 0; i < obj.length; i++) {
		makeRules(obj[i].name, obj[i].rule, obj[i].description);
	}
};


function loadFile(event) {

	var reader = new FileReader();
	reader.onload = onReaderLoad;
	reader.readAsText(event.target.files[0]);
	document.getElementById("load").value = null;
};