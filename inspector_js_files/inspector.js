(() => {
    //window.debugMode = true;
    class Value {
        constructor(change, v) {
            this.change = change;
            this.v = v;
        }

        get value() {
            return this.v;
        }

        set value(v) {
            this.v = v;
            this.change();
        }
    }
    const tryfn = fn => {
        try {
            fn();
        } catch (e) {
            if (window.debugMode) {
                try {
                    alert(JSONStringify({ error: e, fn: fn }));
                } catch (e1) {
                    alert(`${e.toString()}\n${e1.toString()}`);
                }
            }
            console.error(e);
        }
    };

    let cleanCode = h => {
        let pattern = h.match(/\s*\n[\t\s]*/);
        h = h.replace(new RegExp(pattern, "g"), "\n");
        return h;
    };

    let cleanHtml = h => {
        return h.replace(/\</g, "&#60;").replace(/\>/g, "&#62;");
    };

    let isImage = url => {
        return url.match(/\.(jpeg|jpg|gif|png|ico|icon)$/) != null;
    };

    let toUrl = lnk => {
        if (lnk.match(/(http\:|https\:|www\.)/g) != null) return lnk;
        if (lnk.startsWith("/")) lnk = lnk.substring(1);
        return `${location.hostname}/${lnk}`;
    };

    const tryfnAsync = async fn => {
        try {
            await fn();
        } catch (e) {
            if (window.debugMode) {
                try {
                    alert(JSONStringify({ error: e, fn: fn }));
                } catch (e1) {
                    alert(`${e.toString()}\n${e1.toString()}`);
                }
            }
            console.error(e);
        }
    };

    const sleep = ms => {
        return new Promise(r => setTimeout(r, ms));
    };
    const JSONStringify = obj => {
        if (obj == undefined || obj === null) obj = "undefined";
        const isArray = value => {
            return Array.isArray(value) && typeof value === "object";
        };

        const isObject = value => {
            return (
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value)
            );
        };

        const isError = value => {
            return typeof value === "object" && value instanceof Error;
        };

        const isFunc = v => {
            return typeof v === "function";
        };

        const isString = value => {
            return typeof value === "string";
        };

        const isBoolean = value => {
            return typeof value === "boolean";
        };

        const isNumber = value => {
            return typeof value === "number";
        };

        // Common check for number, string and boolean value
        const restOfDataTypes = value => {
            return isNumber(value) || isString(value) || isBoolean(value);
        };

        function escapeRegExp(text) {
            if (!text || !isString(text)) return text;
            text = JSON.stringify(text);
            if (text.charAt(0) === '"')
                text = text.substring(1, text.length - 1);
            return text;
        }

        obj = isError(obj)
            ? {
                  message: obj.message,
                  stack: obj.stack
              }
            : obj;

        // Boolean and Number behave in a same way and String we need to add extra qoutes
        if (restOfDataTypes(obj)) {
            try {
                const passQuotes =
                    obj === undefined || obj === null || isString(obj)
                        ? '"'
                        : "";
                return `${passQuotes}${escapeRegExp(obj)}${passQuotes}`;
            } catch (e) {
                return `""`;
            }
        }

        // This function will be used to remove extra comma from the arrays and object
        const removeComma = str => {
            const tempArr = str.split("");
            tempArr.pop();
            return tempArr.join("");
        };

        // Recursive function call for Arrays to handle nested arrays
        if (isArray(obj)) {
            try {
                let arrStr = "";
                obj.forEach(eachValue => {
                    arrStr += JSONStringify(eachValue);
                    arrStr += ",";
                });

                return `[` + removeComma(arrStr) + `]`;
            } catch (e) {
                return "[]";
            }
        }

        const tryfn = value => {
            try {
                return value();
            } catch (e) {
                return value;
            }
        };

        // Recursive function call for Object to handle nested Object
        if (isObject(obj)) {
            try {
                let objStr = "";
                const objKeys = Object.keys(obj);

                Object.keys(Object.getPrototypeOf(obj))
                    .filter(x => !objKeys.find(f => f == x))
                    .forEach(x => objKeys.push(x));

                objKeys.forEach(eachKey => {
                    let eachValue = obj[eachKey];
                    eachValue = isFunc(eachValue)
                        ? tryfn(eachValue)
                        : eachValue;
                    if (!isFunc(eachValue)) {
                        objStr += `"${eachKey}":${JSONStringify(eachValue)},`;
                    } else {
                        objStr += `"${eachKey}":"${eachValue.toString()}",`;
                    }
                });
                return `{` + removeComma(objStr) + `}`;
            } catch (e) {
                return "{}";
            }
        }
    };
    const emStyleId = "inspector.css";
    const fetchData = [];
    let onFetchCalled = undefined;
    const network = async () => {
        const { fetch: origFetch } = window;
        window.fetch = async (...args) => {
            try {
                const response = await origFetch(...args);
                let cloned = { res: response.clone(), req: args };

                fetchData.push(cloned);
                if (onFetchCalled) onFetchCalled(cloned);

                /* the original response can be resolved unmodified: */
                //return response;

                /* or mock the response: */
                return response;
            } catch (e) {
                console.error(e);
                throw e;
            }
        };
    };
    network();
    const getOffet = div => {
        div = div.el || div;
        const item = div.getBoundingClientRect();
        item.right = item.width + item.x;
        item.bottom = item.y + item.height;
        return item;
    };

    function EMCONSOLE() {
        this.change = undefined;
        console.stdlog = console.log.bind(console);
        console.stdinfo = console.info.bind(console);
        console.stderror = console.error.bind(console);
        this.logs = [];
        console.log = async (...args) => {
            this.read("log", args);
            console.stdlog.apply(console, args);
        };

        console.info = (...args) => {
            this.read("info", args);
            console.stdinfo.apply(console, args);
        };

        console.error = (...args) => {
            this.read("error", args);
            console.stderror.apply(console, args);
        };
        let sitems = [];
        function syntaxHighlight(jsonString) {
            if (!jsonString) return "";

            jsonString
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            return jsonString.replace(
                /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
                match => {
                    let cls = "number"; // number
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = "key"; // key
                        } else {
                            cls = "string"; // string
                        }
                    } else if (/true|false/.test(match)) {
                        cls = "boolean";
                    } else if (/null/.test(match)) {
                        cls = "null";
                    }
                    return `<span class="${cls}">${match}</span>`;
                }
            );
        }

        this.tryJson = v => {
            try {
                // return JSONStringify(v)
                let json = JSONStringify(v);
                return JSON.stringify(JSON.parse(json), undefined, 4);
            } catch (e) {
                alert(e.message);
                return v.toString();
            }
        };

        this.read = (type, args) => {
            let items = [];
            sitems = [];

            let json = syntaxHighlight(this.tryJson(args));

            items.push({ json, type });
            this.logs.push({ json, type });

            if (this.change) this.change(items);
        };
    }

    const arrayItem = function (...data) {
        const arr = function () {};
        arr.prototype = Array.prototype;

        arr.prototype.add = function (...items) {
            for (let item of items) this.push(item);
            return this;
        };

        arr.prototype.removeAt = function (index) {
            const item = this[index];
            this.splice(index, 1);
            if (item.remove) item.remove();
            return this;
        };

        arr.prototype.remove = function (item) {
            const index = this.findIndex(x => x === item);
            return this.removeAt(index);
        };

        arr.prototype.clear = function () {
            while (this.length > 0) {
                let item = this.shift();
                if (item.remove) item.remove();
            }
            return this;
        };

        arr.prototype.mapAsync = async function (fn) {
            let index = 0;
            let data = arrayItem();
            for (let v of this) {
                let d = await fn(v, index);
                if (d != undefined && d !== null) data.add(d);
                index++;
            }
            return data;
        };

        arr.prototype.has = function () {
            return this.length > 0;
        };

        arr.prototype.last = function () {
            return this[this.length - 1];
        };

        arr.prototype.first = function () {
            return this[0];
        };

        item = new arr();
        item.add.bind(item);
        item.remove.bind(item);
        item.clear.bind(item);
        item.removeAt.bind(item);
        item.mapAsync.bind(item);
        item.has.bind(item);
        item.last.bind(item);
        item.first.bind(this);
        if (data && data.length > 0) item.add(...data);
        return item;
    };
    let resizEvents = new arrayItem();
    const center = function (el, parent) {
        parent = parent || document.body;
        parent = parent.el || parent;
        el = el.el || el;
        resizEvents.add(() => {
            setTimeout(() => {
                this.focus();
            }, 300);
        });
        this.parent = p => {
            parent = p.el || p;
            return this;
        };
        this.index = resizEvents.length - 1;
        this.focus = () => {
            const pOffset = getOffet(parent);
            const eOffset = getOffet(el);
            el.style.left =
                pOffset.x + pOffset.width / 2 - eOffset.width / 2 + "px";
            el.style.top =
                pOffset.y + pOffset.height / 2 - eOffset.height / 2 - 30 + "px";
            // console.log(el.style.top, el.style.left);
            return this;
        };

        this.destroy = () => {
            resizEvents.removeAt(this.index);
            return this;
        };
    };

    function getScrollableEl(div) {
        let el = div;
        for (let i = 0; i < 2; i++) {
            el = el.parentNode;
            if (el === undefined) return div;
            const hasVerticalScrollbar = el.scrollHeight > el.clientHeight;
            if (hasVerticalScrollbar) return el;
        }
        return div;
    }

    function scrollTo(el, parent) {
        try {
            el = typeof el === "string" ? document.querySelector(el) : el;

            parent = parent || el.parentNode;
            const offset = el.offsetTop;
            const boffset = getOffet(el);
            if (offset === undefined) return;
            parent.scrollTo(0, offset);
        } catch (e) {
            console.error("hhhh", e);
        }
    }

    let createdElements = new arrayItem();
    const Element = function (type, options) {
        this.events = arrayItem();
        this.options = options = options || {};
        this.isEMElement = true;
        if (typeof type !== "string" && type.isEMElement) return type;
        this.el =
            typeof type === "string" ? document.createElement(type) : type;
        if (typeof type === "string" && !this.parentNode) {
            options.className = (options.className || "") + ` emElement`;
            createdElements.add(this.el);
        }
        if (options)
            Object.keys(options).forEach(x => {
                if (this.el.style[x] !== undefined)
                    this.el.style[x] = options[x];
                else this.el[x] = options[x];
            });

        this.counter = 10;
        this.val = value => {
            const isv =
                ["input", "textarea"].indexOf(this.el.tagName.toLowerCase()) !==
                -1;
            if (value != undefined) {
                if (!isv) this.el.innerHTML = value;
                else this.el.value = value;
            }

            if (isv) return this.el.value;
            return this.el.innerHTML;
        };

        this.toggleClass = c => {
            if (this.el.classList.contains(c)) this.el.classList.toggle(c);
            else this.el.className = c + " " + this.el.className;
            return this;
        };

        this.event = (name, func) => {
            name.split(" ").forEach(x => {
                let ev = e => func(e, x);
                this.events.add({ name: x, func: ev });
                this.el.addEventListener(x, ev);
            });
            return this;
        };

        this.clearEvents = () => {
            if (this.options.removeAble === false) return;
            this.events.forEach(x =>
                this.el.removeEventListener(x.name, x.func)
            );
            return this;
        };

        this.remove = () => {
            //this.clearEvents();
            if (this.options.removeAble === false) return;
            this.el.remove();
            return this;
        };

        this.attr = (key, value) => {
            if (value !== undefined) this.el.setAttribute(key, value);
            return this.el.getAttribute(key);
        };

        this.attrs = () => {
            const items = new arrayItem();
            for (let i = 0; i < this.el.attributes.length; i++) {
                let attr = this.el.attributes[i];
                items.add(attr);
            }

            return items;
        };
        function getStyle(el, cssprop) {
            if (el.currentStyle)
                //IE
                return el.currentStyle[cssprop];
            else if (
                document.defaultView &&
                document.defaultView.getComputedStyle
            )
                //Firefox
                return document.defaultView.getComputedStyle(el, "")[cssprop];
            //try and get inline style
            else return el.style[cssprop];
        }

        this.styleValue = (...items) => {
            let item = {};
            items.forEach(k => {
                item[k] = getStyle(this.el, k);
            });

            return item;
        };

        this.css = options => {
            Object.keys(options).forEach(x => {
                this.el.style[x] = options[x];
            });
            return this;
        };

        this.offset = () => {
            return getOffet(this.el);
        };

        this.getEl = item => {
            return item.el || item;
        };

        this.appendTo = parent => {
            this.getEl(parent).appendChild(this.el);
            return this;
        };

        this.add = (...c) => {
            c.forEach(content => {
                if (typeof content == "string") {
                    let e = document.createElement("div");
                    e.innerHTML =content;
                    content = e;
                }

                if (content.el === undefined) this.el.appendChild(content);
                else this.el.appendChild(content.el);
            });
            return this;
        };

        this.prepend = content => {
            if (typeof content == "string") {
                const c = document.createElement("div");
                c.innerHTML = content;
                content = c;
            }

            if (content.el === undefined) this.el.prepend(content);
            else this.el.prepend(content.el);
            return this;
        };

        this.insertAfter = c => {
            c = c.el === undefined ? c : c.el;
            c.appendChild(this.el);
            c.parentNode.insertBefore(this.el, c.nextSibling);
            return this;
        };

        this.insertBefore = c => {
            c = c.el === undefined ? c : c.el;
            c.appendChild(this.el);
            c.parentNode.insertBefore(this.el, c.previousSibling);
            return this;
        };

        this.center = parent => {
            if (this.centerObject == undefined)
                this.centerObject = new center(this, parent);
            return this.centerObject.parent(parent);
        };

        this.classList = () => this.el.classList;

        this.slideDown = (center, offset, Onfinished) => {
            const firstrun = offset == undefined;
            if (firstrun) {
                this.classList().remove("hidden");
                if (center) this.center().focus();
                offset = offset || this.offset();
                this.css({
                    top: "-" + (offset.y + offset.height) + "px",
                    opacity: 1
                });
            }
            const coffset = this.offset();
            setTimeout(() => {
                if (coffset.y < offset.y) {
                    this.css({
                        top: Math.min(coffset.y + this.counter, offset.y) + "px"
                    });
                    this.slideDown(center, offset, Onfinished);
                } else if (Onfinished) Onfinished();
            }, 0);
        };

        this.slideUp = (y, onfinished) => {
            const offset = this.offset();
            y = y || -(offset.y + offset.height);
            setTimeout(() => {
                if (offset.y > y) {
                    y += this.counter;
                    this.css({
                        top: offset.y - this.counter + "px"
                    });
                    this.slideUp(y, onfinished);
                } else {
                    this.classList().add("hidden");
                    if (onfinished) onfinished();
                }
            }, 0);
        };

        this.show = (ms, max, op) => {
            ms = ms || 1;
            max = max || 1;
            if (op === undefined) {
                this.css({
                    opacity: 0
                });
                op = 0;
                this.classList().remove("hidden");
            }
            setTimeout(() => {
                op += 0.01;
                if (op <= max) {
                    this.css({
                        opacity: op
                    });
                    this.show(ms, max, op);
                }
            }, ms);
        };

        this.hide = (ms, op) => {
            ms = ms || 1;
            op = op || parseFloat(this.styleValue("opacity").opacity);
            setTimeout(() => {
                op -= 0.01;
                if (op >= 0) {
                    this.css({
                        opacity: op
                    });
                    this.hide(ms, op);
                } else this.classList().add("hidden");
            }, ms);
        };

        this.find = path => {
            return new Element(this.el.querySelector(path));
        };

        this.findAll = path => {
            return [...this.el.querySelectorAll(path)].map(x => new Element(x));
        };

        this.blink = (total, speed) => {
            if (total === undefined) total = 4;
            setTimeout(() => {
                this.classList().toggle("blink");
                if (total > 0 || this.classList().contains("blink")) {
                    this.blink(total - 1, speed);
                }
            }, speed || 450);
            return this;
        };

        this.resizable = (handler, change) => {
            let isTouched = false;
            let startY = 0;
            let startHeight = 0;
            handler.event("touchstart", e => {
                isTouched = true;
                startY = e.changedTouches[0].clientY;
                startHeight = this.offset().height;
                e.stopImmediatePropagation();
            });
            handler.event("touchend touchcancel", () => {
                isTouched = false;
            });
            handler.event("touchmove", e => {
                if (isTouched) {
                    e.preventDefault();
                    e = e.changedTouches[0];
                    let offset = this.offset();
                    let dy = offset.height - e.clientY + startY;
                    this.el.style.height = dy + "px";
                    if (change) change();
                    return false;
                }
                e.stopImmediatePropagation();
            });
            return this;
        };
    };
    const emConsole = new EMCONSOLE();
    let dialogsTotal = 1;
    const loader = function (parent) {
        parent = parent || new Element(document.body);
        this.isLoading = false;
        if (parent.el === undefined) parent = new Element(parent);

        const blur = new Element("div", {
            className: "blur hidden",
            zIndex: dialogsTotal * 100
        }).appendTo(parent.el);

        const loader = new Element("span", {
            className: "loader",
            zIndex: dialogsTotal * 101
        }).appendTo(blur.el);
        this.parent = p => {
            parent = p;
            p.add(blur);
            loader.center(parent).focus();
        };
        this.show = () => {
            this.isLoading = true;
            dialogsTotal++;

            blur.css({
                zIndex: dialogsTotal * 100
            });

            blur.classList().remove("hidden");
            setTimeout(() => {
                loader.center(parent).focus();
            }, 300);
            return this;
        };

        this.hide = () => {
            this.isLoading = false;
            dialogsTotal--;
            blur.classList().add("hidden");
            return this;
        };
    };

    function horizentalMenu(onchange) {
        this.selectedIndex = -1;
        this.tabs = [];
        this.loader = new loader();
        this.container = new Element("tabmenu", {});
        this.tabsContainer = new Element("tabcontainer", {}).appendTo(
            this.container.el
        );
        this.buttonContainer = new Element("tabbtncontainer", {}).appendTo(
            this.container
        );
        this.content = new Element("content", {}).appendTo(this.container.el);

        this.addTabs = (...tabs) => {
            tabs.forEach((x, i) => {
                this.tabs.add(x);
                x.id = i;
                if (!x.hidden) {
                    const a = new Element("taba", {
                        innerHTML: x.text,
                        onclick: () => {
                            this.select(i);
                        }
                    }).appendTo(this.tabsContainer.el);
                }
                this.content.add(new Element("div").add(x.content.el));
            });
            if (this.selectedIndex === -1) this.select(0);
            return this;
        };

        this.resize = () => {
            setTimeout(() => {
                const parent = this.content.el.parentNode;
                if (parent) {
                    this.content.css({
                        "max-height": getOffet(parent).height - 40 + "px"
                    });
                }
            }, 100);
        };

        resizEvents.add(() => {
            if (this.selectedIndex >= 0) {
                this.content.el.classList.add("disableTr");
                [9, 8, 7, 5].forEach(() =>
                    this.select(this.selectedIndex, true)
                );
                this.content.el.classList.remove("disableTr");
            }
        });

        this.ajust = index => {
            if (index === undefined) index = this.selectedIndex;
            if (this.tabs.length <= 0) return;
            let offset = this.container.offset();
            let children = [...this.content.el.children];
            if (children.length <= 0) return;

            children.forEach(x => {
                x.style.width = offset.width + "px";
            });
            let div = new Element(children[index]);
            let coffset = div.offset();
            //console.log(coffset);
            this.content.css({
                left: `-${coffset.width * index}px`,
                display: "flex",
                width: offset.width * this.tabs.length + "px"
            });
            this.loader.parent(div);
        };

        this.select = (index, force) => {
            try {
                if (typeof index === "object" && index.id != undefined)
                    index = index.id;
                if (!force && this.selectedIndex == index) return;
                this.selectedIndex = index;
                this.resize();
                //this.content.classList().add("hidden");
                this.ajust(index);
                // this.content.val("");
                this.buttonContainer.val("");
                let tab = this.tabs[index];

                //alert(offset);
                //this.content.add(tab.content.el);
                //this.content.show(10);

                this.loader.hide();
                this.tabsContainer.findAll("taba").forEach((x, i) => {
                    if (i == index) x.classList().add("selected");
                    else x.classList().remove("selected");
                });

                if (tab.buttons) {
                    this.buttonContainer.classList().remove("hidden");
                    tab.buttons.forEach(x => this.buttonContainer.add(x));
                } else this.buttonContainer.classList().add("hidden");

                if (onchange) onchange();
            } catch (e) {
                console.error(e);
            }
        };
    }

    function emuSearch(rItem) {
        let timer = undefined;
        this.itemFound = [];
        this.index = -1;
        this.currentPos = 0;

        this.container = new Element("div", {
            className: "emuSearch"
        })
            .add(
                new Element("input", {
                    type: "text",

                    placeholder:
                        "Search By #Id , .Class or attr and text value",
                    onkeyup: e => {
                        clearTimeout(timer);
                        timer = setTimeout(() => {
                            this.currentPos = 0;
                            this.index = -1;
                            this.itemFound = [];

                            this.validate();
                            tryfn(() => this.search());
                        }, 300);
                    }
                }).event("blur", () => {
                    rItem.menu.container.el.scrollTo(0, 0);
                    rItem.emulator.el.scrollTo(0, 0);
                })
            )
            .add(
                new Element("span", {
                    innerHTML: "&#8592;",
                    onclick: () => this.prev()
                })
            )
            .add(
                new Element("span", {
                    innerHTML: "&#8594;",
                    onclick: () => this.next()
                })
            );
        this.clear = () => {
            this.container.find("input").val("");
            this.index = -1;
            this.currentPos = 0;
            this.itemFound.clear();
            this.validate();
        };

        this.next = () => {
            if (this.index + 1 < this.itemFound.length) {
                this.index++;
                this.jump();
            } else this.search();
        };

        this.prev = () => {
            if (this.index - 1 >= 0) {
                this.index--;
                this.jump();
            }
        };

        this.validate = () => {
            let spans = this.container.findAll("span");
            spans.forEach(x => x.classList().remove("hidden"));
            if (spans.length > 1) {
                if (
                    this.itemFound.length <= 0 ||
                    !(this.currentPos < rItem.items.length)
                )
                    spans[1].classList().add("hidden");

                if (this.itemFound.length <= 0 || !(this.index - 1 >= 0))
                    spans[0].classList().add("hidden");
            }
        };

        this.jump = () => {
            let item = this.itemFound[this.index];

            rItem.scrollto(item);
            this.validate();
        };

        this.search = async () => {
            try {
                let text = this.container.find("input").val();
                if (text.trim().length <= 0) return;
                rItem.menu.loader.show();
                await sleep(10);
                let attr = (html, text) => {
                    if (!html.attributes) return false;
                    for (let attr of html.attributes) {
                        if (
                            attr.value
                                .toLowerCase()
                                .indexOf(text.toLowerCase()) !== -1
                        )
                            return true;
                    }
                    return false;
                };
                let textNodes = (html, text) => {
                    for (let i = 0; i < html.childNodes.length; i++) {
                        const n = html.childNodes[i];

                        if (n && n.nodeType === Node.TEXT_NODE) {
                            if (
                                n.nodeValue != null &&
                                n.nodeValue
                                    .toLowerCase()
                                    .indexOf(text.toLowerCase()) !== -1
                            )
                                return true;
                        }
                    }
                    return false;
                };
                let found = false;
                let index = this.currentPos;
                for (let i = this.currentPos + 1; i < rItem.items.length; i++) {
                    let item = rItem.items[i];
                    text = text.trim();
                    let lower = text.toLowerCase();
                    let sim = text[0];
                    if (found) break;
                    index++;
                    if (sim == ".") {
                        if (item.html.classList.contains(text.substring(1))) {
                            this.itemFound.add(item);
                            found = true;
                            continue;
                        }
                    } else if (sim == "#") {
                        if (
                            (item.html.id || "").toLowerCase() ==
                            lower.substring(1)
                        ) {
                            this.itemFound.add(item);
                            found = true;
                            continue;
                        }
                    } else if (
                        textNodes(item.html, lower) ||
                        attr(item.html, lower)
                    ) {
                        this.itemFound.add(item);
                        found = true;
                        continue;
                    }
                }

                if (found) {
                    this.index = this.itemFound.length - 1;
                    this.jump();
                    this.currentPos = index;
                }
            } catch (e) {
                console.error(e);
            } finally {
                rItem.menu.loader.hide();
            }
        };
        this.validate();
    }
    let bodyItems = new arrayItem();
    let htmlDoc = new Element(document);
    let clearing = false;
    let observers = arrayItem();
    const clearEmulator = async () => {
        while (clearing) await sleep(100);
        try {
            bodyItems.clear();
            htmlDoc.clearEvents();
            createdElements = arrayItem();
            resizEvents = arrayItem();
            let index = 0;
            clearing = true;
            while (true) {
                if (observers.has()) observers.removeAt(0);
                if (!observers.has()) break;
                if (index % 100 == 0) await sleep(3);

                index++;
            }
        } catch (e) {
            throw e;
        }
        clearing = false;
    };
    async function render() {
        await tryfnAsync(clearEmulator);
        this.insMode = false;
        this.items = new arrayItem();
        this.menu = new horizentalMenu();
        this.files = new arrayItem();
        this.cssValue = new Value(() => {
            if (!this.cssValue.value) {
                htmlTab.buttons[0].classList().add("hidden");
            } else {
                htmlTab.buttons[0].classList().remove("hidden");
            }
        });
        const saveData = function (data, fileName) {
            let a = new Element("a", {
                className: "download"
            });
            // data = JSON.stringify(data);

            var json = data,
                blob = new Blob([json], { type: "octet/stream" }),
                url = window.URL.createObjectURL(blob);
            a.el.href = url;
            a.el.download = fileName;

            let html = data;
            a.event("click", e => {
                tryfn(() => {
                    if (window.ReactNativeWebView) {
                        e.preventDefault();
                        e.stopPropagation();

                        window.ReactNativeWebView.postMessage(
                            JSON.stringify({
                                type: "download",
                                fileName,
                                data: html
                            })
                        );
                    } else {
                        console.info(
                            "window.ReactNativeWebView",
                            "is null, using web link",
                            window.ReactNativeWebView
                        );
                    }
                });
            });
            return a;
        };

        const emusearch = new emuSearch(this);
        const cssTab = {
            content: new Element("fcontainer").add(
                new Element("pre", {
                    width: "95%",
                    height: "90%",
                    display: "block"
                })
            ),
            hidden: true,
            text: "css"
        };
        const htmlTab = {
            text: "HTML",
            content: new Element("emc"),
            buttons: new arrayItem().add(
                new Element("a", {
                    innerHTML: "CSS",
                    className: "update hidden",
                    background: "none",
                    display: "flex"
                }).event("click", () => {
                    this.renderCss();
                    this.menu.select(cssTab);
                }),
                new Element("a", {
                    className: "update"
                }).event("click", () => this.reBuild()),
                saveData(htmlDoc.el.documentElement.outerHTML, "html.txt"),
                new Element("emi", {
                    innerHTML: "&#x261B;",
                    onclick: e => {
                        e.target.classList.toggle("selected");
                        this.insMode = !this.insMode;
                    }
                }),

                emusearch.container
            )
        };

        const consoleTab = {
            text: "CONSOLE",
            content: new Element("emcontent")
        };

        const fetchTab = {
            text: "FETCH",
            content: new Element("filecontent").add(
                new Element("fcontainer").add(
                    new Element("fpanel"),
                    new Element("pre", {
                        className: ""
                    })
                )
            )
        };

        let consoleElement = json => {
            let i = new Element("pre", {
                innerHTML: json.json,
                className: json.type
            }).prepend(
                new Element("div", {
                    className: "sticky"
                }).add(
                    new Element("i", {
                        className: "gg-copy",
                        onclick: () => {
                            navigator.clipboard.writeText(i.el.innerText);
                            i.blink(4, 200);
                        }
                    })
                )
            );
            i.appendTo(consoleTab.content);
        };

        emConsole.logs.forEach(x => consoleElement(x));
        emConsole.change = items => items.forEach(x => consoleElement(x));

        const filetab = {
            text: "Files",
            content: new Element("filecontent")
        };

        this.menu.addTabs(htmlTab, consoleTab, filetab, fetchTab, cssTab);
        this.scrollto = c => {
            if (c) {
                const el = this.emulator.find(c.id);
                if (el.el.scrollIntoView) el.el.scrollIntoView(true);
                else scrollTo(el.el, content.el);

                inspector.el.scrollTo(0, 0);
                this.menu.container.el.scrollTo(0, 0);
                el.blink();
            }
        };

        this.scrollToPosition = y => {
            content.el.scrollTo(this.x, y || this.y);

            content.el.onscroll = e => {
                this.x = content.el.scrollLeft;
                this.y = content.el.scrollTop;
            };
        };

        htmlDoc.event(
            "click touchstart touchend",
            (e, type) => {
                if (type !== "touchstart" && this.insMode) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
                let em = e.target.closest("emulator");
                if (this.insMode && !em) {
                    let c = this.items.find(x => x.html === e.target);
                    this.scrollto(c);
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            },
            true
        );

        this.cn = new Element("emdiv", {
            className: "emiframe",
            position: "fixed",
            bottom:0,
            left:0,
            width:"100vw",
            zIndex: 998865468999876567
        }).appendTo(document.body);
        bodyItems.add(this.cn);
        this.iframe = new Element("iframe", {
            height: "100%",
            width: "100%",
            border: "none",
            position: "relative",
            display:"table",
            zIndex: 998865468999876567
        }).appendTo(cn);
        this.reBuild = () => {
            emusearch.clear();
            this.items = arrayItem();
            this.cssValue.value = undefined;
            createdElements = arrayItem();
            tryfnAsync(async () => {
                let t = await this.build(document.documentElement);
                content.el.onscroll = undefined;
                content.val("");
                content.add(t);
                this.scrollToPosition(this.y);
            });
        };

        this.renderCss = () => {
            tryfn(() => {
                let c = this.items.find(x => x.cid == this.cssValue.value);
                let cssDATA = "";
                cssTab.content.find("pre").val("");
                if (c) {
                    let styleLooper = (style, item) => {
                        if (Array.isArray(style) && style.length > 0) {
                            style = style[0];
                        }
                        for (let k in style) {
                            item[k] = style.getPropertyValue(k);
                            if (item[k].length <= 0) delete item[k];
                        }
                        return item;
                    };
                    console.log(c.html.tagName, c.html.getAttribute("style"));
                    let css = c.html.style.cssText.split(";").reduce((a, v) => {
                        v = v.split(":");
                        if (v.length > 1) {
                            let key = v[0].trim();
                            a[key] = v[1].trim();
                        }
                        return a;
                    }, {});
                    let st = {
                        offset: getOffet(c.html),
                        cssText: css,
                        inlineStyle: styleLooper(c.html.style, {}),
                        computed: styleLooper(getComputedStyle(c.html, 0), {})
                    };

                    let json = JSONStringify(st);
                    let text = document.createTextNode(
                        cleanCode(
                            JSON.stringify(JSON.parse(json), undefined, 4)
                        )
                    );
                    cssTab.content.find("pre").add(text);
                }
            });
        };

        this.iframWindow = () => {
            let ifrm = this.iframe.el;
            ifrm =
                ifrm.contentWindow ||
                ifrm.contentDocument.document ||
                ifrm.contentDocument;
            return ifrm;
        };

        this.write = (...el) => {
            let ifrm = this.iframe.el;
            ifrm =
                ifrm.contentWindow ||
                ifrm.contentDocument.document ||
                ifrm.contentDocument;
            el.forEach(x => {
                let elm = typeof x === "string" ? x : x.el || x;

                if (
                    elm.tagName === "STYLE" ||
                    elm.tagName === "LINK" ||
                    typeof elm === "string" ||
                    elm.tagName === "SCRIPT"
                ) {
                    if (typeof elm === "string") {
                        ifrm.document.head.innerHTML +=
                            typeof elm === "string" ? elm : elm.outerHTML;
                    } else ifrm.document.head.appendChild(elm);
                } else ifrm.document.body.appendChild(elm);
            });

            return;
            ifrm.document.open();
            ifrm.document.write("Hello World!");
            ifrm.document.close();
        };
        const inspector = (this.emulator = new Element("emulator", {
            className: "inspector"
        }).add(this.menu.container));

        tryfn(() => {
            this.write(
                inspector,
                `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
                window[emStyleId.replace(/\./g, "")] ||
                    document.getElementById(emStyleId)
            );
        });

        const content = new Element("emcontent").appendTo(htmlTab.content);
        this.cn.resizable(this.menu.tabsContainer, () => this.menu.resize());
        
        this.menu.loader.show();
        this.menu.ajust(0);
        onFetchCalled = d => renderFetch(d);
        async function renderFetch(fdata) {
            let panel = fetchTab.content.find("fpanel");
            let txt = fetchTab.content.find("pre");
            if (panel.el === null || panel.el === undefined) return;
            fdata = fdata ? [fdata] : fetchData;
            for (let item of fdata) {
                let a = new Element("item", {
                    innerHTML: item.res.url
                })
                    .appendTo(panel)
                    .event("click", async () => {
                        try {
                            let x = item.newData || {
                                args: item.req,
                                response: {
                                    redirected: item.res.redirected,
                                    ok: item.res.ok,
                                    statusText: item.res.statusText,
                                    headers: item.res.headers,
                                    type: item.res.type,
                                    status: item.res.status,

                                    text: await item.res.text()
                                }
                            };
                            item.newData = x;
                            let node = document.createTextNode(
                                cleanCode(JSON.stringify(x, undefined, 4))
                            );
                            txt.val("");
                            txt.add(node);
                        } catch (e) {
                            console.error(e);
                        }
                    });
            }
        }

        async function renderFiles() {
            const c = new Element("fcontainer")
                .css({
                    display: "flex"
                })
                .appendTo(filetab.content);
            const panel = new Element("fpanel").appendTo(c);
            const rpanel = new Element("pre", {
                className: " "
            }).appendTo(c);
            let index = 1;
            for (let file of this.files) {
                await sleep(1);
                let lnk = file.getAttribute("src") || file.getAttribute("href");
                if (!lnk || lnk.length <= 0) {
                    lnk = index.toString();
                    if (file.tagName.toLowerCase() === "script") lnk += ".js";
                    if (
                        file.tagName.toLowerCase() === "style" ||
                        file.getAttribute("type") === "text/css"
                    )
                        lnk += ".css";
                }
                let s = lnk.split("/");
                s = s[s.length - 1];
                const item = new Element("item", {
                    innerHTML: s
                })
                    .event("click", async () => {
                        panel
                            .findAll("item.selected")
                            .forEach(x => x.toggleClass("selected"));
                        item.el.classList.toggle("selected");
                        try {
                            let h = file.innerHTML;
                            if (lnk.indexOf("/") !== -1) {
                                try {
                                    if (!isImage(lnk)) {
                                        let res = await fetch(lnk);
                                        h = await res.text();
                                    }
                                } catch (e) {
                                    item.classList().add("fetchError");
                                }
                            }
                            if (!isImage(lnk)) {
                                let node = document.createTextNode(
                                    lnk + "\n" + cleanCode(h)
                                );
                                rpanel.val("");
                                rpanel.add(node);
                            } else {
                                rpanel.val(
                                    toUrl(lnk) + `<img src="${toUrl(lnk)}" />`
                                );
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    })
                    .appendTo(panel);
                index++;
            }
        }

        this.ids = 1;
        this.newId = () => {
            return "em" + this.ids++;
        };
        this.attr = html => {
            const data = new arrayItem();
            if (html.attributes) {
                for (let i = 0; i < html.attributes.length; i++) {
                    let a = html.attributes[i];
                    if (!a || a.value.trim().length <= 0) continue;
                    let item = new Element("emattr");
                    let name = new Element("emname", {
                        className: "attrName",
                        innerHTML: `${a.name}=`
                    }).appendTo(item);
                    let value = new Element("emvalue", {
                        className: "attrValue",
                        innerHTML: `"${cleanHtml(a.value)}"`
                    }).appendTo(item);
                    data.add(item.el);
                }
            }

            return data;
        };
        this.textNodes = html => {
            let tg = html.tagName.trim().toLowerCase();
            for (let i = 0; i < html.childNodes.length; i++) {
                const n = html.childNodes[i];
                if (n && n.nodeType === Node.TEXT_NODE) {
                    let pre = new Element("pre", {
                        className: `emtext ${tg}`
                    }).add(document.createTextNode(n.nodeValue));
                    return pre.el;
                }
            }

            return null;
        };
        this.build = async (html, nivo) => {
           /* if (html && html.classList && html.classList.contains("emElement"))
                return undefined;*/
            if (nivo === undefined) nivo = 0;
            if (
                !html ||
                html.tagName === undefined ||
                html.tagName.toLowerCase() == "emulator"
            )
                return undefined;
            if (nivo % 100 === 0) await sleep(10);
            let id = this.newId().toString();
            let idstring = "#" + id;
            let text = this.textNodes(html);
            const attrs = this.attr(html);
            const chl =
                html.children && html.children.length > 0
                    ? await arrayItem(...html.children).mapAsync(
                          async x => await this.build(x, nivo + 1)
                      )
                    : [];
            const tagStart = new Element("emtag", {
                id: id
            });
            tagStart.val(`&lt;${html.tagName.toLowerCase()}`);
            attrs.forEach(x => tagStart.add(x));
            if (chl.length > 0 || text) {
                const childContent = new Element("emchild", {
                    className: text ? "childtxt" : ""
                });
                if (text) childContent.add(text);
                tagStart.el.innerHTML += "&gt;";
                childContent.add(...chl);
                tagStart.add(childContent);
                tagStart.el.innerHTML += `&lt;/${html.tagName.toLowerCase()}&gt;`;
            } else tagStart.el.innerHTML += "/&gt;";
            this.items.add({
                a: tagStart,
                html,
                id: idstring,
                cid: id
            });

            if (
                ["script", "style", "link", "img"].includes(
                    html.tagName.toLowerCase()
                )
            ) {
                this.files.push(html);
            }

            tagStart.el.setAttribute(
                "onclick",
                "window.event.stopImmediatePropagation();this.classList.toggle('readmode');this.querySelector('emchild>.emtext').classList.toggle('readmode')"
            );
            tagStart.event("touchstart", e => {
                e.stopImmediatePropagation();
                let item = e.target;
                if (item.tagName !== "EMTAG") item = item.closest("emtag");
                this.cssValue.value = item.id;
            });

            return tagStart;
        };
        await tryfnAsync(async () => {
            // await sleep(5000);
            let observerTimer = undefined;
            await content.add(await this.build(document.documentElement));

            observers.add(
                new MutationObserver(record => {
                    clearTimeout(observerTimer);
                    observerTimer = setTimeout(() => {
                        for (let r of record) {
                            if (r.target.classList.contains("emElement"))
                                return;
                        }
                        this.reBuild();
                    }, 600);
                })
            );

            observers.last().observe(document.body, {
                attributes: true,
                childList: true,
                subtree: true
            });
            this.scrollToPosition(0);
        });
        await tryfnAsync(async () => {
            await renderFiles();
        });
        await tryfnAsync(async () => {
            await renderFetch();
        });

        // alert("done");
        this.menu.loader.hide();
    }

    let renderTimer = undefined;
    let clearingTimer = undefined;
    let resizeTimer = undefined;
    let windowWidth = window.screen.width;
    window.onresize = e => {
        if (windowWidth == window.screen.width) return;
        windowWidth = window.screen.width;
        clearTimeout(resizeTimer);
        //alert(5);
        resizeTimer = setTimeout(() => {
            resizEvents.forEach(x => tryfn(x));
        }, 300);
    };
    window.renderInspector = () => {
        clearTimeout(clearingTimer);
        clearTimeout(renderTimer);
        renderTimer = setTimeout(render, 300);
    };
    window.clearEmulator = () => {
        clearTimeout(renderTimer);
        clearTimeout(clearingTimer);
        clearingTimer = setTimeout(clearEmulator, 300);
    };
})();
