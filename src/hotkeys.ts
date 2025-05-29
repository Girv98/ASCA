import { userResize } from "./main";
import { Rules } from "./rules";

export function checkMoveOrDup(e: KeyboardEvent) {
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

export function ruleHandleKeyboardDown(rules: Rules, e: KeyboardEvent) {
    if (e.target !== e.currentTarget) {
        // jump to outer
        if (e.shiftKey && e.key == 'Backspace') {
            e.preventDefault();
            ((e.target as HTMLElement).closest(".draggable-element") as HTMLDivElement)?.focus();
        }
        return;
    }

    if (e.altKey) {
        if (e.key == 'ArrowUp') {
            e.preventDefault();
            let parent = document.getElementById("demo")!;
            let index = Array.prototype.indexOf.call(parent.children, e.target as HTMLElement)

            rules.moveUpWrap(index)

            parent.insertBefore((e.target as HTMLElement), (e.target as HTMLElement).previousElementSibling);
            (e.target as HTMLElement)?.focus();
        } else if (e.key == 'ArrowDown') {
            e.preventDefault();
            let parent = document.getElementById("demo")!;
            let index = Array.prototype.indexOf.call(parent.children, e.target as HTMLElement)

            rules.moveDownWrap(index)

            if ((e.target as HTMLElement).nextElementSibling) {
                parent.insertBefore((e.target as HTMLElement).nextElementSibling!, (e.target as HTMLElement));
            } else {
                parent.insertBefore((e.target as HTMLElement), parent.firstElementChild);
                (e.target as HTMLElement)?.focus();
            }
        }
        return;
    }

    if (e.shiftKey) {
        if (e.key == 'ArrowUp') {
            e.preventDefault();
            ((e.target as HTMLElement).previousElementSibling as HTMLDivElement)?.focus()
        } else if (e.key == 'ArrowDown') {
            e.preventDefault();
            ((e.target as HTMLElement).nextElementSibling as HTMLDivElement)?.focus()
        }
        return;
    }
}

export function ruleHandleKeyboardUp(rules: Rules, e: KeyboardEvent) {
    if (e.target === e.currentTarget) {
        if (e.shiftKey) {
            if (e.key === 'Home') {
                e.preventDefault();
                (document.getElementById("demo")?.firstElementChild as HTMLDivElement).focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                (document.getElementById("demo")?.lastElementChild as HTMLDivElement).focus();
            } else if (e.key == 'A') {
                // jump to title
                e.preventDefault();
                ((e.target as HTMLElement)?.querySelector(".name") as HTMLInputElement)?.focus();
            } else if (e.key == 'S') {
                // jump to rule
                e.preventDefault();
                (e.target as HTMLElement)?.querySelector('.maxmin')?.querySelector('i')?.classList?.replace('fa-plus', 'fa-minus');
                (e.target as HTMLElement)?.querySelector(".cont")?.classList.remove('invisible');
                ((e.target as HTMLElement)?.querySelector(".cm-content") as HTMLTextAreaElement)?.focus();
                rules.updateCollapse(true)
            } else if (e.key == 'D') {
                // jump to description
                e.preventDefault();
                (e.target as HTMLElement)?.querySelector('.maxmin i')?.classList.replace('fa-plus', 'fa-minus');
                (e.target as HTMLElement)?.querySelector(".cont")?.classList.remove('invisible');
                ((e.target as HTMLElement)?.querySelector(".description") as HTMLTextAreaElement)?.focus();
                rules.updateCollapse(true)
            } else if (e.key == 'T') {
                // toggle
                let i = (e.target as HTMLElement).querySelector('.onoff i')!;

                if (i.classList.contains('fa-toggle-off')) {
                    i.classList.replace('fa-toggle-off', 'fa-toggle-on');
                    rules.updateActive(!Rules.getRuleActiveBoxes().some((e) => e == false));
                } else {
                    i.classList.replace('fa-toggle-on', 'fa-toggle-off');
                    rules.updateActive(false);
                }
                (e.target as HTMLElement).classList.toggle('ignore')
            }
        } else if (e.key === 'Delete') {
            e.preventDefault();
            let el = (e.target as HTMLElement).closest(".draggable-element")!;
            let nextEl = el.previousElementSibling ?? el.nextElementSibling;

            rules.removeRule(el as HTMLElement);

            if (nextEl) {
                (nextEl as HTMLDivElement).focus();
            }

        } else if (e.key === 'Enter') {
            e.preventDefault();
            let i = (e.target as HTMLElement).querySelector('.maxmin i')!;
            if (i.classList.contains('fa-minus')) {
                i.classList.replace('fa-minus', 'fa-plus');
                if (!Rules.getRuleClosedBoxes().some((e) => e == false)) {
                    rules.updateCollapse(false)
                }
            } else {
                i.classList.replace('fa-plus', 'fa-minus');
                rules.updateCollapse(true)
            }
            (e.target as HTMLElement).querySelector(".cont")!.classList.toggle('invisible')
        }

        return;
    }
}


function dupUp(event: KeyboardEvent) {
    const textarea = event.currentTarget! as HTMLTextAreaElement;

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

function dupDown(event: KeyboardEvent) {
    const textarea = event.currentTarget as HTMLTextAreaElement;

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

function moveUp(event: KeyboardEvent) {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    
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

function moveDown(event: KeyboardEvent) {
    const textarea = event.currentTarget as HTMLTextAreaElement;

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
