window.editorID || (editorID = 'default');
var BLOCK_ALL_SHORTCUTS_WITH = {},
	DEFAULT_FONT_SIZE = 19,
	PREF_COOKIES_POSTFIX = 'default',
	DEFAULT_AUTOPRETTY = !0,
	HIGHLIGHT_FREQUENT_BUTTONS = !1,
	BUTTON_HIGHLIGHT_BG_COLOR = [ 0, 204, 255 ],
	HIDDEN_BUTTONS_SHOWN_BY_DEFAULT = !1,
	CARET_SHORTCUT_TIP = null,
	aa = BrowserDetect.IE || (BrowserDetect.MacOS && !BrowserDetect.Safari) ? 'Ctrl+' : 'Alt+',
	h = aa,
	ba = !1,
	ca = BrowserDetect.MacOS || BrowserDetect.iOS ? 'Meta+' : 'Ctrl+',
	FONT_FACES,
	gIframeHasLoaded = !1,
	da = !1,
	chars = {
		DEFAULT: { lower: null, upper: null },
		DEFAULT_OPENING_QUOTE: { lower: '\u201c' },
		DEFAULT_CLOSING_QUOTE: { lower: '\u201d' },
		DEFAULT_STRAIGHT_QUOTE: { lower: '"' },
		DEFAULT_APOSTROPHE: { lower: '\u2019' },
		DEFAULT_STRAIGHT_APOSTROPHE: { lower: "'" },
		DEFAULT_DASH: { lower: '-' },
		DEFAULT_ENDASH: { lower: '\u2013' },
		DEFAULT_EMDASH: { lower: '\u2014' }
	},
	keys = {},
	autoPrettyKeys = {},
	compose = {},
	ea = {};
ea['"'] = [ chars.DEFAULT_OPENING_QUOTE, chars.DEFAULT_CLOSING_QUOTE, chars.DEFAULT_STRAIGHT_QUOTE ];
ea["'"] = [ chars.DEFAULT_APOSTROPHE, chars.DEFAULT_STRAIGHT_APOSTROPHE ];
ea['-'] = [ chars.DEFAULT_DASH, chars.DEFAULT_ENDASH, chars.DEFAULT_EMDASH ];
var m = {},
	n = {},
	p = 0,
	q = [],
	fa = l[rs([ 104, 111, 115, 116, 110, 97, 109, 101 ])],
	ha = 0,
	ia,
	r,
	t,
	u,
	v,
	w,
	x,
	ja,
	y,
	ka;
function z(a) {
	switch (a) {
		case 'ClearAll':
			z('SelectAll');
			z('Delete');
			la();
			window.ga && ga('send', 'event', 'editor', 'Clear button pressed');
			break;
		case 'CopyAll':
			return (
				z('SelectAll'),
				BrowserDetect.Firefox && r(),
				window.ga && ga('send', 'event', 'editor', 'Copy All button pressed'),
				z('Copy')
			);
		default:
			try {
				var b = (v ? w : document).execCommand(a, !1, !1);
			} catch (c) {
				b = !1;
			}
			if (!1 === b) return !1;
			la(!1);
			return !0;
	}
}
function ma(a, b, c, d) {
	var e, g;
	if (void 0 !== a[0]) {
		var k = a;
		a = 0 < p;
		void 0 === k[p] && (p = 0);
		var O = p;
		var U = a ? (0 < p ? p - 1 : k.length - 1) : -1;
	} else {
		var G = a;
		a = !1;
	}
	do {
		k && (G = k[p]);
		if (G.composeID && (!b || d)) {
			void 0 === g &&
				(g = a && '' !== m.h ? m.h : na(a && m.m ? window.j + m.m.length + 1 : window.j + 1).charAt(0));
			var V = (e = compose[g + '+' + G.composeID]);
		}
		void 0 === e &&
			(b
				? c ? (V = G.lower) : void 0 !== G.upper ? (V = G.upper) : d && (V = G.lower)
				: (V = c ? (void 0 !== G.upper ? G.upper : G.lower) : G.lower));
		if (void 0 === V && k) {
			p++;
			p >= k.length && (p = 0);
			if (p == O) break;
			if (p == U) return (p = 0), ma(k, b, c, d);
		} else break;
	} while (1);
	!a && 0 < q.length && '' === q[q.length - 1].h && (q = []);
	if (void 0 === V) return (n.h = ''), (p = 0), 1;
	oa();
	a
		? ((b = q.pop()), '' !== m.h ? (e ? pa(m.m.length) : qa(b)) : e ? pa(m.m.length + 1) : pa(m.m.length))
		: e && pa(1);
	if (null === V) return (n.h = ''), (n.m = '_'), 0 < q.length && (q = []), (p = 0);
	void 0 === e
		? ((n.h = ''), 0 < q.length && q.push(n))
		: ((n.h = g), 0 < q.length && '' === q[q.length - 1].h && (q = []), q.push(n));
	n.m = V;
	ra(V);
	return 2;
}
function ra(a) {
	w.execCommand('insertText', !1, a);
}
function sa(a) {
	if (BrowserDetect.IE && 11 <= BrowserDetect.majorVersion) {
		var b = u.selectionStart;
		u.value = u.value.slice(0, b) + a + u.value.slice(u.selectionEnd);
		u.selectionStart = u.selectionEnd = b + a.length;
	} else u.focus(), document.execCommand('insertText', !1, a);
}
function pa(a) {
	ta(a) > a && w.execCommand('insertText', !1, x.toString().slice(0, -a));
}
function ua(a) {
	u.selectionStart -= a;
}
function va() {
	wa() || (pa(1), u ? (u.focus(), document.execCommand('delete', !1)) : w.execCommand('delete', !1));
}
function na(a) {
	if (0 != x.rangeCount) {
		var b = x.getRangeAt(0).cloneRange();
		a = xa(a, b.startContainer, b.startOffset);
		b.collapse(!0);
		b.setStart(a.node, a.offset);
		return b.toString();
	}
}
function ya(a) {
	return u.value.slice(Math.max(u.selectionStart - a, 0), u.selectionStart);
}
function oa() {
	0 < window.j && (0 < ta(window.j) && w.execCommand('Delete', !1, !1), (window.j = 0));
}
function za() {
	0 < window.j && ((u.selectionStart -= window.j), (window.j = 0));
}
function ta(a) {
	var b = x;
	if (0 != b.rangeCount) {
		var c = b.getRangeAt(0),
			d = b.toString().length,
			e = xa(a, c.startContainer, c.startOffset);
		c.setStart(e.node, e.offset);
		b.removeAllRanges();
		b.addRange(c);
		if (0 < e.C) return a - e.C;
		for (var g = 0; b.toString().length - d < a && 5 > g; ) {
			e = xa(1, e.node, e.offset);
			if (0 < e.C) return a + 1 - e.C;
			c.setStart(e.node, e.offset);
			b.removeAllRanges();
			b.addRange(c);
			a += 1;
			g += 1;
		}
		return a;
	}
}
function Aa(a) {
	var b = xa(1, a.startContainer, a.startOffset);
	a.setStart(b.node, b.offset);
}
function Ba(a) {
	for (; a !== w.body; ) {
		if (a.previousSibling) return Ca(a.previousSibling);
		a = a.parentNode;
	}
	return null;
}
function Ca(a) {
	if (null === a) return null;
	for (; a.lastChild; ) a = a.lastChild;
	return a;
}
function Da(a) {
	do a = Ba(a);
	while (null !== a && a.nodeType != Node.TEXT_NODE);
	return a;
}
function xa(a, b, c) {
	var d = b;
	a: if (0 != a) {
		if (b.nodeType != Node.TEXT_NODE) {
			b = 0 < c ? Ca(b.childNodes[c - 1]) : Ba(b);
			if (null === b) break a;
			b.nodeType != Node.TEXT_NODE && (b = Da(b));
			if (null === b) break a;
			c = b.nodeValue.length;
		}
		do {
			d = b;
			var e = Math.min(a, c);
			c -= e;
			a -= e;
			if (0 == a) break;
			b = Da(b);
			if (null === b) break a;
			c = b.nodeValue.length;
		} while (1);
	}
	return { node: d, offset: c, C: a };
}
function B(a) {
	m = n;
	n = a;
}
function Ea(a) {
	switch (a) {
		case 59:
		case 186:
			return ';:';
		case 61:
		case 187:
		case 171:
			return '=+';
		case 188:
			return ',<';
		case 189:
		case 173:
			return '-_';
		case 190:
			return '.>';
		case 191:
			return '/?';
		case 219:
			return '[{';
		case 220:
		case 163:
			return '\\|';
		case 221:
			return ']}';
		case 192:
		case 223:
			return '`~';
		case 222:
			return '\'"';
		case 8:
			return 'Backspace';
		case 9:
			return 'Tab';
		case 32:
			return 'Space';
		case 37:
			return 'Left';
		case 38:
			return 'Up';
		case 39:
			return 'Right';
		case 40:
			return 'Down';
		case 13:
			return 'Enter';
		default:
			return 48 > a
				? 'Special'
				: 90 >= a ? String.fromCharCode(a) : 112 <= a && 126 >= a ? 'F' + (a - 111) : 'Special';
	}
}
function Fa(a) {
	var b;
	229 == a.keyCode && 'Unidentified' !== a.keyIdentifier
		? (b = parseInt(a.keyIdentifier.slice(-3), 16))
		: (b = a.keyCode);
	Ga(a);
	if (18 == b || 17 == b || 16 == b || 20 == b || 224 == b || 91 == b || 92 == b || 93 == b || 14 == b)
		return 16 == b && BrowserDetect.IE && a.ctrlKey ? C(a) : !0;
	var c = a.getModifierState && a.getModifierState('AltGraph'),
		d = a.altKey || c ? 'Alt+' : '';
	a.ctrlKey && !a.altKey && (d = 'Ctrl+' + d);
	a.metaKey && (d = 'Meta+' + d);
	var e = Ea(b);
	b = {
		N: !0,
		code: b,
		o: a.code,
		c: e,
		shift: a.shiftKey,
		O: c || (a.altKey && a.ctrlKey),
		b: d,
		J: a.getModifierState ? a.getModifierState('CapsLock') : !1,
		name: d + e,
		u: a.key
	};
	B(b);
	return Ha(a, b);
}
function Ia(a) {
	var b = a.charCode;
	if (!a.ctrlKey && !a.altKey && !a.metaKey && ((32 < b && 65 > b) || (90 < b && 97 > b) || (122 < b && 127 > b))) {
		if (n.N && !n.B) return (n.B = !0), (n.g = String.fromCharCode(b)), Ha(a, n);
		b = { B: !0, g: String.fromCharCode(b), J: a.getModifierState ? a.getModifierState('CapsLock') : !1 };
		B(b);
		return Ha(a, b);
	}
}
function Ja(a) {
	if (17 == a.keyCode) B({ U: !0, code: a.keyCode, c: 'Ctrl', name: 'Ctrl', shift: a.shiftKey });
	else if (18 == a.keyCode) {
		if ((B({ U: !0, code: a.keyCode, c: 'Alt', name: 'Alt', shift: a.shiftKey }), ba)) return C(a);
	} else 20 == a.keyCode && Ga(a);
}
function Ka() {
	B({ V: !0 });
	0 < q.length && (q = []);
}
function La() {
	B({ V: !0 });
}
function Ma() {
	B({ aa: !0 });
	0 < q.length && (q = []);
}
function Na() {
	B({ ba: !0 });
	0 < q.length && (q = []);
}
function Oa() {
	Pa();
}
function Ha(a, b) {
	if (void 0 !== b.m) return !0;
	if ('Enter' == b.c && b.b == h && !b.shift)
		return (
			(D = b = !D),
			E && (E.checked = b),
			popup.showBriefPopup(E, D ? 'Shortcuts are ON' : 'Shortcuts are OFF', 'brief-popup', 1500, 1),
			0 < q.length && (q = []),
			C(a)
		);
	if (
		!(
			b.B ||
			b.shift ||
			b.b != ca ||
			('B' != b.c && 'I' != b.c && 'U' != b.c && 'Up' != b.c && 'Down' != b.c && 'Space' != b.c && 'E' != b.c) ||
			(D &&
				(keys[b.name] ||
					(b.b == h && keys['Mod+' + b.c]) ||
					(b.o && (keys['^' + b.o] || (b.b == h && keys['Mod+^' + b.o])))) &&
				(u ? u.selectionStart == u.selectionEnd : !x || x.isCollapsed))
		)
	) {
		switch (b.c) {
			case 'B':
				z('Bold');
				break;
			case 'I':
				z('Italic');
				break;
			case 'U':
				z('Underline');
				break;
			case 'Up':
				z('Superscript');
				break;
			case 'Down':
				z('Subscript');
				break;
			case 'Space':
			case 'E':
				z('RemoveFormat');
		}
		0 < q.length && (q = []);
		return C(a);
	}
	if ('Backspace' == b.name) return wa() ? C(a) : !0;
	if (D) {
		if (b.N && !b.B) {
			if (
				'Ctrl+' == ca &&
				!b.shift &&
				('Ctrl+C' == b.name || 'Ctrl+X' == b.name) &&
				(u ? u.selectionStart != u.selectionEnd : x && !x.isCollapsed)
			)
				return !0;
			var c = Qa(b, !0);
			null === c && (c = Qa(b, !1));
			if (null !== c) {
				var d = c.P;
				var e = c.X;
			}
		}
		if (d) {
			if (
				void 0 !== window.doNotOverrideChars &&
				1 == b.u.length &&
				-1 != doNotOverrideChars.indexOf(b.u) &&
				('Alt+' == b.b
					? !(
							('[' == b.u && 'BracketLeft' == b.o && '[{' == b.c) ||
							(']' == b.u && 'BracketRight' == b.o && ']}' == b.c) ||
							(('<' == b.u || '>' == b.u) && b.shift) ||
							('/' == b.u && 'KeyQ' != b.o)
						)
					: '' == b.b)
			)
				return 0 < q.length && (q = []), !0;
			if (d[1]) {
				if (0 < p)
					if (b.B) b.g != m.g && (p = 0);
					else if (b.name != m.name || b.shift != m.shift) p = 0;
				window.ga && 0 == p && (ha++, 1 == ha && ga('send', 'event', 'chars', '1 char shortcut used'));
				switch (ma(d, e, b.J)) {
					case 0:
						return !0;
					case 1:
						return Ra(b, a);
					case 2:
						return p++, C(a);
				}
			} else
				switch (((p = 0),
				window.ga && (ha++, 1 == ha && ga('send', 'event', 'chars', '1 char shortcut used')),
				ma(d, e, b.J))) {
					case 0:
						return !0;
					case 1:
						return Ra(b, a);
					case 2:
						return C(a);
				}
		}
	}
	if ((d = void 0 === d))
		a: if (!Sa || ('"' != b.g && "'" != b.g && '-' != b.g)) d = !1;
		else {
			D ? (d = window.$ && autoPrettyKeys[b.g]) || (d = ea[b.g]) : (d = ea[b.g]);
			if (b.g != m.g) {
				if ((e = '"' == b.g)) {
					var g = d[0].lower;
					e = d[1].lower;
					c = na(800);
					g = c.lastIndexOf(g);
					e = -1 == g ? !1 : g > c.lastIndexOf(e);
				}
				if (e) {
					ma(d[1], !1);
					Ta = 2;
					d = !0;
					break a;
				}
				Ta = 0;
			}
			0 < Ta && ((e = q.pop()), '' !== m.h ? qa(e) : pa(m.m.length));
			Ta >= d.length && (Ta = 0);
			ma(d[Ta], !1);
			Ta++;
			d = !0;
		}
	return d ? C(a) : Ra(b, a);
}
var H = 1;
function Ua(a) {
	switch (H) {
		case 1:
			'keydown' == a.type && Va(a) && a.defaultPrevented && (H = 2);
			break;
		case 2:
			if ('keypress' == a.type) H = 1;
			else if ('keydown' == a.type) {
				var b = !a.altKey && !a.ctrlKey && !a.metaKey && !a.getModifierState('AltGraph');
				'Escape' == a.code && b
					? (a.preventDefault(), (H = 3))
					: 'Backspace' == a.code && b
						? (a.preventDefault(), (H = 3), va())
						: 'Space' == a.code && b
							? (ra(' '), (H = 3))
							: 'Enter' == a.code && b
								? (a.preventDefault(), (H = 3), ra('\n'))
								: Va(a)
									? (H = 3)
									: (1 != a.key.length &&
											(2 != a.key.length ||
												-1 ==
													'^\u02c6`\u00b4\u00b8\u00a8~\u02c7\u02d8\u00b0\u02db\u02d9\u02dd\u00af\u0384\u0385'.indexOf(
														a.key[0]
													))) ||
										a.metaKey ||
										(a.getModifierState('AltGraph') ? !Wa(a) : a.ctrlKey || a.altKey) ||
										(H = a.defaultPrevented ? 3 : 4);
			}
			break;
		case 3:
			'keydown' == a.type ? ((H = 1), Ua(a)) : 'keypress' == a.type && a.preventDefault();
			break;
		case 4:
			'keydown' == a.type
				? ((H = 1), Ua(a))
				: 'keypress' == a.type &&
					(1 == a.key.length &&
					-1 !=
						'^\u02c6`\u00b4\u00b8\u00a8~\u02c7\u02d8\u00b0\u02db\u02d9\u02dd\u00af\u0384\u0385'.indexOf(a.key)
						? (a.preventDefault(), (H = 1))
						: 2 == a.key.length &&
							-1 !=
								'^\u02c6`\u00b4\u00b8\u00a8~\u02c7\u02d8\u00b0\u02db\u02d9\u02dd\u00af\u0384\u0385'.indexOf(
									a.key[0]
								)
							? (a.preventDefault(), ra(a.key[1]))
							: (1 == a.key.length && Xa(a.key)) ||
								(a.preventDefault(), ra(a.key.normalize('NFKD').charAt(0))));
	}
}
function Wa(a) {
	if (
		Xa(a.key) ||
		',' == a.key ||
		'.' == a.key ||
		'-' == a.key ||
		'=' == a.key ||
		'"' == a.key ||
		'_' == a.key ||
		':' == a.key
	)
		return !1;
	if (a.shiftKey)
		return a.key != a.key.toLowerCase() ||
		'\u00b9' == a.key ||
		'\u00a8' == a.key ||
		'\u00a6' == a.key ||
		'\u00a2' == a.key ||
		('\u00a3' == a.key && 'Digit4' == a.code) ||
		('\u00f7' == a.key && 'Equal' == a.code) ||
		('\u00a7' == a.key && 'KeyS' == a.code) ||
		('\u00b0' == a.key && 'Semicolon' == a.code)
			? !0
			: !1;
	switch (a.key) {
		case ';':
			if ('Comma' != a.code || 188 != a.keyCode) return !1;
			break;
		case "'":
			if ('KeyP' != a.code) return !1;
			break;
		case '/':
			if ('KeyQ' != a.code) return !1;
			break;
		case ')':
			if ('Digit0' != a.code) return !1;
			break;
		case '!':
			if ('Digit1' != a.code) return !1;
			break;
		case '\u00f1':
			if ('KeyN' != a.code) return !1;
			break;
		case '\u00f6':
			if ('KeyP' != a.code) return !1;
			break;
		case '\u00fc':
			if ('KeyY' != a.code) return !1;
			break;
		case '\u00e4':
			if ('KeyA' != a.code && 'KeyQ' != a.code) return !1;
			break;
		case '\u00f9':
			if ('KeyU' != a.code) return !1;
			break;
		case '&':
			if ('Digit7' != a.code && 'KeyC' != a.code) return !1;
			break;
		case '\u00e9':
			if ('Digit0' != a.code && 'KeyE' != a.code) return !1;
			break;
		case '(':
			if ('Digit9' != a.code) return !1;
			break;
		case '\u00a7':
			if ('Digit6' == a.code || 'Backquote' == a.code || 'Quote' == a.code) return !1;
		case '\u00e8':
			if ('KeyE' != a.code) return !1;
			break;
		case '\u00e7':
			if ('KeyC' != a.code && 'Comma' != a.code) return !1;
			break;
		case '\u00e0':
			if ('KeyA' != a.code) return !1;
	}
	return !0;
}
function Va(a) {
	return 'Dead' == a.key && !a.metaKey && (a.getModifierState('AltGraph') ? !a.shiftKey : !a.ctrlKey && !a.altKey);
}
function Xa(a) {
	a = a.charCodeAt(0);
	return (65 <= a && 90 >= a) || (97 <= a && 122 >= a) || (48 <= a && 57 >= a) || (913 <= a && 969 >= a);
}
function Qa(a, b) {
	if (b) {
		if (!a.o) return null;
		var c = '^' + a.o;
	} else c = a.c;
	a.shift
		? a.b == h
			? (b = keys['Mod+Shift+' + c])
				? (a = !1)
				: (b = keys['Mod+' + c])
					? (a = !0)
					: (b = keys[a.b + 'Shift+' + c]) ? (a = !1) : ((b = keys[a.b + c]), (a = !0))
			: (b = keys[a.b + 'Shift+' + c]) ? (a = !1) : ((b = keys[a.b + c]), (a = !0))
		: ((b = a.b == h ? keys['Mod+' + c] || keys[a.b + c] : keys[a.b + c]), (a = !1));
	return b ? { P: b, X: a } : null;
}
function C(a) {
	a.preventDefault();
	a.cancel = !0;
	oa();
	return !1;
}
function Ra(a, b) {
	if ((BLOCK_ALL_SHORTCUTS_WITH.MOD && 'Alt+' == h) || BLOCK_ALL_SHORTCUTS_WITH.ALT) {
		if ('Alt+' == a.b && !a.O && ((65 <= a.code && 90 >= a.code) || (48 <= a.code && 57 >= a.code))) return C(b);
	} else if (
		((BLOCK_ALL_SHORTCUTS_WITH.MOD && 'Ctrl+' == h) || BLOCK_ALL_SHORTCUTS_WITH.CTRL) &&
		'Ctrl+' == a.b &&
		((65 <= a.code && 90 >= a.code) || (48 <= a.code && 57 >= a.code)) &&
		((86 != a.code && 67 != a.code && 88 != a.code && 90 != a.code) || a.shift)
	)
		return C(b);
	0 < q.length && (q = []);
	return !0;
}
function qa(a) {
	pa(a.m.length);
	'' != a.h && ra(a.h);
}
function wa() {
	if (0 < q.length) {
		var a = q.pop();
		if ('' != a.h) return qa(a), !0;
		q = [];
	}
	return !1;
}
var Ta = 0,
	Sa = DEFAULT_AUTOPRETTY,
	Ya = null;
function Za() {
	Ya = document.getElementById('typeit_autoprettyselector');
	var a = getCookie('aPretty');
	'y' == a ? $a(!0) : 'n' == a ? $a(!1) : $a(DEFAULT_AUTOPRETTY);
	Ya && (Ya.onclick = ab);
}
function $a(a) {
	Sa = a;
	Ya && (Ya.checked = a);
}
function bb() {
	setCookie('aPretty', Sa ? 'y' : 'n', '/', 180);
}
function ab(a) {
	$a(a.currentTarget.checked);
	bb();
}
var db = {
	init: function() {
		var a = getCookie('mod');
		h = 'A' == a ? 'Alt+' : 'C' == a ? 'Ctrl+' : aa;
		ba = 'Alt+' == h;
	},
	save: function() {
		cb();
		setCookie('mod', h.charAt(0), '/', 180);
	}
};
window.modifierSetting = db;
window.modifierSetting.init = db.init;
var I = {
	state: 0,
	a: null,
	tracker: null,
	show: function() {
		if (0 != I.state) return !1;
		I.a = document.createElement('div');
		I.a.id = 'typeit_settings_window';
		I.a.style.position = 'fixed';
		I.a.style.visibility = 'hidden';
		I.a.style.left = I.a.style.top = '0px';
		var a = document.createElement('h3');
		a.appendChild(document.createTextNode('Settings'));
		I.a.appendChild(a);
		a = document.createElement('div');
		a.className = 'line';
		a.innerHTML = 'Font: ';
		var b = document.createElement('select');
		b.className = 'font-select';
		for (var c = 0; c < FONT_FACES.length; c++) {
			var d = document.createElement('option');
			d.textContent = FONT_FACES[c].name;
			d.style.fontFamily = FONT_FACES[c].stack || FONT_FACES[c].name;
			b.appendChild(d);
		}
		b.selectedIndex = eb;
		b.onchange = function() {
			var a = this.selectedIndex;
			eb = a;
			setCookie('fName-' + PREF_COOKIES_POSTFIX, FONT_FACES[a].name, '/', 180);
			fb();
		};
		a.appendChild(b);
		var e = document.createElement('input');
		e.className = 'fontsize-readout';
		e.disabled = 'true';
		e.value = J + 'px';
		a.appendChild(e);
		b = document.createElement('button');
		b.type = 'button';
		b.className = 'font-minus';
		b.title = 'decrease font size';
		b.textContent = 'A';
		b.onclick = b.ontouchstart = function() {
			e.value = gb(J - 1) + 'px';
		};
		a.appendChild(b);
		b = document.createElement('button');
		b.type = 'button';
		b.className = 'font-plus';
		b.title = 'increase font size';
		b.textContent = 'A';
		b.onclick = b.ontouchstart = function() {
			e.value = gb(J + 1) + 'px';
		};
		b.ontouchend = function(a) {
			a.preventDefault();
		};
		a.appendChild(b);
		I.a.appendChild(a);
		a = document.createElement('div');
		a.className = 'line';
		a.innerHTML =
			'<div class=selector-line><div class=selector-container><input type=checkbox id=typeit_autopretty_selector></div><label for=typeit_autopretty_selector>Use curly quotes and long dashes</label></div><div class=desc>Auto-convert straight quotes and apostrophe into the proper quotes for the current language (or into English-style quotes if keyboard shortcuts are disabled). You can also press the <kbd>-</kbd> key repeatedly to type \u2013 and \u2014.</div>';
		b = a.querySelector('#typeit_autopretty_selector');
		b.onclick = function() {
			$a(this.checked);
			bb();
		};
		b.checked = Sa;
		I.a.appendChild(a);
		a = document.createElement('div');
		a.className = 'line';
		a.innerHTML =
			'<div class=heading>Which base key would you like to use for keyboard shortcuts?</div><div class=selector-line><input type=radio name="hotkey" id=typeit_hotkey_selector_alt> <label for=typeit_hotkey_selector_alt><kbd class=noreplace>Alt</kbd></label> <input type=radio name="hotkey" id=typeit_hotkey_selector_ctrl> <label for=typeit_hotkey_selector_ctrl><kbd class=noreplace>Ctrl</kbd></label></div><div class=desc style="margin-top: 6px">The recommended hotkey for your browser/OS combination is <kbd class=noreplace>' +
			aa.slice(0, -1) +
			'</kbd>. Changing it may cause issues with certain shortcuts.</div>';
		var g = a.querySelector('#typeit_hotkey_selector_alt'),
			k = a.querySelector('#typeit_hotkey_selector_ctrl');
		'Alt+' == h
			? (a.querySelector('#typeit_hotkey_selector_alt').checked = !0)
			: 'Ctrl+' == h && (a.querySelector('#typeit_hotkey_selector_ctrl').checked = !0);
		g.onchange = k.onchange = function() {
			g.checked ? (h = 'Alt+') : k.checked && (h = 'Ctrl+');
			db.save();
		};
		I.a.appendChild(a);
		HIGHLIGHT_FREQUENT_BUTTONS &&
			((a = document.createElement('div')),
			(a.className = 'line'),
			(b = document.createElement('a')),
			(b.tabIndex = 0),
			b.appendChild(document.createTextNode('Clear highlights on buttons')),
			(b.onclick = function() {
				for (var a in K) {
					var b = K[a];
					b.i = 0;
					b.interval = hb;
					for (var c = (b.w = 0); c < b.s.length; c++) ib(b.s[c], b.i);
				}
				window.localStorage && localStorage.removeItem('highlightStatus-' + editorID);
			}),
			a.appendChild(b),
			I.a.appendChild(a));
		a = document.createElement('div');
		a.className = 'close-message';
		a.appendChild(document.createTextNode('click outside window to close'));
		I.a.appendChild(a);
		document.body.appendChild(I.a);
		a = I.a.getBoundingClientRect();
		b = getViewportHeight();
		c = getViewportWidth();
		I.a.style.left = (0 < c - a.width ? Math.round((c - a.width) / 2) : 0) + 'px';
		I.a.style.top = (0 < b - a.height ? Math.round((b - a.height) / 2) : 0) + 'px';
		I.tracker = new DocumentClickTracker();
		I.tracker.start(I.onDocumentClick);
		I.state = -1;
		new Transition('fade', 'in', [ I.a ], '0.1s', 0, function() {
			I.state = 1;
		});
	},
	S: function() {
		if (1 != I.state) return !1;
		I.state = -1;
		new Transition('fade', 'out', [ I.a ], '0.1s', 2, function() {
			I.a = null;
			I.state = 0;
		});
		I.tracker.stop();
	},
	onDocumentClick: function(a) {
		I.a.contains(a) || I.S();
	}
};
window.settingsWindow = I;
var eb = null,
	J = 0;
function jb() {
	var a,
		b = !1;
	if ((a = getCookie('fName-' + PREF_COOKIES_POSTFIX)))
		for (var c = 0; c < FONT_FACES.length; c++)
			if (FONT_FACES[c].name == a) {
				b = !0;
				eb = c;
				break;
			}
	if (!b)
		for (c = 0; c < FONT_FACES.length; c++)
			if (FONT_FACES[c].default) {
				eb = c;
				break;
			}
	fb();
	a = getCookie('fSize-' + PREF_COOKIES_POSTFIX);
	null === a ? (J = DEFAULT_FONT_SIZE) : ((J = parseInt(a)), 12 > J && (J = DEFAULT_FONT_SIZE));
	ja.fontSize = J + 'px';
}
function fb() {
	var a = FONT_FACES[eb];
	ja.fontFamily = a.stack ? a.stack : a.name;
	ja.lineHeight = a.lineHeight ? a.lineHeight : '';
}
function gb(a) {
	12 > a && (a = 12);
	J = a;
	setCookie('fSize-' + PREF_COOKIES_POSTFIX, J, '/', 180);
	ja.fontSize = J + 'px';
	return a;
}
var E = null,
	D = !0;
function kb() {
	var a = E.checked;
	D = a;
	E && (E.checked = a);
	r();
}
var lb = null;
function mb() {
	var a = BrowserDetect.supportsClipboardWriting
		? document.getElementsByName('SelectAll')
		: document.getElementsByName('CopyAll');
	a[0] && (a[0].style.display = 'none');
	if (u) document.getElementById('typeit_formattingbuttons').style.display = 'none';
	else {
		a = document.querySelectorAll('#typeit_formattingbuttons button');
		for (var b = 0; b < a.length; b++) a[b].addEventListener('click', nb, !1);
	}
	a = document.querySelectorAll('#typeit_toolbar_edit > button');
	for (b = 0; b < a.length; b++) a[b].onclick = nb;
	if (BrowserDetect.MacOS || BrowserDetect.iOS) {
		if ((a = document.getElementById('typeit_removeformat'))) a.title = a.title.replace('Ctrl+Space', '\u2318E');
		a = document.querySelectorAll('#typeit_toolbar_edit button');
		for (b = 0; b < a.length; b++) a[b].title = a[b].title.replace(/Ctrl\+/g, '\u2318');
	}
}
function nb(a) {
	0 < q.length && (q = []);
	'CopyAll' == a.currentTarget.name
		? ((lb = Date.now()),
			ob() ||
				z('CopyAll') ||
				popup.showBriefPopup(a.currentTarget, 'Error: cannot copy to clipboard!', 'brief-popup error', 1500))
		: z(a.currentTarget.name);
	BrowserDetect.Firefox && r();
}
var pb = !1,
	qb = !1,
	rb = null;
function sb() {
	rb = document.getElementById('typeit_capslock_indicator');
	if (!rb || DEVICE_PRIMARILY_TOUCH) Ga = function() {};
}
function Ga(a) {
	if (!a.getModifierState) return !1;
	pb !== a.getModifierState('CapsLock') &&
		(pb ? ((pb = !1), rb.classList.remove('on')) : ((pb = !0), rb.classList.add('on')), tb());
}
function ub(a) {
	window.removeEventListener('mousemove', ub, !1);
	v && v.removeEventListener('mousemove', ub, !1);
	qb = !1;
	return Ga(a);
}
function Pa() {
	qb || (window.addEventListener('mousemove', ub, !1), v && v.addEventListener('mousemove', ub, !1), (qb = !0));
}
var vb = !1,
	wb = null;
function xb() {
	var a = document.getElementsByClassName('typeit-capslock');
	if ((wb = a))
		for (var b = 0; b < a.length; b++)
			a[b].onclick = function() {
				yb(!vb);
			};
}
function yb(a) {
	vb = a;
	for (var b = 0; b < wb.length; b++) !0 === a ? wb[b].classList.add('on') : wb[b].classList.remove('on');
	!0 === a ? y.addEventListener('input', zb, !1) : y.removeEventListener('input', zb, !1);
	tb();
}
function zb() {
	yb(!1);
}
function Ab() {
	var a = document.getElementsByClassName('typeit-backspace');
	if (a) for (var b = 0; b < a.length; b++) a[b].onclick = va;
}
function Bb() {
	Cb = 0;
	hb = 35;
	Db = 400;
	Eb = 2;
	K = {};
	for (var a = 0; a < L.length; a++) {
		var b = L[a];
		void 0 !== b.name &&
			(void 0 === K[b.name] ? (K[b.name] = { s: [ b ], i: 0, interval: hb, w: 0 }) : K[b.name].s.push(b));
	}
	if (window.localStorage) var c = localStorage.getItem('highlightStatus-' + editorID);
	if (null !== c)
		for (a = c.split('|'), b = 0; b + 2 < a.length; b += 3)
			if ((c = K[a[b]])) {
				var d = parseInt(a[b + 1]) / 100;
				1 >= d && 0 < d && (c.i = d);
				d = parseInt(a[b + 2]);
				0 < d && (c.interval = Math.min(d, Db));
				c.w = Cb + Math.round(c.interval * c.i);
			}
	for (var e in K) if (((c = K[e]), 0 < c.i)) for (b = 0; b < c.s.length; b++) ib(c.s[b], c.i);
}
function Fb(a) {
	void 0 !== a.name &&
		(Cb++,
		(a = K[a.name]),
		Cb <= a.w
			? ((a.interval = Math.round(a.interval * (1 + (1 - (a.w - Cb) / a.interval) * (Eb - 1)))),
				a.interval > Db && (a.interval = Db))
			: (a.interval = hb),
		(a.w = Cb + a.interval),
		(a.i = 1));
	for (var b in K)
		if (((a = K[b]), 0 < a.i)) {
			a.i = (a.w - Cb) / a.interval;
			for (var c = 0; c < a.s.length; c++) ib(a.s[c], a.i);
		}
}
function ib(a, b) {
	a.style.backgroundColor =
		'rgba(' +
		BUTTON_HIGHLIGHT_BG_COLOR[0] +
		',' +
		BUTTON_HIGHLIGHT_BG_COLOR[1] +
		',' +
		BUTTON_HIGHLIGHT_BG_COLOR[2] +
		',' +
		(Math.sqrt(b) / 3).toFixed(2) +
		')';
}
var Cb,
	hb,
	Db,
	Eb,
	K,
	L = null,
	M = null,
	Gb = 0,
	Hb = !1,
	Ib = [ 'bas', 'ext', 'ext2' ],
	N = void 0;
function Jb() {
	M = document.getElementById('typeit_buttons');
	if (!M) throw "TypeIt error: Could not locate element with id = 'typeit_buttons'!";
	Kb = M.querySelectorAll('.bas, .ext, .ext2');
	Lb = M.querySelectorAll('.br-bas, .br-ext, .br-ext2');
	P = [];
	P[0] = { items: M.querySelectorAll('.bas'), v: M.querySelectorAll('br.br-bas') };
	var a = M.querySelectorAll('.ext');
	0 < a.length &&
		(P[1] = {
			items: a,
			H: M.querySelectorAll('.ext:not(.bas)'),
			L: M.querySelectorAll('.bas:not(.ext)'),
			v: M.querySelectorAll('br.br-ext')
		});
	a = M.querySelectorAll('.ext2');
	0 < a.length &&
		(P[2] = {
			items: a,
			H: M.querySelectorAll('.ext2:not(.ext)'),
			L: M.querySelectorAll('.ext:not(.ext2)'),
			v: M.querySelectorAll('br.br-ext2')
		});
	Q = M.querySelectorAll('.show-button');
	S = M.querySelectorAll('.hide-button');
	if (1 < P.length && 0 < Q.length && 0 < S.length) {
		a = localStorage.getItem('hiddenButtons-' + editorID);
		var b = parseInt(a);
		void 0 === P[b]
			? ((N = null === a && HIDDEN_BUTTONS_SHOWN_BY_DEFAULT && !TINY_SCREEN ? 1 : 0),
				localStorage.setItem('hiddenButtons-' + editorID, N))
			: (N = b);
	}
	L = M.querySelectorAll('button[name]');
	for (a = 0; a < L.length; a++)
		if (((b = L[a]), chars[b.name]))
			if (Mb(chars[b.name].exclude)) b.style.display = 'none';
			else {
				if (null == b.firstChild) {
					var c =
						chars[b.name].displayOnWin && BrowserDetect.Windows
							? chars[b.name].displayOnWin
							: chars[b.name].display ? chars[b.name].display : chars[b.name].lower;
					'italic' == chars[b.name].format
						? (b.innerHTML = '<i>' + c + '</i>')
						: 'superscript' == chars[b.name].format
							? (b.innerHTML = '<sup>' + c + '</sup>')
							: 'strikethrough' == chars[b.name].format
								? (b.innerHTML = '<s>' + c + '</s>')
								: (b.innerHTML = c);
				}
				b.onclick = Nb;
			}
	for (var d in keys)
		for (a = keys[d].length, b = 0; b < a; b++)
			if (void 0 === keys[d][b]) alert('keys[' + d + '] refers to undefined char at position ' + b + '!');
			else if (Mb(keys[d][b].exclude))
				if (1 < a) keys[d].splice(b, 1), b--, a--;
				else {
					delete keys[d];
					break;
				}
	Ob = document.querySelectorAll('#typeit_buttons .tiny-screen button.start-group');
	if (void 0 !== N) {
		for (d = 0; d < Kb.length; d++) Kb[d].style.display = Kb[d].classList.contains(Ib[N]) ? '' : 'none';
		for (d = 0; d < Lb.length; d++) Lb[d].style.display = Lb[d].classList.contains('br-' + Ib[N]) ? '' : 'none';
		if (0 == N)
			for (S.setStyle('display', 'none'), d = 0; d < Ob.length; d++)
				if (Pb(Ob[d]))
					for (a = Ob[d].nextSibling; a && 'BUTTON' == a.nodeName && !a.classList.contains('start-group'); ) {
						if (!Pb(a)) {
							a.classList.add('start-group');
							a.setAttribute('data-fake-start-group', '');
							break;
						}
						a = a.nextSibling;
					}
		N == P.length - 1 && Q.setStyle('display', 'none');
		for (d = 0; d < Q.length; d++) Q[d].onclick = Qb;
		for (d = 0; d < S.length; d++) S[d].onclick = Rb;
	}
}
function Qb() {
	if (void 0 === N || N >= P.length - 1) return !1;
	N++;
	N == P.length - 1 && Q.setStyle('display', 'none');
	localStorage.setItem('hiddenButtons-' + editorID, N);
	new Transition('fade', 'out', P[N].L, '0.4s', 1, function() {
		P[N - 1].v.setStyle('display', 'none');
		P[N].v.setStyle('display', '');
		new Transition('slide+fade', 'in', P[N].H, '0.4s', 0, function() {
			if (1 == N) {
				S.setStyle('visibility', 'hidden');
				S.setStyle('display', '');
				for (
					var a = document.querySelectorAll('#typeit_buttons .tiny-screen button[data-fake-start-group]'),
						b = 0;
					b < a.length;
					b++
				)
					a[b].classList.remove('start-group'), a[b].removeAttribute('data-fake-start-group');
				new Transition('fade', 'in', S, '0.2s');
			}
		});
	});
}
function Rb() {
	if (void 0 === N || 0 == N) return !1;
	N--;
	0 == N && S.setStyle('display', 'none');
	localStorage.setItem('hiddenButtons-' + editorID, N);
	new Transition('slide+fade', 'out', P[N + 1].H, '0.4s', 1, function() {
		P[N + 1].v.setStyle('display', 'none');
		P[N].v.setStyle('display', '');
		new Transition('fade', 'in', P[N + 1].L, '0.4s', 0, function() {
			N == P.length - 2 &&
				(Q.setStyle('visibility', 'hidden'),
				Q.setStyle('display', ''),
				new Transition('fade', 'in', Q, '0.2s'));
		});
	});
}
function Pb(a) {
	return (
		(0 == N && a.classList.contains('ext')) ||
		(!window.DEVICE_PRIMARILY_TOUCH && a.classList.contains('touch-specific'))
	);
}
function Mb(a) {
	if (!a) return !1;
	for (var b = 0; b < a.length; b++) {
		var c = a[b];
		if (c.name == BrowserDetect.browser) {
			if (!c.versions) return !0;
			for (var d = 0; d < c.versions.length; d++) if (c.versions[d] == BrowserDetect.majorVersion) return !0;
		}
	}
	return !1;
}
function tb() {
	var a = pb || vb;
	if (1 == a)
		for (a = 0; a < L.length; a++) {
			var b = L[a];
			chars[b.name].upper && (b.M || (b.M = b.innerHTML), (b.innerHTML = chars[b.name].upper));
		}
	else if (0 == a) for (a = 0; a < L.length; a++) (b = L[a]), b.M && (b.innerHTML = b.M);
}
function Nb(a) {
	var b = a.currentTarget;
	Ga(a);
	if (0 === a.button)
		if (
			('Alt+' == h && (a.altKey || (a.getModifierState && a.getModifierState('AltGraph')))) ||
			('Ctrl+' == h && a.ctrlKey && !a.altKey)
		) {
			if (BrowserDetect.supportsClipboardWriting && chars[b.name].lower) {
				Hb || (window.ga && ga('send', 'event', 'chars', 'single char copied to clipboard'), (Hb = !0));
				var c = document.createElement('textarea');
				var d =
					((d = (a.getModifierState ? a.getModifierState('CapsLock') : !1) || vb)
						? !a.shiftKey
						: a.shiftKey) && chars[b.name].upper
						? chars[b.name].upper
						: chars[b.name].lower;
				c.value = d;
				c.style.position = 'fixed';
				c.style.left = '0px';
				c.style.top = '0px';
				c.style.width = '1px';
				c.style.height = '1px';
				c.style.borderStyle = 'none';
				c.style.opacity = '0.01';
				c.style.background = 'transparent';
				c.style.color = 'white';
				document.body.appendChild(c);
				c.select();
				try {
					var e = document.execCommand('copy', !1, !1);
				} catch (k) {
					e = !1;
				}
				document.body.removeChild(c);
				if (e) {
					r();
					var g = b.innerHTML;
					if (!b.classList.contains('copied')) {
						b.classList.add('copied');
						for (
							b.parentNode.classList.contains('keyblock') && b.parentNode.classList.add('copied');
							b.firstChild;

						)
							b.removeChild(b.firstChild);
						b.appendChild(document.createTextNode(d));
						window.setTimeout(function() {
							b.classList.remove('copied');
							b.parentNode.classList.contains('keyblock') && b.parentNode.classList.remove('copied');
							b.innerHTML = g;
						}, 1500);
					}
					popup.showBriefPopup(b, '<h5>COPIED TO CLIPBOARD</h5>', 'brief-popup copied short', 1500);
				} else
					popup.showBriefPopup(
						b,
						'<h5>ERROR COPYING TO CLIPBOARD!</h5>',
						'brief-popup copied short error',
						1500
					);
				a.preventDefault();
			}
		} else
			B({ Y: !0 }),
				(d = a.getModifierState ? a.getModifierState('CapsLock') : !1),
				ma(chars[b.name], a.shiftKey, d || vb, !0),
				HIGHLIGHT_FREQUENT_BUTTONS && Fb(b),
				Gb++,
				window.ga &&
					(1 == Gb
						? ga('send', 'event', 'chars', '1 char button pressed')
						: 3 == Gb
							? ga('send', 'event', 'chars', '3 char buttons pressed')
							: 5 == Gb
								? ga('send', 'event', 'chars', '5 char buttons pressed')
								: 7 == Gb &&
									1 >= ha &&
									!DEVICE_PRIMARILY_TOUCH &&
									CARET_SHORTCUT_TIP &&
									(ga('send', 'event', 'shortcut-reminder', 'shown'),
									T.show('shcuts', CARET_SHORTCUT_TIP, !1, [ window.F, window.A ], function(a) {
										a.T() && ga('send', 'event', 'shortcut-reminder', 'dont-show-again');
									}))),
				BrowserDetect.Firefox && r();
}
var Kb, Lb, P, Q, S, Ob;
function cb() {
	if ('Ctrl+' == h)
		var a = 'Alt',
			b = 'Ctrl';
	else if ('Alt+' == h) (a = 'Ctrl'), (b = 'Alt');
	else return;
	for (var c = document.getElementsByTagName('kbd'), d = 0; d < c.length; d++)
		if (!c[d].classList.contains('clipboard') && !c[d].classList.contains('noreplace')) {
			var e = c[d].firstChild;
			e.nodeType == Node.TEXT_NODE && (e.nodeValue = e.nodeValue.replace(a, b));
		}
	c = document.querySelectorAll('span.plain-kbd');
	for (d = 0; d < c.length; d++)
		(e = c[d].firstChild), e.nodeType == Node.TEXT_NODE && (e.nodeValue = e.nodeValue.replace(a, b));
	c = document.querySelectorAll('#typeit_buttons button');
	for (d = 0; d < c.length; d++)
		c[d].classList.contains('fixed-modifier') || (c[d].title = c[d].title.replace(new RegExp(a, 'g'), b));
	c = document.querySelectorAll('.popuphelp');
	for (d = 0; d < c.length; d++)
		(e = c[d].getAttribute('data-popup_title')) &&
			c[d].setAttribute(
				'data-popup_title',
				e.replace(new RegExp('(<kbd>[^<]*)' + a + '([^<]*</)', 'g'), '$1' + b + '$2')
			);
	CARET_SHORTCUT_TIP &&
		(CARET_SHORTCUT_TIP = CARET_SHORTCUT_TIP.replace(
			new RegExp('(<kbd>[^<]*)' + a + '([^<]*</)', 'g'),
			'$1' + b + '$2'
		));
}
window.setupModifierDependentUI = cb;
function Sb(a, b, c) {
	function d(g) {
		g.nodeType == Node.ELEMENT_NODE && g != b && (e += 1);
		if (!c && g == a) return !0;
		if (g.nodeType == Node.TEXT_NODE) e += g.nodeValue.length;
		else if (g.nodeType == Node.ELEMENT_NODE) {
			for (var k = g.firstChild; k; ) {
				if (d(k)) return !0;
				k = k.nextSibling;
			}
			g != b && (e += 1);
		}
		return c && g == a ? !0 : !1;
	}
	void 0 === c && (c = !1);
	var e = 0;
	return d(b) ? e : 0;
}
function Tb(a, b) {
	if (a.nodeType == Node.TEXT_NODE) return b;
	if (a.nodeType == Node.ELEMENT_NODE) {
		if (0 == b) return 0;
		if (a.childNodes[b - 1]) return Sb(a.childNodes[b - 1], a, !0);
	}
	return 0;
}
var W = null,
	X = null,
	Y = null;
function Ub() {
	window.f.setItem('textBoxContents', W);
	window.f.setItem('textBoxStartPos', X);
	window.f.setItem('textBoxEndPos', Y);
	window.localStorage.setItem('textBoxContents', W);
	window.localStorage.setItem('textBoxTimestamp', Date.now().toString());
}
function Vb() {
	W = X = Y = null;
	if (null !== window.f.getItem('textBoxContents')) {
		W = window.f.getItem('textBoxContents');
		var a = parseInt(window.f.getItem('textBoxStartPos'));
		X = 0 < a ? a : 0;
		a = parseInt(window.f.getItem('textBoxEndPos'));
		Y = 0 < a ? a : 0;
		window.localStorage.setItem('textBoxContents', W);
		window.localStorage.setItem('textBoxTimestamp', Date.now().toString());
	} else
		null !== window.localStorage.getItem('textBoxContents') &&
			(parseInt(window.localStorage.getItem('textBoxTimestamp')) > Date.now() - 9e5
				? ((W = window.localStorage.getItem('textBoxContents')),
					(X = Y = 0),
					window.f.setItem('textBoxContents', W),
					window.f.setItem('textBoxStartPos', X),
					window.f.setItem('textBoxEndPos', Y))
				: (window.localStorage.removeItem('textBoxContents'),
					window.localStorage.removeItem('textBoxTimestamp')));
	return null !== W;
}
function Wb() {
	window.f.setItem('textBoxContents', '');
	window.f.removeItem('textBoxStartPos');
	window.f.removeItem('textBoxEndPos');
	window.localStorage.removeItem('textBoxContents');
	window.localStorage.removeItem('textBoxTimestamp');
}
function la() {
	if (ob()) Wb();
	else {
		if (x) {
			var a = x;
			if (null !== a.anchorNode) {
				var b = Sb(a.anchorNode, w.body);
				X = b + Tb(a.anchorNode, a.anchorOffset);
				a.focusNode == a.anchorNode
					? a.focusOffset == a.anchorOffset ? (Y = X) : (Y = b + Tb(a.focusNode, a.focusOffset))
					: (Y = Sb(a.focusNode, w.body) + Tb(a.focusNode, a.focusOffset));
			} else X = Y = 0;
		} else X = Y = 0;
		W = w.body.innerHTML;
		Ub();
	}
}
function Xb() {
	ob() ? Wb() : ((X = u.selectionStart), (Y = u.selectionEnd), (W = u.value), Ub());
}
function Yb() {
	if (!Vb()) return ia(), !1;
	w.body.innerHTML = W;
	if (x && x.getRangeAt && (ia(), null !== X && null !== Y)) {
		var a = Zb(X);
		var b = X == Y ? a : Zb(Y);
		if (null !== a && null !== b) {
			if (x.setBaseAndExtent) x.setBaseAndExtent(a.node, a.offset, b.node, b.offset);
			else if (x.extend) x.collapse(a.node, a.offset), x.extend(b.node, b.offset);
			else {
				var c = document.createRange();
				c.setStart(a.node, a.offset);
				c.setEnd(b.node, b.offset);
				x.removeAllRanges();
				x.addRange(c);
			}
			c = x.getRangeAt(0);
			if (c.getBoundingClientRect) {
				var d = Y >= X ? c.getBoundingClientRect().bottom : c.getBoundingClientRect().top;
				0 == d
					? ((c = c.cloneRange()),
						Aa(c),
						(d = v.pageYOffset + (Y >= X ? c.getBoundingClientRect().bottom : c.getBoundingClientRect().top)))
					: (d += v.pageYOffset);
			}
		}
	}
	v.scroll(0, Math.round(d - 0.4 * t.clientHeight));
	ia();
}
function $b() {
	if (!Vb()) return ia(), !1;
	u.value = W;
	u.selectionStart = X;
	u.selectionEnd = Y;
	r();
}
function Zb(a) {
	function b(k) {
		c >= a && k != d && alert('Searched-for position reached at node entry');
		if (k.nodeType == Node.ELEMENT_NODE && (k != d && (c += 1), c == a)) return (e = k), (g = 0), !0;
		if (k.nodeType == Node.TEXT_NODE) {
			if (c + k.nodeValue.length >= a) return (e = k), (g = a - c), !0;
			c += k.nodeValue.length;
		} else if (k.nodeType == Node.ELEMENT_NODE) {
			for (var O = k.childNodes, U = 0; U < O.length; U++) {
				if (b(O[U])) return !0;
				if (c == a) return (e = k), (g = U + 1), !0;
			}
			k != d && (c += 1);
		}
		return !1;
	}
	var c = 0,
		d = w.body,
		e = null,
		g = null;
	return b(d) && null !== e && null !== g ? { node: e, offset: g } : null;
}
function ac(a) {
	for (var b = 0; b < a.length; b++) {
		var c = a.charAt(b);
		if (
			'\x00' != c &&
			' ' != c &&
			'\u00a0' != c &&
			'\n' != c &&
			'\r' != c &&
			'\t' != c &&
			'\b' != c &&
			'\f' != c &&
			'\v' != c
		)
			return !0;
	}
	return !1;
}
function bc(a) {
	if (a.nodeType == Node.TEXT_NODE) return ac(a.nodeValue) ? !0 : !1;
	if (a.nodeType == Node.ELEMENT_NODE)
		for (a = a.firstChild; a; ) {
			if (bc(a)) return !0;
			a = a.nextSibling;
		}
	return !1;
}
function ob() {
	return u ? !ac(u.value) : !bc(w.body);
}
function cc() {
	if (HIGHLIGHT_FREQUENT_BUTTONS) {
		var a = '',
			b;
		for (b in K) {
			var c = K[b];
			a += b + '|' + Math.round(100 * c.i) + '|' + c.interval + '|';
		}
		window.localStorage && localStorage.setItem('highlightStatus-' + editorID, a);
	}
	la();
}
var dc = null;
function ec() {
	if (!BrowserDetect.IE) {
		if (u) {
			var a = u.selectionEnd - u.selectionStart;
			var b = u.value.length;
			var c = u.value.slice(u.selectionStart, u.selectionEnd);
		} else {
			c = x.toString();
			a = c.length;
			if (0 == x.rangeCount) return;
			var d = x.getRangeAt(0).cloneRange();
			if (!d.selectNodeContents) return;
			d.selectNodeContents(w.body);
			b = d.toString().length;
		}
		d =
			window.editorWithAppSupport &&
			'Windows' == BrowserDetect.OS &&
			'PL' != window.COUNTRY &&
			!window.TINY_SCREEN &&
			window.MEDRECT_B
				? 2
				: 1;
		if (c != dc) {
			0 < a &&
				a > 0.97 * b - 5 &&
				(20 > a ? (b = a) : ((b = 10 * Math.floor(a / 10)), (b = b + ' - ' + (b + 9))),
				window.ga &&
					(ga('send', 'event', 'editor', 'whole text copied', b + ' chars copied'),
					void 0 !== P[1] && ga('send', 'event', 'editor ' + window.editorID, 'extra buttons shown', N)));
			if (('ipa-full' == window.editorID || 'math' == window.editorID) && 0 < a && window.ga) {
				b = c;
				Z = {};
				fc = {};
				for (var e = 1; 3 >= e; e++) fc[e] = {};
				for (var g in chars)
					-1 === g.slice(0, 7).indexOf('DEFAULT') &&
						((Z[g] = 0), chars[g].lower && (fc[chars[g].lower.length][g] = !0));
				e = 0;
				a: for (; e < b.length; ) {
					for (var k = Math.min(3, b.length - e); 1 <= k; k--) {
						var O = b.slice(e, e + k);
						for (g in fc[k])
							if (chars[g].lower === O) {
								Z[g] += 1;
								e += k;
								continue a;
							}
						for (g in fc[k])
							if (chars[g].upper === O) {
								Z[g] += 1;
								e += k;
								continue a;
							}
					}
					e++;
				}
				g = Object.keys(Z).length;
				b = [];
				for (e = 0; 8 > e; e++) {
					do k = Math.floor(Math.random() * g);
					while (-1 != b.indexOf(k));
					b.push(k);
					k = Object.keys(Z)[k];
					O = Z[k];
					0 < O && ga('send', 'event', 'editor ' + window.editorID, 'character used', k, O);
				}
			}
			dc = c;
		}
		if (0 < d && 0 < a) {
			document.getElementById('typeit_copyall') && lb > Date.now() - 200
				? DEVICE_PRIMARILY_TOUCH
					? (c = t.getBoundingClientRect())
					: ((c = document.getElementById('typeit_copyall').getBoundingClientRect()),
						0 == c.right && 0 == c.left && (c = gc()))
				: (c = gc());
			lb = null;
			if (2 == d) {
				var U =
					'<h5>COPIED TO CLIPBOARD</h5><div>Tired of copying text around?<br><a href="' +
					wwwURLBase +
					'app/?lang=' +
					editorID +
					'&amp;src=copied,' +
					editorID +
					'">Get the PC app</a> to type ' +
					('ipa' == editorID || 'ipa-full' == editorID
						? 'IPA symbols'
						: 'math' == editorID ? 'math symbols' : editorID_Upper + ' characters') +
					' directly into your documents and messages.</div>';
				var G = 'long';
			} else 1 == d && ((U = '<h5>COPIED TO CLIPBOARD</h5>'), (G = 'short'));
			popup.showHelpPopup(c, U, 'copied ' + G, !1);
			window.ga && window.ga('send', 'event', 'editor', 'copy popup shown', 2 == d ? 'long' : 'short');
		}
	}
}
var Z = null,
	fc = null;
function gc() {
	if (u) return u.getBoundingClientRect();
	if (0 == x.rangeCount) return null;
	var a = x.getRangeAt(0);
	if (a.getBoundingClientRect) {
		var b = a.getBoundingClientRect();
		0 == b.bottom && ((a = a.cloneRange()), Aa(a), (b = a.getBoundingClientRect()));
	} else return null;
	a = t.getBoundingClientRect();
	return {
		left: Math.max(a.left, Math.min(a.right, a.left + b.left)),
		right: Math.max(a.left, Math.min(a.right, a.left + b.right)),
		top: Math.max(a.top, Math.min(a.bottom, a.top + b.top)),
		bottom: Math.max(a.top, Math.min(a.bottom, a.top + b.bottom))
	};
}
var T = {
	I: null,
	D: null,
	G: null,
	K: null,
	show: function(a, b, c, d, e) {
		if (getCookie('dsa-' + a)) return !1;
		var g = gc();
		if (!g) return !1;
		popup.displayPopup(
			g,
			b +
				"<input type=checkbox id=dont-show-again-checkbox><label for=dont-show-again-checkbox>Don\u2019t show this again</label><div class=message style='text-align: center'>Esc or click outside to close</div>",
			'popup'
		);
		popup.sourceElement = popup.SELECTION_TYPE;
		popup.closeIfPopupClicked = c;
		popup.tracker = new DocumentClickTracker();
		popup.tracker.start(T.onDocumentClick, 'esc');
		void 0 !== e && (T.I = e);
		T.D = d;
		T.G = a;
		T.K = document.getElementById('dont-show-again-checkbox');
		T.K.onclick = function() {
			T.W(this);
		};
	},
	onDocumentClick: function(a) {
		if (T.D) for (var b = 0; b < T.D.length; b++) if (T.D[b].contains(a)) return !1;
		popup.onDocumentClick(a) && T.I && T.I(T);
		return !0;
	},
	T: function() {
		return T.K.checked;
	},
	W: function(a) {
		if (!T.G) return !1;
		a.checked ? setCookie('dsa-' + T.G, 'y', '/', 180, !0) : deleteCookie('dsa-' + T.G, '/', !0);
	}
};
document.addEventListener('DOMContentLoaded', hc, !1);
function hc() {
	if (!da) {
		ka = document.getElementById('typeit_storage');
		if (null === ka) throw "TypeIt error: Could not locate element with id = 'typeit_storage'!";
		if (gIframeHasLoaded) {
			t = t || document.getElementById('typeit_textbox');
			if (null === t) throw "TypeIt error: Could not locate element with id = 'typeit_textbox'!";
			window.f = ka.contentWindow.sessionStorage;
			if ('IFRAME' == t.nodeName) {
				u = null;
				v = t.contentWindow;
				w = t.contentDocument;
				w.head
					.appendChild(w.createElement('style'))
					.appendChild(
						document.createTextNode(
							'body { font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif; font-size: 100%; line-height: 1.4em; min-height: 90vh } @media screen and (max-width: 701px) {body { min-height: 150px } }p, div { margin: 0 }'
						)
					);
				var a = w.body;
				a.contentEditable = !0;
				a.setAttribute('spellcheck', 'false');
				a.setAttribute('autocorrect', 'off');
				a.setAttribute('autocomplete', 'off');
				a.setAttribute('autocapitalize', 'off');
				x = v.getSelection ? v.getSelection() : null;
				ja = w.body.style;
				y = w;
				BrowserDetect.Firefox
					? ((ia = function() {
							w.body.focus();
							v.focus();
						}),
						(r = function() {
							v.focus();
						}))
					: (ia = r = function() {
							w.body.focus();
						});
			} else if ('TEXTAREA' == t.nodeName)
				(u = t),
					(w = null),
					(y = u),
					(x = v = null),
					(ja = u.style),
					(ia = r = function() {
						u.focus();
					}),
					(ra = sa),
					(pa = ua),
					(na = ya),
					(oa = za),
					(la = Xb),
					(Yb = $b);
			else throw 'TypeIt error: Element #typeit_textbox is neither an IFRAME nor a TEXTAREA';
			da = !0;
			DocumentClickTracker.prototype.trackedDocuments = v ? [ document, w ] : [ document ];
			window.F = document.getElementById('typeit_toolbar_char');
			if (!window.F) throw "TypeIt error: Could not locate element with id = 'typeit_toolbar_char'!";
			window.A = document.getElementById('typeit_toolbar_edit');
			if (!window.A) throw "TypeIt error: Could not locate element with id = 'typeit_toolbar_edit'!";
			pr(fa, x, q) ||
				(ma = function() {
					p = 0;
				});
			burgerMenu.init('nav.nav', 'typeit_burgermenu');
			jb();
			mb();
			Jb();
			xb();
			Ab();
			sb();
			HIGHLIGHT_FREQUENT_BUTTONS && Bb();
			t.style.visibility = 'inherit';
			var b = BrowserDetect.Chrome || BrowserDetect.IE ? 'onbeforeunload' : 'onpagehide';
			void 0 !== window[b] && (window[b] = cc);
			void 0 !== window.R &&
				(window.R = function(a) {
					a.persisted && ((window[b] = null), window.location.reload());
				});
			window.setInterval(cc, 4e4);
			Yb();
			(E = document.getElementById('typeit_shortcuts_toggle_selector'))
				? ((E.onclick = kb),
					DEVICE_PRIMARILY_TOUCH && window.ALPHA_SHORTCUTS ? (D = E.checked = !1) : (D = E.checked))
				: (D = !0);
			Za();
			popup.init();
			void 0 !== y.onpaste && (y.onpaste = Ma);
			y.onmouseup = Ka;
			void 0 !== y.ontouchstart && (y.ontouchstart = Na);
			document.onmouseup = La;
			y.onblur = function() {
				B({ blur: !0 });
			};
			y.oncontextmenu = function() {
				B({ Z: !0 });
			};
			y.onkeyup = Ja;
			y.onkeydown = Fa;
			y.onkeypress = Ia;
			BrowserDetect.Windows &&
				(BrowserDetect.Chrome || BrowserDetect.Firefox) &&
				(y.addEventListener('keydown', Ua), y.addEventListener('keypress', Ua));
			window.j = 0;
			BrowserDetect.Safari &&
				y.addEventListener &&
				(y.addEventListener(
					'compositionupdate',
					function(a) {
						window.j = a.data.length;
					},
					!1
				),
				y.addEventListener(
					'compositionend',
					function() {
						window.j = 0;
					},
					!1
				));
			window.F.onmousedown = BrowserDetect.Firefox
				? (window.A.onmousedown = function(a) {
						a.target.type || a.preventDefault();
					})
				: (window.A.onmousedown = function(a) {
						a.preventDefault();
					});
			y.addEventListener && y.addEventListener('copy', ec, !1);
			window.addEventListener('keydown', Ga, !1);
			DEVICE_PRIMARILY_TOUCH ||
				(window.addEventListener('focus', Oa, !1), v && v.addEventListener('focus', Oa, !1), Pa());
			DEVICE_PRIMARILY_TOUCH &&
				M.classList.contains('compact') &&
				(a = M.querySelector('.tiny-screen')) &&
				new HorizScroller(a);
			new Transition('fade', 'in', [ window.A, window.F, document.getElementById('typeit_prefbar') ], '0.4s');
		} else (ka.onload = hc), (gIframeHasLoaded = !0);
	}
}
