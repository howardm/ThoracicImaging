"use strict";
function PacsbinClient(e) {
    e = e || {}, this.pacsbinUrl = e.pacsbinUrl || "http://www.pacsbin.com", this.pingIntervals = [], this.listeners = [], e.debug ? this.debug = function() {
        Function.apply.call(console.log, console, arguments)
    } : this.debug = function() {}
}
PacsbinClient.prototype.version = "0.2.0", PacsbinClient.prototype.resetClient = function(e) {
    if (this.debug("reset client. Existing:", "window events:", $._data(window, "events"), "ping intervals:", this.pingIntervals, "listeners:", this.listeners), e) {
        var t = $(e)[0];
        $(t).attr("ready", !1);
        var n = !0,
            i = !1,
            o = void 0;
        try {
            for (var s, r = this.listeners[Symbol.iterator](); !(n = (s = r.next()).done); n = !0) {
                var a = s.value;
                if (a.element === t)
                    return this.listeners.splice(this.listeners.indexOf(a), 1)
            }
        } catch (e) {
            i = !0, o = e
        } finally {
            try {
                !n && r.return && r.return()
            } finally {
                if (i)
                    throw o
            }
        }
    } else
        this.listeners = [];
    this.pingIntervals.map(window.clearInterval), $(window).off("message"), $(window).off("message.ping"), $(window).off("pingResponse")
}, PacsbinClient.prototype.elementHasListener = function(e, t) {
    var n = !0,
        i = !1,
        o = void 0;
    try {
        for (var s, r = this.listeners[Symbol.iterator](); !(n = (s = r.next()).done); n = !0) {
            var a = s.value;
            if (a.element === e)
                return a.listeners.indexOf(t) > -1
        }
    } catch (e) {
        i = !0, o = e
    } finally {
        try {
            !n && r.return && r.return()
        } finally {
            if (i)
                throw o
        }
    }
}, PacsbinClient.prototype.addOrUpdateElementListener = function(e, t) {
    var n = !0,
        i = !1,
        o = void 0;
    try {
        for (var s, r = this.listeners[Symbol.iterator](); !(n = (s = r.next()).done); n = !0) {
            var a = s.value;
            if (a.element === e)
                return -1 !== a.listeners.indexOf(t) || a.listeners.push(t)
        }
    } catch (e) {
        i = !0, o = e
    } finally {
        try {
            !n && r.return && r.return()
        } finally {
            if (i)
                throw o
        }
    }
    this.listeners.push({
        element: e,
        listeners: [t]
    })
}, PacsbinClient.prototype.setElementListener = function(e, t) {
    var n = $(e.selector)[0];
    this.elementHasListener(n, e.listener) || (this.postMessage(n, {
        action: e.action,
        selector: e.selector
    }), this.addOrUpdateElementListener(n, e.listener)), $(window).on("message", function(n) {
        var i = n.originalEvent.data;
        if (this.debug("window message:", i, "listener:", e.listener, "listeners:", this.listeners), i.type === e.listener && i.selector === e.selector)
            return t(i)
    }.bind(this))
}, PacsbinClient.prototype.setViewport = function(e, t) {
    return e && t ? "string" == typeof t ? this.postMessage($(e)[0], {
        querystring: t
    }) : this.postMessage($(e)[0], {
        action: "setViewport",
        viewport: t
    }) : (console.error("Must include valid selector and newViewport"), !1)
}, PacsbinClient.prototype.getViewport = function(e, t) {
    this.postMessage($(e)[0], {
        action: "getViewport",
        selector: e
    });
    var n = function(i) {
        var o = i.originalEvent.data;
        "getViewport" === o.type && o.selector === e && (this.debug("get viewport response", o), t(o), $(window).off("message", n))
    }.bind(this);
    $(window).on("message", n)
}, PacsbinClient.prototype.getSeriesInstanceIds = function(e, t) {
    this.postMessage($(e)[0], {
        action: "getSeriesInstanceIds",
        selector: e
    });
    var n = function(i) {
        var o = i.originalEvent.data;
        "getSeriesInstanceIds" === o.type && o.selector === e && (this.debug("get series instance ids response", o), t(o), $(window).off("message", n))
    }.bind(this);
    $(window).on("message", n)
}, PacsbinClient.prototype.onLoaded = function(e, t) {
    return e && e.contentWindow ? (this.debug("onLoaded element ready:", $(e).attr("ready")), "true" === $(e).attr("ready") || !0 === $(e).attr("ready") ? t() : void $(e).ready(function() {
        var n = e,
            i = n.contentWindow;
        if (i) {
            this.debug("ping", e);
            var o = Date.now(),
                s = function(e) {
                    this.debug("ping response", o);
                    var t = e.originalEvent.data;
                    "ping" === t.type && t.selector === o && t.href === $(n).attr("src") && (this.pingIntervals.map(window.clearInterval), $(n).trigger("pingResponse"), $(window).off("message.ping"), e.stopImmediatePropagation())
                }.bind(this);
            $(window).on("message.ping", s), this.pingIntervals.push(window.setInterval(function() {
                i && i.window ? (this.debug("pinging", i), i.postMessage({
                    action: "ping",
                    selector: o
                }, "*")) : this.pingIntervals.map(window.clearInterval)
            }.bind(this), 50))
        }
        $(n).on("pingResponse", function t(i) {
            this.debug("onLoad fired"), "true" !== $(e).attr("ready") && !0 !== $(e).attr("ready") && $(e).attr("ready", !0), i(), $(n).off("load", t)
        }.bind(this, t))
    }.bind(this))) : (console.error("Must include valid iframe element and data"), !1)
}, PacsbinClient.prototype.postMessage = function(e, t) {
    if (!e || !e.contentWindow || !t)
        return console.error("Must include valid iframe element and data"), !1;
    this.onLoaded(e, function() {
        this.debug("post message:", t), e.contentWindow.postMessage(t, "*")
    }.bind(this))
}, PacsbinClient.prototype.initLinks = function(e) {
    e || (e = {});
    var t = e.linkSelector || ".pacsbin-link",
        n = e.containerSelector || "body",
        i = e.dataAttr || "href";
    $(n).on("click", t, function(e) {
        e.stopPropagation(), e.preventDefault();
        var t = $(e.target).attr(i),
            n = $(e.target).data("iframe-id"),
            o = t.split("?"),
            s = n || o[0];
        /^#/.test(s) || (s = "#" + s);
        var r = o[1];
        return this.setViewport(s, r)
    }.bind(this))
}, PacsbinClient.prototype.onMouseDown = function(e, t) {
    return this.setElementListener({
        selector: e,
        listener: "mouseDown",
        action: "clickListen"
    }, t)
}, PacsbinClient.prototype.onMeasurementAdded = function(e, t) {
    return this.setElementListener({
        selector: e,
        listener: "measurementAdded",
        action: "measurementAddedListen"
    }, t)
}, PacsbinClient.prototype.onMeasurementModified = function(e, t) {
    return this.setElementListener({
        selector: e,
        listener: "measurementModified",
        action: "measurementModifiedListen"
    }, t)
}, PacsbinClient.prototype.onToolChange = function(e, t) {
    return this.setElementListener({
        selector: e,
        listener: "toolChanged",
        action: "toolChangeListen"
    }, t)
}, PacsbinClient.prototype.noPageScrollWheel = function(e) {
    this.debug("lock scroll", e), e || (e = {});
    var t = e.elementSelector || "iframe.pacsbin";
    $("body").on("mouseenter", t, function() {
        $("html, body").css({
            overflow: "hidden"
        })
    }).on("mouseleave", t, function() {
        $("html, body").css({
            overflow: ""
        })
    })
}, PacsbinClient.prototype.setTool = function(e, t) {
    this.postMessage($(e)[0], {
        action: "setTool",
        tool: t
    })
}, PacsbinClient.prototype.goToImageId = function(e, t) {
    this.postMessage($(e)[0], {
        action: "goToImageId",
        imageId: t
    })
}, PacsbinClient.prototype.getAnnotations = function(e, t) {
    this.postMessage($(e)[0], {
        action: "getAnnotations",
        selector: e
    });
    var n = function(i) {
        var o = i.originalEvent.data;
        "getAnnotations" === o.type && o.selector === e && (this.debug("get annotations response", o), t(o), $(window).off("message", n))
    }.bind(this);
    $(window).on("message", n)
}, PacsbinClient.prototype.clearAnnotations = function(e) {
    this.postMessage($(e)[0], {
        action: "clearAnnotations"
    })
}, PacsbinClient.prototype.setAnnotations = function(e, t) {
    if (!t)
        return console.error("Annotations object required."), !1;
    this.postMessage($(e)[0], {
        action: "setAnnotations",
        annotations: t
    })
}, PacsbinClient.prototype.toggleAnnotations = function(e, t) {
    this.postMessage($(e)[0], {
        action: "toggleAnnotations",
        state: t
    })
}, PacsbinClient.prototype.removeMostRecentAnnotation = function(e) {
    this.postMessage($(e)[0], {
        action: "removeMostRecentAnnotation"
    })
}, PacsbinClient.prototype.limitOneMarkPoint = function(e, t) {
    this.postMessage($(e)[0], {
        action: "limitOneMarkPoint",
        limitOne: t
    })
}, PacsbinClient.prototype.lockTool = function(e, t) {
    this.postMessage($(e)[0], {
        action: "lockTool",
        tool: t
    })
};