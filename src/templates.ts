export const blockTemplate = `
	<div class="draggable-element" tabindex="0">
		<div class="element-asdf">
			<div class="grabber">
				<i class="fas fa-grip-vertical"></i>
			</div>
			<div class="element-body">
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
			</div>
		</div>
		<div class="cont">
			<div class="rule-cont"></div>
			<!--<textarea class="rule" spellcheck="false" autocapitalize="off" placeholder="Enter rule(s) here..."></textarea>-->
			<textarea class="description" autocapitalize="off" placeholder="Rule description..."></textarea>
		</div>
	</div>`;

export const outlexTemplate = `<div id="output" role="textbox" contenteditable="true" spellcheck="false" onbeforeinput="return false" aria-multiline="true"></div>`;

export const historyTemplate = `
<div class="history-item">
	<div class="history-item-content">
		<span class="history-id" contenteditable="plaintext-only" spellcheck="false" autocapitalize="off" title="Save ID"></span> 
		<!-- <span class="history-made-time">created&nbsp;<time></time></span>-->
		<span class="history-mod-time" title="Time when last modified"><time></time></span>
	</div>
	<div class="history-item-buttons">
		<button class="history-item-load" title="Load save into ASCA" aria-label="Load">Load</button>
		<button class="history-item-save" title="Download save to computer" aria-label="Export">Export</button>
		<button class="history-item-share" title="Copy link to this save to clipboard" aria-label="Share">Share</button>
		<button class="history-item-delete" title="Delete save" aria-label="Delete">Delete</button>
	</div>
</div>
`;