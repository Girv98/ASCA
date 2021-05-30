const template = document.createElement('template');
template.innerHTML = `
<style>


.draggable-element{
    display:block;
	margin: 1%;
	background: #3D3D3D;
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
	border-radius: 10px;
    
}


.title, .cont {
    padding: 2px;
    padding:2%;
}

.name{
	padding:0.5%;
	height: 100%;
	width: 70%;
	font-size:14pt;
	color: white;
    outline:none;
	border: None;
	background: #212121;
	border-radius: 10px;
	font-family: 'Montserrat', sans-serif;
}

.rule {
	white-space:nowrap;
}

.title button {
	height: 100%;
	margin: 0 2px;
	font-weight: bold;
	font-size: 20px;
	text-align: center;
	float:right;
	border: None;
	background-color: Transparent;
	box-shadow: none;
	color: white;
    outline:none;
	cursor: pointer;
}

textarea {
	font-size: 16px;
    width: 100%;
	resize: vertical;
    -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
    -moz-box-sizing: border-box;    /* Firefox, other Gecko */
    box-sizing: border-box;         /* Opera/IE 8+ */
	font-family: CharisSILW, sans-serif;
	background: #212121;
	border-radius: 10px;
	color: #fff;
	outline:none;
	border: None;

}

textarea::placeholder {
	font-family: 'Montserrat', sans-serif;
}

textarea:focus {
	box-shadow: inset 0 0 3px 2px #181818;
	outline:none;
}

textarea.lexicon {
	background: #3D3D3D;
	border-radius: 10px;
	width:100%;
	
}

textarea.lexicon::placeholder {
	color:#fff;
	font-family: CharisSILW, sans-serif;
}

</style>


<div class="draggable-element">
    <div class="title">
        <input type="text" class="name" placeholder = "Sound Change Title...">
        <button class="delete">&#x2715;</button>
        <button class="maxmin">–</button>
    </div>
    <div class="cont">
        <textarea class="rule" spellcheck="false" rows=3 placeholder="Enter rules here..." ></textarea>
        <textarea class="description" rows=5 placeholder="Rule description..."></textarea>
    </div>
</div>
`;


class SoundRule extends HTMLElement {
    constructor() {
        super();

        this.show = true;

        this.attachShadow({mode:'open'});

        this.name = this.shadowRoot.querySelector('.name');
        console.log(this.name);
        this.rule = this.shadowRoot.querySelector('.rule');
        this.desc = this.shadowRoot.querySelector('.description');


        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        this.shadowRoot.querySelector('.maxmin').addEventListener('click', () => this.toggle());
        this.shadowRoot.querySelector('.delete').addEventListener('click', () => this.delete());
        

    }

    toggle() {
        this.show = !this.show;
        
        const cont = this.shadowRoot.querySelector('.cont');
        const toggleBtn = this.shadowRoot.querySelector('.maxmin')

        if(toggleBtn.innerText == '+') {
            cont.style.display = 'inherit';
            toggleBtn.innerText = '–';
        } else {
            cont.style.display = 'none';
            toggleBtn.innerText = '+';
        }
    }

    delete() {
        this.remove();
    }

    connectedCallback() {
        //this.shadowRoot.querySelector('.maxmin').removeEventListener('click', () => this.toggle());
        //this.shadowRoot.querySelector('.delete').removeEventListener('click', () => this.delete());
        
        
        //this.shadowRoot.querySelector('.maxmin').addEventListener('click', () => this.toggle());
       // this.shadowRoot.querySelector('.delete').addEventListener('click', () => this.delete());
        
        //this.rule.addEventListener("keydown", this.handleKeyDown);
        //this.rule.addEventListener("paste", this.handlePaste);
    }


    disconnectedCallback() {
        this.shadowRoot.querySelector('.maxmin').removeEventListener('click', () => this.toggle());
        this.shadowRoot.querySelector('.delete').removeEventListener('click', () => this.delete());

       // this.rule.removeEventListener("keydown", this.handleKeyDown);
        //this.rule.removeEventListener("paste", this.handlePaste);
    }


}

window.customElements.define('sound-rule', SoundRule);