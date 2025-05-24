export const blockTemplate = `
	<div class="draggable-element" tabindex="0">
		<div class="title">
			<input type="text" class="name" placeholder = "Sound Change Title...">
			<div class="title-btns">
				<!--<button class="onoff" title="Toggle Rule" aria-label="Toggle Rule"><i class="fas fa-chevron-up"></i></button>-->
				<!--<button class="onoff" title="Toggle Rule" aria-label="Toggle Rule"><i class="fas fa-chevron-down"></i></button>-->
				<button class="clone" title="Copy Rule Below" aria-label="Copy Rule"><i class="fas fa-clone" aria-hidden="true"></i></button>
				<button class="onoff" title="Toggle Rule" aria-label="Toggle Rule"><i class="fas fa-toggle-on" aria-hidden="true"></i></button>
				<button class="maxmin" title="Minimise Rule" aria-label="Minimise Rule"><i class="fas fa-minus" aria-hidden="true"></i></button>
				<button class="delete" title="Remove Rule" aria-label="Remove Rule"><i class="fas fa-times" aria-hidden="true"></i></button>
			</div>
		</div>
		<div class="cont">
			<textarea class="rule" spellcheck="false" autocapitalize="off" placeholder="Enter rule(s) here..."></textarea>
			<textarea class="description" autocapitalize="off" placeholder="Rule description..."></textarea>
		</div>
	</div>`;

export const outlexTemplate = `<div id="output" role="textbox" contenteditable="true" spellcheck="false" onbeforeinput="return false" aria-multiline="true"></div>`;

export const historyTemplate = `
<div class="history-item">
	<div style="display:flex; align-items:center;"><h3><span class="history-time"><time></time></span></h3> <button style="height:fit-content;" class="history-load" title="Load" aria-label="Load">Load</button></div>
	<div class="history-contents"">
		<div class="history-text">

		</div>
		
	</div>
</div>
`;