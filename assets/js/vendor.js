
/**
 * Silicon | Multipurpose Bootstrap 5 Template & UI Kit
 * Copyright 2023 Createx Studio
 * Theme scripts
 *
 * @author Createx Studio
 * @version 1.6.0
 */
      
(function () {
  'use strict';

  /*!
    * Bootstrap v5.3.3 (https://getbootstrap.com/)
    * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    */
  (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bootstrap = factory());
  })(undefined, (function () {
    /**
     * --------------------------------------------------------------------------
     * Bootstrap dom/data.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    /**
     * Constants
     */

    const elementMap = new Map();
    const Data = {
      set(element, key, instance) {
        if (!elementMap.has(element)) {
          elementMap.set(element, new Map());
        }
        const instanceMap = elementMap.get(element);

        // make it clear we only want one instance per element
        // can be removed later when multiple key/instances are fine to be used
        if (!instanceMap.has(key) && instanceMap.size !== 0) {
          // eslint-disable-next-line no-console
          console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
          return;
        }
        instanceMap.set(key, instance);
      },
      get(element, key) {
        if (elementMap.has(element)) {
          return elementMap.get(element).get(key) || null;
        }
        return null;
      },
      remove(element, key) {
        if (!elementMap.has(element)) {
          return;
        }
        const instanceMap = elementMap.get(element);
        instanceMap.delete(key);

        // free up element references if there are no instances left for an element
        if (instanceMap.size === 0) {
          elementMap.delete(element);
        }
      }
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/index.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    const MAX_UID = 1000000;
    const MILLISECONDS_MULTIPLIER = 1000;
    const TRANSITION_END = 'transitionend';

    /**
     * Properly escape IDs selectors to handle weird IDs
     * @param {string} selector
     * @returns {string}
     */
    const parseSelector = selector => {
      if (selector && window.CSS && window.CSS.escape) {
        // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
        selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
      }
      return selector;
    };

    // Shout-out Angus Croll (https://goo.gl/pxwQGp)
    const toType = object => {
      if (object === null || object === undefined) {
        return `${object}`;
      }
      return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
    };

    /**
     * Public Util API
     */

    const getUID = prefix => {
      do {
        prefix += Math.floor(Math.random() * MAX_UID);
      } while (document.getElementById(prefix));
      return prefix;
    };
    const getTransitionDurationFromElement = element => {
      if (!element) {
        return 0;
      }

      // Get transition-duration of the element
      let {
        transitionDuration,
        transitionDelay
      } = window.getComputedStyle(element);
      const floatTransitionDuration = Number.parseFloat(transitionDuration);
      const floatTransitionDelay = Number.parseFloat(transitionDelay);

      // Return 0 if element or transition duration is not found
      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      }

      // If multiple durations are defined, take the first
      transitionDuration = transitionDuration.split(',')[0];
      transitionDelay = transitionDelay.split(',')[0];
      return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
    };
    const triggerTransitionEnd = element => {
      element.dispatchEvent(new Event(TRANSITION_END));
    };
    const isElement$1 = object => {
      if (!object || typeof object !== 'object') {
        return false;
      }
      if (typeof object.jquery !== 'undefined') {
        object = object[0];
      }
      return typeof object.nodeType !== 'undefined';
    };
    const getElement = object => {
      // it's a jQuery object or a node element
      if (isElement$1(object)) {
        return object.jquery ? object[0] : object;
      }
      if (typeof object === 'string' && object.length > 0) {
        return document.querySelector(parseSelector(object));
      }
      return null;
    };
    const isVisible = element => {
      if (!isElement$1(element) || element.getClientRects().length === 0) {
        return false;
      }
      const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible';
      // Handle `details` element as its content may falsie appear visible when it is closed
      const closedDetails = element.closest('details:not([open])');
      if (!closedDetails) {
        return elementIsVisible;
      }
      if (closedDetails !== element) {
        const summary = element.closest('summary');
        if (summary && summary.parentNode !== closedDetails) {
          return false;
        }
        if (summary === null) {
          return false;
        }
      }
      return elementIsVisible;
    };
    const isDisabled = element => {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return true;
      }
      if (element.classList.contains('disabled')) {
        return true;
      }
      if (typeof element.disabled !== 'undefined') {
        return element.disabled;
      }
      return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
    };
    const findShadowRoot = element => {
      if (!document.documentElement.attachShadow) {
        return null;
      }

      // Can find the shadow root otherwise it'll return the document
      if (typeof element.getRootNode === 'function') {
        const root = element.getRootNode();
        return root instanceof ShadowRoot ? root : null;
      }
      if (element instanceof ShadowRoot) {
        return element;
      }

      // when we don't find a shadow root
      if (!element.parentNode) {
        return null;
      }
      return findShadowRoot(element.parentNode);
    };
    const noop = () => {};

    /**
     * Trick to restart an element's animation
     *
     * @param {HTMLElement} element
     * @return void
     *
     * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
     */
    const reflow = element => {
      element.offsetHeight; // eslint-disable-line no-unused-expressions
    };
    const getjQuery = () => {
      if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
        return window.jQuery;
      }
      return null;
    };
    const DOMContentLoadedCallbacks = [];
    const onDOMContentLoaded = callback => {
      if (document.readyState === 'loading') {
        // add listener on the first call when the document is in loading state
        if (!DOMContentLoadedCallbacks.length) {
          document.addEventListener('DOMContentLoaded', () => {
            for (const callback of DOMContentLoadedCallbacks) {
              callback();
            }
          });
        }
        DOMContentLoadedCallbacks.push(callback);
      } else {
        callback();
      }
    };
    const isRTL = () => document.documentElement.dir === 'rtl';
    const defineJQueryPlugin = plugin => {
      onDOMContentLoaded(() => {
        const $ = getjQuery();
        /* istanbul ignore if */
        if ($) {
          const name = plugin.NAME;
          const JQUERY_NO_CONFLICT = $.fn[name];
          $.fn[name] = plugin.jQueryInterface;
          $.fn[name].Constructor = plugin;
          $.fn[name].noConflict = () => {
            $.fn[name] = JQUERY_NO_CONFLICT;
            return plugin.jQueryInterface;
          };
        }
      });
    };
    const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
      return typeof possibleCallback === 'function' ? possibleCallback(...args) : defaultValue;
    };
    const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
      if (!waitForTransition) {
        execute(callback);
        return;
      }
      const durationPadding = 5;
      const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
      let called = false;
      const handler = ({
        target
      }) => {
        if (target !== transitionElement) {
          return;
        }
        called = true;
        transitionElement.removeEventListener(TRANSITION_END, handler);
        execute(callback);
      };
      transitionElement.addEventListener(TRANSITION_END, handler);
      setTimeout(() => {
        if (!called) {
          triggerTransitionEnd(transitionElement);
        }
      }, emulatedDuration);
    };

    /**
     * Return the previous/next element of a list.
     *
     * @param {array} list    The list of elements
     * @param activeElement   The active element
     * @param shouldGetNext   Choose to get next or previous element
     * @param isCycleAllowed
     * @return {Element|elem} The proper element
     */
    const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
      const listLength = list.length;
      let index = list.indexOf(activeElement);

      // if the element does not exist in the list return an element
      // depending on the direction and if cycle is allowed
      if (index === -1) {
        return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
      }
      index += shouldGetNext ? 1 : -1;
      if (isCycleAllowed) {
        index = (index + listLength) % listLength;
      }
      return list[Math.max(0, Math.min(index, listLength - 1))];
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap dom/event-handler.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
    const stripNameRegex = /\..*/;
    const stripUidRegex = /::\d+$/;
    const eventRegistry = {}; // Events storage
    let uidEvent = 1;
    const customEvents = {
      mouseenter: 'mouseover',
      mouseleave: 'mouseout'
    };
    const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);

    /**
     * Private methods
     */

    function makeEventUid(element, uid) {
      return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
    }
    function getElementEvents(element) {
      const uid = makeEventUid(element);
      element.uidEvent = uid;
      eventRegistry[uid] = eventRegistry[uid] || {};
      return eventRegistry[uid];
    }
    function bootstrapHandler(element, fn) {
      return function handler(event) {
        hydrateObj(event, {
          delegateTarget: element
        });
        if (handler.oneOff) {
          EventHandler.off(element, event.type, fn);
        }
        return fn.apply(element, [event]);
      };
    }
    function bootstrapDelegationHandler(element, selector, fn) {
      return function handler(event) {
        const domElements = element.querySelectorAll(selector);
        for (let {
          target
        } = event; target && target !== this; target = target.parentNode) {
          for (const domElement of domElements) {
            if (domElement !== target) {
              continue;
            }
            hydrateObj(event, {
              delegateTarget: target
            });
            if (handler.oneOff) {
              EventHandler.off(element, event.type, selector, fn);
            }
            return fn.apply(target, [event]);
          }
        }
      };
    }
    function findHandler(events, callable, delegationSelector = null) {
      return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
    }
    function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
      const isDelegated = typeof handler === 'string';
      // TODO: tooltip passes `false` instead of selector, so we need to check
      const callable = isDelegated ? delegationFunction : handler || delegationFunction;
      let typeEvent = getTypeEvent(originalTypeEvent);
      if (!nativeEvents.has(typeEvent)) {
        typeEvent = originalTypeEvent;
      }
      return [isDelegated, callable, typeEvent];
    }
    function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }
      let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);

      // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
      // this prevents the handler from being dispatched the same way as mouseover or mouseout does
      if (originalTypeEvent in customEvents) {
        const wrapFunction = fn => {
          return function (event) {
            if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
              return fn.call(this, event);
            }
          };
        };
        callable = wrapFunction(callable);
      }
      const events = getElementEvents(element);
      const handlers = events[typeEvent] || (events[typeEvent] = {});
      const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
      if (previousFunction) {
        previousFunction.oneOff = previousFunction.oneOff && oneOff;
        return;
      }
      const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
      const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
      fn.delegationSelector = isDelegated ? handler : null;
      fn.callable = callable;
      fn.oneOff = oneOff;
      fn.uidEvent = uid;
      handlers[uid] = fn;
      element.addEventListener(typeEvent, fn, isDelegated);
    }
    function removeHandler(element, events, typeEvent, handler, delegationSelector) {
      const fn = findHandler(events[typeEvent], handler, delegationSelector);
      if (!fn) {
        return;
      }
      element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
      delete events[typeEvent][fn.uidEvent];
    }
    function removeNamespacedHandlers(element, events, typeEvent, namespace) {
      const storeElementEvent = events[typeEvent] || {};
      for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
        if (handlerKey.includes(namespace)) {
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    }
    function getTypeEvent(event) {
      // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
      event = event.replace(stripNameRegex, '');
      return customEvents[event] || event;
    }
    const EventHandler = {
      on(element, event, handler, delegationFunction) {
        addHandler(element, event, handler, delegationFunction, false);
      },
      one(element, event, handler, delegationFunction) {
        addHandler(element, event, handler, delegationFunction, true);
      },
      off(element, originalTypeEvent, handler, delegationFunction) {
        if (typeof originalTypeEvent !== 'string' || !element) {
          return;
        }
        const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
        const inNamespace = typeEvent !== originalTypeEvent;
        const events = getElementEvents(element);
        const storeElementEvent = events[typeEvent] || {};
        const isNamespace = originalTypeEvent.startsWith('.');
        if (typeof callable !== 'undefined') {
          // Simplest case: handler is passed, remove that listener ONLY.
          if (!Object.keys(storeElementEvent).length) {
            return;
          }
          removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
          return;
        }
        if (isNamespace) {
          for (const elementEvent of Object.keys(events)) {
            removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
          }
        }
        for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
          const handlerKey = keyHandlers.replace(stripUidRegex, '');
          if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
            removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
          }
        }
      },
      trigger(element, event, args) {
        if (typeof event !== 'string' || !element) {
          return null;
        }
        const $ = getjQuery();
        const typeEvent = getTypeEvent(event);
        const inNamespace = event !== typeEvent;
        let jQueryEvent = null;
        let bubbles = true;
        let nativeDispatch = true;
        let defaultPrevented = false;
        if (inNamespace && $) {
          jQueryEvent = $.Event(event, args);
          $(element).trigger(jQueryEvent);
          bubbles = !jQueryEvent.isPropagationStopped();
          nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
          defaultPrevented = jQueryEvent.isDefaultPrevented();
        }
        const evt = hydrateObj(new Event(event, {
          bubbles,
          cancelable: true
        }), args);
        if (defaultPrevented) {
          evt.preventDefault();
        }
        if (nativeDispatch) {
          element.dispatchEvent(evt);
        }
        if (evt.defaultPrevented && jQueryEvent) {
          jQueryEvent.preventDefault();
        }
        return evt;
      }
    };
    function hydrateObj(obj, meta = {}) {
      for (const [key, value] of Object.entries(meta)) {
        try {
          obj[key] = value;
        } catch (_unused) {
          Object.defineProperty(obj, key, {
            configurable: true,
            get() {
              return value;
            }
          });
        }
      }
      return obj;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap dom/manipulator.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    function normalizeData(value) {
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
      if (value === Number(value).toString()) {
        return Number(value);
      }
      if (value === '' || value === 'null') {
        return null;
      }
      if (typeof value !== 'string') {
        return value;
      }
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (_unused) {
        return value;
      }
    }
    function normalizeDataKey(key) {
      return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
    }
    const Manipulator = {
      setDataAttribute(element, key, value) {
        element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
      },
      removeDataAttribute(element, key) {
        element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
      },
      getDataAttributes(element) {
        if (!element) {
          return {};
        }
        const attributes = {};
        const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));
        for (const key of bsKeys) {
          let pureKey = key.replace(/^bs/, '');
          pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
          attributes[pureKey] = normalizeData(element.dataset[key]);
        }
        return attributes;
      },
      getDataAttribute(element, key) {
        return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
      }
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/config.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Class definition
     */

    class Config {
      // Getters
      static get Default() {
        return {};
      }
      static get DefaultType() {
        return {};
      }
      static get NAME() {
        throw new Error('You have to implement the static method "NAME", for each component!');
      }
      _getConfig(config) {
        config = this._mergeConfigObj(config);
        config = this._configAfterMerge(config);
        this._typeCheckConfig(config);
        return config;
      }
      _configAfterMerge(config) {
        return config;
      }
      _mergeConfigObj(config, element) {
        const jsonConfig = isElement$1(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

        return {
          ...this.constructor.Default,
          ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
          ...(isElement$1(element) ? Manipulator.getDataAttributes(element) : {}),
          ...(typeof config === 'object' ? config : {})
        };
      }
      _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
        for (const [property, expectedTypes] of Object.entries(configTypes)) {
          const value = config[property];
          const valueType = isElement$1(value) ? 'element' : toType(value);
          if (!new RegExp(expectedTypes).test(valueType)) {
            throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
          }
        }
      }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap base-component.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const VERSION = '5.3.3';

    /**
     * Class definition
     */

    class BaseComponent extends Config {
      constructor(element, config) {
        super();
        element = getElement(element);
        if (!element) {
          return;
        }
        this._element = element;
        this._config = this._getConfig(config);
        Data.set(this._element, this.constructor.DATA_KEY, this);
      }

      // Public
      dispose() {
        Data.remove(this._element, this.constructor.DATA_KEY);
        EventHandler.off(this._element, this.constructor.EVENT_KEY);
        for (const propertyName of Object.getOwnPropertyNames(this)) {
          this[propertyName] = null;
        }
      }
      _queueCallback(callback, element, isAnimated = true) {
        executeAfterTransition(callback, element, isAnimated);
      }
      _getConfig(config) {
        config = this._mergeConfigObj(config, this._element);
        config = this._configAfterMerge(config);
        this._typeCheckConfig(config);
        return config;
      }

      // Static
      static getInstance(element) {
        return Data.get(getElement(element), this.DATA_KEY);
      }
      static getOrCreateInstance(element, config = {}) {
        return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
      }
      static get VERSION() {
        return VERSION;
      }
      static get DATA_KEY() {
        return `bs.${this.NAME}`;
      }
      static get EVENT_KEY() {
        return `.${this.DATA_KEY}`;
      }
      static eventName(name) {
        return `${name}${this.EVENT_KEY}`;
      }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap dom/selector-engine.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    const getSelector = element => {
      let selector = element.getAttribute('data-bs-target');
      if (!selector || selector === '#') {
        let hrefAttribute = element.getAttribute('href');

        // The only valid content that could double as a selector are IDs or classes,
        // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
        // `document.querySelector` will rightfully complain it is invalid.
        // See https://github.com/twbs/bootstrap/issues/32273
        if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
          return null;
        }

        // Just in case some CMS puts out a full URL with the anchor appended
        if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
          hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
        }
        selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
      }
      return selector ? selector.split(',').map(sel => parseSelector(sel)).join(',') : null;
    };
    const SelectorEngine = {
      find(selector, element = document.documentElement) {
        return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
      },
      findOne(selector, element = document.documentElement) {
        return Element.prototype.querySelector.call(element, selector);
      },
      children(element, selector) {
        return [].concat(...element.children).filter(child => child.matches(selector));
      },
      parents(element, selector) {
        const parents = [];
        let ancestor = element.parentNode.closest(selector);
        while (ancestor) {
          parents.push(ancestor);
          ancestor = ancestor.parentNode.closest(selector);
        }
        return parents;
      },
      prev(element, selector) {
        let previous = element.previousElementSibling;
        while (previous) {
          if (previous.matches(selector)) {
            return [previous];
          }
          previous = previous.previousElementSibling;
        }
        return [];
      },
      // TODO: this is now unused; remove later along with prev()
      next(element, selector) {
        let next = element.nextElementSibling;
        while (next) {
          if (next.matches(selector)) {
            return [next];
          }
          next = next.nextElementSibling;
        }
        return [];
      },
      focusableChildren(element) {
        const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
        return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
      },
      getSelectorFromElement(element) {
        const selector = getSelector(element);
        if (selector) {
          return SelectorEngine.findOne(selector) ? selector : null;
        }
        return null;
      },
      getElementFromSelector(element) {
        const selector = getSelector(element);
        return selector ? SelectorEngine.findOne(selector) : null;
      },
      getMultipleElementsFromSelector(element) {
        const selector = getSelector(element);
        return selector ? SelectorEngine.find(selector) : [];
      }
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/component-functions.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    const enableDismissTrigger = (component, method = 'hide') => {
      const clickEvent = `click.dismiss${component.EVENT_KEY}`;
      const name = component.NAME;
      EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
        if (['A', 'AREA'].includes(this.tagName)) {
          event.preventDefault();
        }
        if (isDisabled(this)) {
          return;
        }
        const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
        const instance = component.getOrCreateInstance(target);

        // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method
        instance[method]();
      });
    };

    /**
     * --------------------------------------------------------------------------
     * Bootstrap alert.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$f = 'alert';
    const DATA_KEY$a = 'bs.alert';
    const EVENT_KEY$b = `.${DATA_KEY$a}`;
    const EVENT_CLOSE = `close${EVENT_KEY$b}`;
    const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
    const CLASS_NAME_FADE$5 = 'fade';
    const CLASS_NAME_SHOW$8 = 'show';

    /**
     * Class definition
     */

    class Alert extends BaseComponent {
      // Getters
      static get NAME() {
        return NAME$f;
      }

      // Public
      close() {
        const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
        if (closeEvent.defaultPrevented) {
          return;
        }
        this._element.classList.remove(CLASS_NAME_SHOW$8);
        const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
        this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
      }

      // Private
      _destroyElement() {
        this._element.remove();
        EventHandler.trigger(this._element, EVENT_CLOSED);
        this.dispose();
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Alert.getOrCreateInstance(this);
          if (typeof config !== 'string') {
            return;
          }
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](this);
        });
      }
    }

    /**
     * Data API implementation
     */

    enableDismissTrigger(Alert, 'close');

    /**
     * jQuery
     */

    defineJQueryPlugin(Alert);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap button.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$e = 'button';
    const DATA_KEY$9 = 'bs.button';
    const EVENT_KEY$a = `.${DATA_KEY$9}`;
    const DATA_API_KEY$6 = '.data-api';
    const CLASS_NAME_ACTIVE$3 = 'active';
    const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
    const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;

    /**
     * Class definition
     */

    class Button extends BaseComponent {
      // Getters
      static get NAME() {
        return NAME$e;
      }

      // Public
      toggle() {
        // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
        this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Button.getOrCreateInstance(this);
          if (config === 'toggle') {
            data[config]();
          }
        });
      }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
      event.preventDefault();
      const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
      const data = Button.getOrCreateInstance(button);
      data.toggle();
    });

    /**
     * jQuery
     */

    defineJQueryPlugin(Button);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/swipe.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$d = 'swipe';
    const EVENT_KEY$9 = '.bs.swipe';
    const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
    const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
    const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
    const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
    const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
    const POINTER_TYPE_TOUCH = 'touch';
    const POINTER_TYPE_PEN = 'pen';
    const CLASS_NAME_POINTER_EVENT = 'pointer-event';
    const SWIPE_THRESHOLD = 40;
    const Default$c = {
      endCallback: null,
      leftCallback: null,
      rightCallback: null
    };
    const DefaultType$c = {
      endCallback: '(function|null)',
      leftCallback: '(function|null)',
      rightCallback: '(function|null)'
    };

    /**
     * Class definition
     */

    class Swipe extends Config {
      constructor(element, config) {
        super();
        this._element = element;
        if (!element || !Swipe.isSupported()) {
          return;
        }
        this._config = this._getConfig(config);
        this._deltaX = 0;
        this._supportPointerEvents = Boolean(window.PointerEvent);
        this._initEvents();
      }

      // Getters
      static get Default() {
        return Default$c;
      }
      static get DefaultType() {
        return DefaultType$c;
      }
      static get NAME() {
        return NAME$d;
      }

      // Public
      dispose() {
        EventHandler.off(this._element, EVENT_KEY$9);
      }

      // Private
      _start(event) {
        if (!this._supportPointerEvents) {
          this._deltaX = event.touches[0].clientX;
          return;
        }
        if (this._eventIsPointerPenTouch(event)) {
          this._deltaX = event.clientX;
        }
      }
      _end(event) {
        if (this._eventIsPointerPenTouch(event)) {
          this._deltaX = event.clientX - this._deltaX;
        }
        this._handleSwipe();
        execute(this._config.endCallback);
      }
      _move(event) {
        this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
      }
      _handleSwipe() {
        const absDeltaX = Math.abs(this._deltaX);
        if (absDeltaX <= SWIPE_THRESHOLD) {
          return;
        }
        const direction = absDeltaX / this._deltaX;
        this._deltaX = 0;
        if (!direction) {
          return;
        }
        execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
      }
      _initEvents() {
        if (this._supportPointerEvents) {
          EventHandler.on(this._element, EVENT_POINTERDOWN, event => this._start(event));
          EventHandler.on(this._element, EVENT_POINTERUP, event => this._end(event));
          this._element.classList.add(CLASS_NAME_POINTER_EVENT);
        } else {
          EventHandler.on(this._element, EVENT_TOUCHSTART, event => this._start(event));
          EventHandler.on(this._element, EVENT_TOUCHMOVE, event => this._move(event));
          EventHandler.on(this._element, EVENT_TOUCHEND, event => this._end(event));
        }
      }
      _eventIsPointerPenTouch(event) {
        return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
      }

      // Static
      static isSupported() {
        return 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
      }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap carousel.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$c = 'carousel';
    const DATA_KEY$8 = 'bs.carousel';
    const EVENT_KEY$8 = `.${DATA_KEY$8}`;
    const DATA_API_KEY$5 = '.data-api';
    const ARROW_LEFT_KEY$1 = 'ArrowLeft';
    const ARROW_RIGHT_KEY$1 = 'ArrowRight';
    const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

    const ORDER_NEXT = 'next';
    const ORDER_PREV = 'prev';
    const DIRECTION_LEFT = 'left';
    const DIRECTION_RIGHT = 'right';
    const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
    const EVENT_SLID = `slid${EVENT_KEY$8}`;
    const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
    const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
    const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
    const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
    const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
    const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
    const CLASS_NAME_CAROUSEL = 'carousel';
    const CLASS_NAME_ACTIVE$2 = 'active';
    const CLASS_NAME_SLIDE = 'slide';
    const CLASS_NAME_END = 'carousel-item-end';
    const CLASS_NAME_START = 'carousel-item-start';
    const CLASS_NAME_NEXT = 'carousel-item-next';
    const CLASS_NAME_PREV = 'carousel-item-prev';
    const SELECTOR_ACTIVE = '.active';
    const SELECTOR_ITEM = '.carousel-item';
    const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
    const SELECTOR_ITEM_IMG = '.carousel-item img';
    const SELECTOR_INDICATORS = '.carousel-indicators';
    const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
    const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
    const KEY_TO_DIRECTION = {
      [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
      [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
    };
    const Default$b = {
      interval: 5000,
      keyboard: true,
      pause: 'hover',
      ride: false,
      touch: true,
      wrap: true
    };
    const DefaultType$b = {
      interval: '(number|boolean)',
      // TODO:v6 remove boolean support
      keyboard: 'boolean',
      pause: '(string|boolean)',
      ride: '(boolean|string)',
      touch: 'boolean',
      wrap: 'boolean'
    };

    /**
     * Class definition
     */

    class Carousel extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._interval = null;
        this._activeElement = null;
        this._isSliding = false;
        this.touchTimeout = null;
        this._swipeHelper = null;
        this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
        this._addEventListeners();
        if (this._config.ride === CLASS_NAME_CAROUSEL) {
          this.cycle();
        }
      }

      // Getters
      static get Default() {
        return Default$b;
      }
      static get DefaultType() {
        return DefaultType$b;
      }
      static get NAME() {
        return NAME$c;
      }

      // Public
      next() {
        this._slide(ORDER_NEXT);
      }
      nextWhenVisible() {
        // FIXME TODO use `document.visibilityState`
        // Don't call next when the page isn't visible
        // or the carousel or its parent isn't visible
        if (!document.hidden && isVisible(this._element)) {
          this.next();
        }
      }
      prev() {
        this._slide(ORDER_PREV);
      }
      pause() {
        if (this._isSliding) {
          triggerTransitionEnd(this._element);
        }
        this._clearInterval();
      }
      cycle() {
        this._clearInterval();
        this._updateInterval();
        this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
      }
      _maybeEnableCycle() {
        if (!this._config.ride) {
          return;
        }
        if (this._isSliding) {
          EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
          return;
        }
        this.cycle();
      }
      to(index) {
        const items = this._getItems();
        if (index > items.length - 1 || index < 0) {
          return;
        }
        if (this._isSliding) {
          EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
          return;
        }
        const activeIndex = this._getItemIndex(this._getActive());
        if (activeIndex === index) {
          return;
        }
        const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
        this._slide(order, items[index]);
      }
      dispose() {
        if (this._swipeHelper) {
          this._swipeHelper.dispose();
        }
        super.dispose();
      }

      // Private
      _configAfterMerge(config) {
        config.defaultInterval = config.interval;
        return config;
      }
      _addEventListeners() {
        if (this._config.keyboard) {
          EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
        }
        if (this._config.pause === 'hover') {
          EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
          EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
        }
        if (this._config.touch && Swipe.isSupported()) {
          this._addTouchEventListeners();
        }
      }
      _addTouchEventListeners() {
        for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
          EventHandler.on(img, EVENT_DRAG_START, event => event.preventDefault());
        }
        const endCallBack = () => {
          if (this._config.pause !== 'hover') {
            return;
          }

          // If it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling

          this.pause();
          if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
          }
          this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
        };
        const swipeConfig = {
          leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
          rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
          endCallback: endCallBack
        };
        this._swipeHelper = new Swipe(this._element, swipeConfig);
      }
      _keydown(event) {
        if (/input|textarea/i.test(event.target.tagName)) {
          return;
        }
        const direction = KEY_TO_DIRECTION[event.key];
        if (direction) {
          event.preventDefault();
          this._slide(this._directionToOrder(direction));
        }
      }
      _getItemIndex(element) {
        return this._getItems().indexOf(element);
      }
      _setActiveIndicatorElement(index) {
        if (!this._indicatorsElement) {
          return;
        }
        const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
        activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
        activeIndicator.removeAttribute('aria-current');
        const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
        if (newActiveIndicator) {
          newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
          newActiveIndicator.setAttribute('aria-current', 'true');
        }
      }
      _updateInterval() {
        const element = this._activeElement || this._getActive();
        if (!element) {
          return;
        }
        const elementInterval = Number.parseInt(element.getAttribute('data-bs-interval'), 10);
        this._config.interval = elementInterval || this._config.defaultInterval;
      }
      _slide(order, element = null) {
        if (this._isSliding) {
          return;
        }
        const activeElement = this._getActive();
        const isNext = order === ORDER_NEXT;
        const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
        if (nextElement === activeElement) {
          return;
        }
        const nextElementIndex = this._getItemIndex(nextElement);
        const triggerEvent = eventName => {
          return EventHandler.trigger(this._element, eventName, {
            relatedTarget: nextElement,
            direction: this._orderToDirection(order),
            from: this._getItemIndex(activeElement),
            to: nextElementIndex
          });
        };
        const slideEvent = triggerEvent(EVENT_SLIDE);
        if (slideEvent.defaultPrevented) {
          return;
        }
        if (!activeElement || !nextElement) {
          // Some weirdness is happening, so we bail
          // TODO: change tests that use empty divs to avoid this check
          return;
        }
        const isCycling = Boolean(this._interval);
        this.pause();
        this._isSliding = true;
        this._setActiveIndicatorElement(nextElementIndex);
        this._activeElement = nextElement;
        const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
        const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
        nextElement.classList.add(orderClassName);
        reflow(nextElement);
        activeElement.classList.add(directionalClassName);
        nextElement.classList.add(directionalClassName);
        const completeCallBack = () => {
          nextElement.classList.remove(directionalClassName, orderClassName);
          nextElement.classList.add(CLASS_NAME_ACTIVE$2);
          activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
          this._isSliding = false;
          triggerEvent(EVENT_SLID);
        };
        this._queueCallback(completeCallBack, activeElement, this._isAnimated());
        if (isCycling) {
          this.cycle();
        }
      }
      _isAnimated() {
        return this._element.classList.contains(CLASS_NAME_SLIDE);
      }
      _getActive() {
        return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
      }
      _getItems() {
        return SelectorEngine.find(SELECTOR_ITEM, this._element);
      }
      _clearInterval() {
        if (this._interval) {
          clearInterval(this._interval);
          this._interval = null;
        }
      }
      _directionToOrder(direction) {
        if (isRTL()) {
          return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
        }
        return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
      }
      _orderToDirection(order) {
        if (isRTL()) {
          return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
        }
        return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Carousel.getOrCreateInstance(this, config);
          if (typeof config === 'number') {
            data.to(config);
            return;
          }
          if (typeof config === 'string') {
            if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
              throw new TypeError(`No method named "${config}"`);
            }
            data[config]();
          }
        });
      }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function (event) {
      const target = SelectorEngine.getElementFromSelector(this);
      if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
        return;
      }
      event.preventDefault();
      const carousel = Carousel.getOrCreateInstance(target);
      const slideIndex = this.getAttribute('data-bs-slide-to');
      if (slideIndex) {
        carousel.to(slideIndex);
        carousel._maybeEnableCycle();
        return;
      }
      if (Manipulator.getDataAttribute(this, 'slide') === 'next') {
        carousel.next();
        carousel._maybeEnableCycle();
        return;
      }
      carousel.prev();
      carousel._maybeEnableCycle();
    });
    EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
      const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
      for (const carousel of carousels) {
        Carousel.getOrCreateInstance(carousel);
      }
    });

    /**
     * jQuery
     */

    defineJQueryPlugin(Carousel);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap collapse.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$b = 'collapse';
    const DATA_KEY$7 = 'bs.collapse';
    const EVENT_KEY$7 = `.${DATA_KEY$7}`;
    const DATA_API_KEY$4 = '.data-api';
    const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
    const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
    const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
    const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
    const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
    const CLASS_NAME_SHOW$7 = 'show';
    const CLASS_NAME_COLLAPSE = 'collapse';
    const CLASS_NAME_COLLAPSING = 'collapsing';
    const CLASS_NAME_COLLAPSED = 'collapsed';
    const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
    const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
    const WIDTH = 'width';
    const HEIGHT = 'height';
    const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
    const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
    const Default$a = {
      parent: null,
      toggle: true
    };
    const DefaultType$a = {
      parent: '(null|element)',
      toggle: 'boolean'
    };

    /**
     * Class definition
     */

    class Collapse extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._isTransitioning = false;
        this._triggerArray = [];
        const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
        for (const elem of toggleList) {
          const selector = SelectorEngine.getSelectorFromElement(elem);
          const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);
          if (selector !== null && filterElement.length) {
            this._triggerArray.push(elem);
          }
        }
        this._initializeChildren();
        if (!this._config.parent) {
          this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
        }
        if (this._config.toggle) {
          this.toggle();
        }
      }

      // Getters
      static get Default() {
        return Default$a;
      }
      static get DefaultType() {
        return DefaultType$a;
      }
      static get NAME() {
        return NAME$b;
      }

      // Public
      toggle() {
        if (this._isShown()) {
          this.hide();
        } else {
          this.show();
        }
      }
      show() {
        if (this._isTransitioning || this._isShown()) {
          return;
        }
        let activeChildren = [];

        // find active children
        if (this._config.parent) {
          activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
            toggle: false
          }));
        }
        if (activeChildren.length && activeChildren[0]._isTransitioning) {
          return;
        }
        const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
        if (startEvent.defaultPrevented) {
          return;
        }
        for (const activeInstance of activeChildren) {
          activeInstance.hide();
        }
        const dimension = this._getDimension();
        this._element.classList.remove(CLASS_NAME_COLLAPSE);
        this._element.classList.add(CLASS_NAME_COLLAPSING);
        this._element.style[dimension] = 0;
        this._addAriaAndCollapsedClass(this._triggerArray, true);
        this._isTransitioning = true;
        const complete = () => {
          this._isTransitioning = false;
          this._element.classList.remove(CLASS_NAME_COLLAPSING);
          this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
          this._element.style[dimension] = '';
          EventHandler.trigger(this._element, EVENT_SHOWN$6);
        };
        const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
        const scrollSize = `scroll${capitalizedDimension}`;
        this._queueCallback(complete, this._element, true);
        this._element.style[dimension] = `${this._element[scrollSize]}px`;
      }
      hide() {
        if (this._isTransitioning || !this._isShown()) {
          return;
        }
        const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
        if (startEvent.defaultPrevented) {
          return;
        }
        const dimension = this._getDimension();
        this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
        reflow(this._element);
        this._element.classList.add(CLASS_NAME_COLLAPSING);
        this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
        for (const trigger of this._triggerArray) {
          const element = SelectorEngine.getElementFromSelector(trigger);
          if (element && !this._isShown(element)) {
            this._addAriaAndCollapsedClass([trigger], false);
          }
        }
        this._isTransitioning = true;
        const complete = () => {
          this._isTransitioning = false;
          this._element.classList.remove(CLASS_NAME_COLLAPSING);
          this._element.classList.add(CLASS_NAME_COLLAPSE);
          EventHandler.trigger(this._element, EVENT_HIDDEN$6);
        };
        this._element.style[dimension] = '';
        this._queueCallback(complete, this._element, true);
      }
      _isShown(element = this._element) {
        return element.classList.contains(CLASS_NAME_SHOW$7);
      }

      // Private
      _configAfterMerge(config) {
        config.toggle = Boolean(config.toggle); // Coerce string values
        config.parent = getElement(config.parent);
        return config;
      }
      _getDimension() {
        return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
      }
      _initializeChildren() {
        if (!this._config.parent) {
          return;
        }
        const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
        for (const element of children) {
          const selected = SelectorEngine.getElementFromSelector(element);
          if (selected) {
            this._addAriaAndCollapsedClass([element], this._isShown(selected));
          }
        }
      }
      _getFirstLevelChildren(selector) {
        const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
        // remove children if greater depth
        return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
      }
      _addAriaAndCollapsedClass(triggerArray, isOpen) {
        if (!triggerArray.length) {
          return;
        }
        for (const element of triggerArray) {
          element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
          element.setAttribute('aria-expanded', isOpen);
        }
      }

      // Static
      static jQueryInterface(config) {
        const _config = {};
        if (typeof config === 'string' && /show|hide/.test(config)) {
          _config.toggle = false;
        }
        return this.each(function () {
          const data = Collapse.getOrCreateInstance(this, _config);
          if (typeof config === 'string') {
            if (typeof data[config] === 'undefined') {
              throw new TypeError(`No method named "${config}"`);
            }
            data[config]();
          }
        });
      }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
      // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
      if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
        event.preventDefault();
      }
      for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
        Collapse.getOrCreateInstance(element, {
          toggle: false
        }).toggle();
      }
    });

    /**
     * jQuery
     */

    defineJQueryPlugin(Collapse);

    var top = 'top';
    var bottom = 'bottom';
    var right = 'right';
    var left = 'left';
    var auto = 'auto';
    var basePlacements = [top, bottom, right, left];
    var start = 'start';
    var end = 'end';
    var clippingParents = 'clippingParents';
    var viewport = 'viewport';
    var popper = 'popper';
    var reference = 'reference';
    var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
      return acc.concat([placement + "-" + start, placement + "-" + end]);
    }, []);
    var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
      return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
    }, []); // modifiers that need to read the DOM

    var beforeRead = 'beforeRead';
    var read = 'read';
    var afterRead = 'afterRead'; // pure-logic modifiers

    var beforeMain = 'beforeMain';
    var main = 'main';
    var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

    var beforeWrite = 'beforeWrite';
    var write = 'write';
    var afterWrite = 'afterWrite';
    var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

    function getNodeName(element) {
      return element ? (element.nodeName || '').toLowerCase() : null;
    }

    function getWindow(node) {
      if (node == null) {
        return window;
      }

      if (node.toString() !== '[object Window]') {
        var ownerDocument = node.ownerDocument;
        return ownerDocument ? ownerDocument.defaultView || window : window;
      }

      return node;
    }

    function isElement(node) {
      var OwnElement = getWindow(node).Element;
      return node instanceof OwnElement || node instanceof Element;
    }

    function isHTMLElement(node) {
      var OwnElement = getWindow(node).HTMLElement;
      return node instanceof OwnElement || node instanceof HTMLElement;
    }

    function isShadowRoot(node) {
      // IE 11 has no ShadowRoot
      if (typeof ShadowRoot === 'undefined') {
        return false;
      }

      var OwnElement = getWindow(node).ShadowRoot;
      return node instanceof OwnElement || node instanceof ShadowRoot;
    }

    // and applies them to the HTMLElements such as popper and arrow

    function applyStyles(_ref) {
      var state = _ref.state;
      Object.keys(state.elements).forEach(function (name) {
        var style = state.styles[name] || {};
        var attributes = state.attributes[name] || {};
        var element = state.elements[name]; // arrow is optional + virtual elements

        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        } // Flow doesn't support to extend this property, but it's the most
        // effective way to apply styles to an HTMLElement
        // $FlowFixMe[cannot-write]


        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (name) {
          var value = attributes[name];

          if (value === false) {
            element.removeAttribute(name);
          } else {
            element.setAttribute(name, value === true ? '' : value);
          }
        });
      });
    }

    function effect$2(_ref2) {
      var state = _ref2.state;
      var initialStyles = {
        popper: {
          position: state.options.strategy,
          left: '0',
          top: '0',
          margin: '0'
        },
        arrow: {
          position: 'absolute'
        },
        reference: {}
      };
      Object.assign(state.elements.popper.style, initialStyles.popper);
      state.styles = initialStyles;

      if (state.elements.arrow) {
        Object.assign(state.elements.arrow.style, initialStyles.arrow);
      }

      return function () {
        Object.keys(state.elements).forEach(function (name) {
          var element = state.elements[name];
          var attributes = state.attributes[name] || {};
          var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

          var style = styleProperties.reduce(function (style, property) {
            style[property] = '';
            return style;
          }, {}); // arrow is optional + virtual elements

          if (!isHTMLElement(element) || !getNodeName(element)) {
            return;
          }

          Object.assign(element.style, style);
          Object.keys(attributes).forEach(function (attribute) {
            element.removeAttribute(attribute);
          });
        });
      };
    } // eslint-disable-next-line import/no-unused-modules


    const applyStyles$1 = {
      name: 'applyStyles',
      enabled: true,
      phase: 'write',
      fn: applyStyles,
      effect: effect$2,
      requires: ['computeStyles']
    };

    function getBasePlacement(placement) {
      return placement.split('-')[0];
    }

    var max = Math.max;
    var min = Math.min;
    var round = Math.round;

    function getUAString() {
      var uaData = navigator.userAgentData;

      if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
        return uaData.brands.map(function (item) {
          return item.brand + "/" + item.version;
        }).join(' ');
      }

      return navigator.userAgent;
    }

    function isLayoutViewport() {
      return !/^((?!chrome|android).)*safari/i.test(getUAString());
    }

    function getBoundingClientRect(element, includeScale, isFixedStrategy) {
      if (includeScale === void 0) {
        includeScale = false;
      }

      if (isFixedStrategy === void 0) {
        isFixedStrategy = false;
      }

      var clientRect = element.getBoundingClientRect();
      var scaleX = 1;
      var scaleY = 1;

      if (includeScale && isHTMLElement(element)) {
        scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
        scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
      }

      var _ref = isElement(element) ? getWindow(element) : window,
          visualViewport = _ref.visualViewport;

      var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
      var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
      var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
      var width = clientRect.width / scaleX;
      var height = clientRect.height / scaleY;
      return {
        width: width,
        height: height,
        top: y,
        right: x + width,
        bottom: y + height,
        left: x,
        x: x,
        y: y
      };
    }

    // means it doesn't take into account transforms.

    function getLayoutRect(element) {
      var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
      // Fixes https://github.com/popperjs/popper-core/issues/1223

      var width = element.offsetWidth;
      var height = element.offsetHeight;

      if (Math.abs(clientRect.width - width) <= 1) {
        width = clientRect.width;
      }

      if (Math.abs(clientRect.height - height) <= 1) {
        height = clientRect.height;
      }

      return {
        x: element.offsetLeft,
        y: element.offsetTop,
        width: width,
        height: height
      };
    }

    function contains(parent, child) {
      var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

      if (parent.contains(child)) {
        return true;
      } // then fallback to custom implementation with Shadow DOM support
      else if (rootNode && isShadowRoot(rootNode)) {
          var next = child;

          do {
            if (next && parent.isSameNode(next)) {
              return true;
            } // $FlowFixMe[prop-missing]: need a better way to handle this...


            next = next.parentNode || next.host;
          } while (next);
        } // Give up, the result is false


      return false;
    }

    function getComputedStyle$1(element) {
      return getWindow(element).getComputedStyle(element);
    }

    function isTableElement(element) {
      return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
    }

    function getDocumentElement(element) {
      // $FlowFixMe[incompatible-return]: assume body is always available
      return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
      element.document) || window.document).documentElement;
    }

    function getParentNode(element) {
      if (getNodeName(element) === 'html') {
        return element;
      }

      return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
        // $FlowFixMe[incompatible-return]
        // $FlowFixMe[prop-missing]
        element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
        element.parentNode || ( // DOM Element detected
        isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
        // $FlowFixMe[incompatible-call]: HTMLElement is a Node
        getDocumentElement(element) // fallback

      );
    }

    function getTrueOffsetParent(element) {
      if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
      getComputedStyle$1(element).position === 'fixed') {
        return null;
      }

      return element.offsetParent;
    } // `.offsetParent` reports `null` for fixed elements, while absolute elements
    // return the containing block


    function getContainingBlock(element) {
      var isFirefox = /firefox/i.test(getUAString());
      var isIE = /Trident/i.test(getUAString());

      if (isIE && isHTMLElement(element)) {
        // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
        var elementCss = getComputedStyle$1(element);

        if (elementCss.position === 'fixed') {
          return null;
        }
      }

      var currentNode = getParentNode(element);

      if (isShadowRoot(currentNode)) {
        currentNode = currentNode.host;
      }

      while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
        var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
        // create a containing block.
        // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

        if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
          return currentNode;
        } else {
          currentNode = currentNode.parentNode;
        }
      }

      return null;
    } // Gets the closest ancestor positioned element. Handles some edge cases,
    // such as table ancestors and cross browser bugs.


    function getOffsetParent(element) {
      var window = getWindow(element);
      var offsetParent = getTrueOffsetParent(element);

      while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
        offsetParent = getTrueOffsetParent(offsetParent);
      }

      if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
        return window;
      }

      return offsetParent || getContainingBlock(element) || window;
    }

    function getMainAxisFromPlacement(placement) {
      return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
    }

    function within(min$1, value, max$1) {
      return max(min$1, min(value, max$1));
    }
    function withinMaxClamp(min, value, max) {
      var v = within(min, value, max);
      return v > max ? max : v;
    }

    function getFreshSideObject() {
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };
    }

    function mergePaddingObject(paddingObject) {
      return Object.assign({}, getFreshSideObject(), paddingObject);
    }

    function expandToHashMap(value, keys) {
      return keys.reduce(function (hashMap, key) {
        hashMap[key] = value;
        return hashMap;
      }, {});
    }

    var toPaddingObject = function toPaddingObject(padding, state) {
      padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
        placement: state.placement
      })) : padding;
      return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
    };

    function arrow(_ref) {
      var _state$modifiersData$;

      var state = _ref.state,
          name = _ref.name,
          options = _ref.options;
      var arrowElement = state.elements.arrow;
      var popperOffsets = state.modifiersData.popperOffsets;
      var basePlacement = getBasePlacement(state.placement);
      var axis = getMainAxisFromPlacement(basePlacement);
      var isVertical = [left, right].indexOf(basePlacement) >= 0;
      var len = isVertical ? 'height' : 'width';

      if (!arrowElement || !popperOffsets) {
        return;
      }

      var paddingObject = toPaddingObject(options.padding, state);
      var arrowRect = getLayoutRect(arrowElement);
      var minProp = axis === 'y' ? top : left;
      var maxProp = axis === 'y' ? bottom : right;
      var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
      var startDiff = popperOffsets[axis] - state.rects.reference[axis];
      var arrowOffsetParent = getOffsetParent(arrowElement);
      var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
      var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
      // outside of the popper bounds

      var min = paddingObject[minProp];
      var max = clientSize - arrowRect[len] - paddingObject[maxProp];
      var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
      var offset = within(min, center, max); // Prevents breaking syntax highlighting...

      var axisProp = axis;
      state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
    }

    function effect$1(_ref2) {
      var state = _ref2.state,
          options = _ref2.options;
      var _options$element = options.element,
          arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

      if (arrowElement == null) {
        return;
      } // CSS selector


      if (typeof arrowElement === 'string') {
        arrowElement = state.elements.popper.querySelector(arrowElement);

        if (!arrowElement) {
          return;
        }
      }

      if (!contains(state.elements.popper, arrowElement)) {
        return;
      }

      state.elements.arrow = arrowElement;
    } // eslint-disable-next-line import/no-unused-modules


    const arrow$1 = {
      name: 'arrow',
      enabled: true,
      phase: 'main',
      fn: arrow,
      effect: effect$1,
      requires: ['popperOffsets'],
      requiresIfExists: ['preventOverflow']
    };

    function getVariation(placement) {
      return placement.split('-')[1];
    }

    var unsetSides = {
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto'
    }; // Round the offsets to the nearest suitable subpixel based on the DPR.
    // Zooming can change the DPR, but it seems to report a value that will
    // cleanly divide the values into the appropriate subpixels.

    function roundOffsetsByDPR(_ref, win) {
      var x = _ref.x,
          y = _ref.y;
      var dpr = win.devicePixelRatio || 1;
      return {
        x: round(x * dpr) / dpr || 0,
        y: round(y * dpr) / dpr || 0
      };
    }

    function mapToStyles(_ref2) {
      var _Object$assign2;

      var popper = _ref2.popper,
          popperRect = _ref2.popperRect,
          placement = _ref2.placement,
          variation = _ref2.variation,
          offsets = _ref2.offsets,
          position = _ref2.position,
          gpuAcceleration = _ref2.gpuAcceleration,
          adaptive = _ref2.adaptive,
          roundOffsets = _ref2.roundOffsets,
          isFixed = _ref2.isFixed;
      var _offsets$x = offsets.x,
          x = _offsets$x === void 0 ? 0 : _offsets$x,
          _offsets$y = offsets.y,
          y = _offsets$y === void 0 ? 0 : _offsets$y;

      var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
        x: x,
        y: y
      }) : {
        x: x,
        y: y
      };

      x = _ref3.x;
      y = _ref3.y;
      var hasX = offsets.hasOwnProperty('x');
      var hasY = offsets.hasOwnProperty('y');
      var sideX = left;
      var sideY = top;
      var win = window;

      if (adaptive) {
        var offsetParent = getOffsetParent(popper);
        var heightProp = 'clientHeight';
        var widthProp = 'clientWidth';

        if (offsetParent === getWindow(popper)) {
          offsetParent = getDocumentElement(popper);

          if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
            heightProp = 'scrollHeight';
            widthProp = 'scrollWidth';
          }
        } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


        offsetParent = offsetParent;

        if (placement === top || (placement === left || placement === right) && variation === end) {
          sideY = bottom;
          var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
          offsetParent[heightProp];
          y -= offsetY - popperRect.height;
          y *= gpuAcceleration ? 1 : -1;
        }

        if (placement === left || (placement === top || placement === bottom) && variation === end) {
          sideX = right;
          var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
          offsetParent[widthProp];
          x -= offsetX - popperRect.width;
          x *= gpuAcceleration ? 1 : -1;
        }
      }

      var commonStyles = Object.assign({
        position: position
      }, adaptive && unsetSides);

      var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
        x: x,
        y: y
      }, getWindow(popper)) : {
        x: x,
        y: y
      };

      x = _ref4.x;
      y = _ref4.y;

      if (gpuAcceleration) {
        var _Object$assign;

        return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
      }

      return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
    }

    function computeStyles(_ref5) {
      var state = _ref5.state,
          options = _ref5.options;
      var _options$gpuAccelerat = options.gpuAcceleration,
          gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
          _options$adaptive = options.adaptive,
          adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
          _options$roundOffsets = options.roundOffsets,
          roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
      var commonStyles = {
        placement: getBasePlacement(state.placement),
        variation: getVariation(state.placement),
        popper: state.elements.popper,
        popperRect: state.rects.popper,
        gpuAcceleration: gpuAcceleration,
        isFixed: state.options.strategy === 'fixed'
      };

      if (state.modifiersData.popperOffsets != null) {
        state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
          offsets: state.modifiersData.popperOffsets,
          position: state.options.strategy,
          adaptive: adaptive,
          roundOffsets: roundOffsets
        })));
      }

      if (state.modifiersData.arrow != null) {
        state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
          offsets: state.modifiersData.arrow,
          position: 'absolute',
          adaptive: false,
          roundOffsets: roundOffsets
        })));
      }

      state.attributes.popper = Object.assign({}, state.attributes.popper, {
        'data-popper-placement': state.placement
      });
    } // eslint-disable-next-line import/no-unused-modules


    const computeStyles$1 = {
      name: 'computeStyles',
      enabled: true,
      phase: 'beforeWrite',
      fn: computeStyles,
      data: {}
    };

    var passive = {
      passive: true
    };

    function effect(_ref) {
      var state = _ref.state,
          instance = _ref.instance,
          options = _ref.options;
      var _options$scroll = options.scroll,
          scroll = _options$scroll === void 0 ? true : _options$scroll,
          _options$resize = options.resize,
          resize = _options$resize === void 0 ? true : _options$resize;
      var window = getWindow(state.elements.popper);
      var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.addEventListener('scroll', instance.update, passive);
        });
      }

      if (resize) {
        window.addEventListener('resize', instance.update, passive);
      }

      return function () {
        if (scroll) {
          scrollParents.forEach(function (scrollParent) {
            scrollParent.removeEventListener('scroll', instance.update, passive);
          });
        }

        if (resize) {
          window.removeEventListener('resize', instance.update, passive);
        }
      };
    } // eslint-disable-next-line import/no-unused-modules


    const eventListeners = {
      name: 'eventListeners',
      enabled: true,
      phase: 'write',
      fn: function fn() {},
      effect: effect,
      data: {}
    };

    var hash$1 = {
      left: 'right',
      right: 'left',
      bottom: 'top',
      top: 'bottom'
    };
    function getOppositePlacement(placement) {
      return placement.replace(/left|right|bottom|top/g, function (matched) {
        return hash$1[matched];
      });
    }

    var hash = {
      start: 'end',
      end: 'start'
    };
    function getOppositeVariationPlacement(placement) {
      return placement.replace(/start|end/g, function (matched) {
        return hash[matched];
      });
    }

    function getWindowScroll(node) {
      var win = getWindow(node);
      var scrollLeft = win.pageXOffset;
      var scrollTop = win.pageYOffset;
      return {
        scrollLeft: scrollLeft,
        scrollTop: scrollTop
      };
    }

    function getWindowScrollBarX(element) {
      // If <html> has a CSS width greater than the viewport, then this will be
      // incorrect for RTL.
      // Popper 1 is broken in this case and never had a bug report so let's assume
      // it's not an issue. I don't think anyone ever specifies width on <html>
      // anyway.
      // Browsers where the left scrollbar doesn't cause an issue report `0` for
      // this (e.g. Edge 2019, IE11, Safari)
      return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
    }

    function getViewportRect(element, strategy) {
      var win = getWindow(element);
      var html = getDocumentElement(element);
      var visualViewport = win.visualViewport;
      var width = html.clientWidth;
      var height = html.clientHeight;
      var x = 0;
      var y = 0;

      if (visualViewport) {
        width = visualViewport.width;
        height = visualViewport.height;
        var layoutViewport = isLayoutViewport();

        if (layoutViewport || !layoutViewport && strategy === 'fixed') {
          x = visualViewport.offsetLeft;
          y = visualViewport.offsetTop;
        }
      }

      return {
        width: width,
        height: height,
        x: x + getWindowScrollBarX(element),
        y: y
      };
    }

    // of the `<html>` and `<body>` rect bounds if horizontally scrollable

    function getDocumentRect(element) {
      var _element$ownerDocumen;

      var html = getDocumentElement(element);
      var winScroll = getWindowScroll(element);
      var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
      var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
      var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
      var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
      var y = -winScroll.scrollTop;

      if (getComputedStyle$1(body || html).direction === 'rtl') {
        x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
      }

      return {
        width: width,
        height: height,
        x: x,
        y: y
      };
    }

    function isScrollParent(element) {
      // Firefox wants us to check `-x` and `-y` variations as well
      var _getComputedStyle = getComputedStyle$1(element),
          overflow = _getComputedStyle.overflow,
          overflowX = _getComputedStyle.overflowX,
          overflowY = _getComputedStyle.overflowY;

      return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
    }

    function getScrollParent(node) {
      if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
        // $FlowFixMe[incompatible-return]: assume body is always available
        return node.ownerDocument.body;
      }

      if (isHTMLElement(node) && isScrollParent(node)) {
        return node;
      }

      return getScrollParent(getParentNode(node));
    }

    /*
    given a DOM element, return the list of all scroll parents, up the list of ancesors
    until we get to the top window object. This list is what we attach scroll listeners
    to, because if any of these parent elements scroll, we'll need to re-calculate the
    reference element's position.
    */

    function listScrollParents(element, list) {
      var _element$ownerDocumen;

      if (list === void 0) {
        list = [];
      }

      var scrollParent = getScrollParent(element);
      var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
      var win = getWindow(scrollParent);
      var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
      var updatedList = list.concat(target);
      return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
      updatedList.concat(listScrollParents(getParentNode(target)));
    }

    function rectToClientRect(rect) {
      return Object.assign({}, rect, {
        left: rect.x,
        top: rect.y,
        right: rect.x + rect.width,
        bottom: rect.y + rect.height
      });
    }

    function getInnerBoundingClientRect(element, strategy) {
      var rect = getBoundingClientRect(element, false, strategy === 'fixed');
      rect.top = rect.top + element.clientTop;
      rect.left = rect.left + element.clientLeft;
      rect.bottom = rect.top + element.clientHeight;
      rect.right = rect.left + element.clientWidth;
      rect.width = element.clientWidth;
      rect.height = element.clientHeight;
      rect.x = rect.left;
      rect.y = rect.top;
      return rect;
    }

    function getClientRectFromMixedType(element, clippingParent, strategy) {
      return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
    } // A "clipping parent" is an overflowable container with the characteristic of
    // clipping (or hiding) overflowing elements with a position different from
    // `initial`


    function getClippingParents(element) {
      var clippingParents = listScrollParents(getParentNode(element));
      var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
      var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

      if (!isElement(clipperElement)) {
        return [];
      } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


      return clippingParents.filter(function (clippingParent) {
        return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
      });
    } // Gets the maximum area that the element is visible in due to any number of
    // clipping parents


    function getClippingRect(element, boundary, rootBoundary, strategy) {
      var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
      var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
      var firstClippingParent = clippingParents[0];
      var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
        var rect = getClientRectFromMixedType(element, clippingParent, strategy);
        accRect.top = max(rect.top, accRect.top);
        accRect.right = min(rect.right, accRect.right);
        accRect.bottom = min(rect.bottom, accRect.bottom);
        accRect.left = max(rect.left, accRect.left);
        return accRect;
      }, getClientRectFromMixedType(element, firstClippingParent, strategy));
      clippingRect.width = clippingRect.right - clippingRect.left;
      clippingRect.height = clippingRect.bottom - clippingRect.top;
      clippingRect.x = clippingRect.left;
      clippingRect.y = clippingRect.top;
      return clippingRect;
    }

    function computeOffsets(_ref) {
      var reference = _ref.reference,
          element = _ref.element,
          placement = _ref.placement;
      var basePlacement = placement ? getBasePlacement(placement) : null;
      var variation = placement ? getVariation(placement) : null;
      var commonX = reference.x + reference.width / 2 - element.width / 2;
      var commonY = reference.y + reference.height / 2 - element.height / 2;
      var offsets;

      switch (basePlacement) {
        case top:
          offsets = {
            x: commonX,
            y: reference.y - element.height
          };
          break;

        case bottom:
          offsets = {
            x: commonX,
            y: reference.y + reference.height
          };
          break;

        case right:
          offsets = {
            x: reference.x + reference.width,
            y: commonY
          };
          break;

        case left:
          offsets = {
            x: reference.x - element.width,
            y: commonY
          };
          break;

        default:
          offsets = {
            x: reference.x,
            y: reference.y
          };
      }

      var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

      if (mainAxis != null) {
        var len = mainAxis === 'y' ? 'height' : 'width';

        switch (variation) {
          case start:
            offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
            break;

          case end:
            offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
            break;
        }
      }

      return offsets;
    }

    function detectOverflow(state, options) {
      if (options === void 0) {
        options = {};
      }

      var _options = options,
          _options$placement = _options.placement,
          placement = _options$placement === void 0 ? state.placement : _options$placement,
          _options$strategy = _options.strategy,
          strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
          _options$boundary = _options.boundary,
          boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
          _options$rootBoundary = _options.rootBoundary,
          rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
          _options$elementConte = _options.elementContext,
          elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
          _options$altBoundary = _options.altBoundary,
          altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
          _options$padding = _options.padding,
          padding = _options$padding === void 0 ? 0 : _options$padding;
      var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
      var altContext = elementContext === popper ? reference : popper;
      var popperRect = state.rects.popper;
      var element = state.elements[altBoundary ? altContext : elementContext];
      var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
      var referenceClientRect = getBoundingClientRect(state.elements.reference);
      var popperOffsets = computeOffsets({
        reference: referenceClientRect,
        element: popperRect,
        placement: placement
      });
      var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
      var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
      // 0 or negative = within the clipping rect

      var overflowOffsets = {
        top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
        bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
        left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
        right: elementClientRect.right - clippingClientRect.right + paddingObject.right
      };
      var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

      if (elementContext === popper && offsetData) {
        var offset = offsetData[placement];
        Object.keys(overflowOffsets).forEach(function (key) {
          var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
          var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
          overflowOffsets[key] += offset[axis] * multiply;
        });
      }

      return overflowOffsets;
    }

    function computeAutoPlacement(state, options) {
      if (options === void 0) {
        options = {};
      }

      var _options = options,
          placement = _options.placement,
          boundary = _options.boundary,
          rootBoundary = _options.rootBoundary,
          padding = _options.padding,
          flipVariations = _options.flipVariations,
          _options$allowedAutoP = _options.allowedAutoPlacements,
          allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
      var variation = getVariation(placement);
      var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
        return getVariation(placement) === variation;
      }) : basePlacements;
      var allowedPlacements = placements$1.filter(function (placement) {
        return allowedAutoPlacements.indexOf(placement) >= 0;
      });

      if (allowedPlacements.length === 0) {
        allowedPlacements = placements$1;
      } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


      var overflows = allowedPlacements.reduce(function (acc, placement) {
        acc[placement] = detectOverflow(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          padding: padding
        })[getBasePlacement(placement)];
        return acc;
      }, {});
      return Object.keys(overflows).sort(function (a, b) {
        return overflows[a] - overflows[b];
      });
    }

    function getExpandedFallbackPlacements(placement) {
      if (getBasePlacement(placement) === auto) {
        return [];
      }

      var oppositePlacement = getOppositePlacement(placement);
      return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
    }

    function flip(_ref) {
      var state = _ref.state,
          options = _ref.options,
          name = _ref.name;

      if (state.modifiersData[name]._skip) {
        return;
      }

      var _options$mainAxis = options.mainAxis,
          checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
          _options$altAxis = options.altAxis,
          checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
          specifiedFallbackPlacements = options.fallbackPlacements,
          padding = options.padding,
          boundary = options.boundary,
          rootBoundary = options.rootBoundary,
          altBoundary = options.altBoundary,
          _options$flipVariatio = options.flipVariations,
          flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
          allowedAutoPlacements = options.allowedAutoPlacements;
      var preferredPlacement = state.options.placement;
      var basePlacement = getBasePlacement(preferredPlacement);
      var isBasePlacement = basePlacement === preferredPlacement;
      var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
      var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
        return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          padding: padding,
          flipVariations: flipVariations,
          allowedAutoPlacements: allowedAutoPlacements
        }) : placement);
      }, []);
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var checksMap = new Map();
      var makeFallbackChecks = true;
      var firstFittingPlacement = placements[0];

      for (var i = 0; i < placements.length; i++) {
        var placement = placements[i];

        var _basePlacement = getBasePlacement(placement);

        var isStartVariation = getVariation(placement) === start;
        var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
        var len = isVertical ? 'width' : 'height';
        var overflow = detectOverflow(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          altBoundary: altBoundary,
          padding: padding
        });
        var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

        if (referenceRect[len] > popperRect[len]) {
          mainVariationSide = getOppositePlacement(mainVariationSide);
        }

        var altVariationSide = getOppositePlacement(mainVariationSide);
        var checks = [];

        if (checkMainAxis) {
          checks.push(overflow[_basePlacement] <= 0);
        }

        if (checkAltAxis) {
          checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
        }

        if (checks.every(function (check) {
          return check;
        })) {
          firstFittingPlacement = placement;
          makeFallbackChecks = false;
          break;
        }

        checksMap.set(placement, checks);
      }

      if (makeFallbackChecks) {
        // `2` may be desired in some cases – research later
        var numberOfChecks = flipVariations ? 3 : 1;

        var _loop = function _loop(_i) {
          var fittingPlacement = placements.find(function (placement) {
            var checks = checksMap.get(placement);

            if (checks) {
              return checks.slice(0, _i).every(function (check) {
                return check;
              });
            }
          });

          if (fittingPlacement) {
            firstFittingPlacement = fittingPlacement;
            return "break";
          }
        };

        for (var _i = numberOfChecks; _i > 0; _i--) {
          var _ret = _loop(_i);

          if (_ret === "break") break;
        }
      }

      if (state.placement !== firstFittingPlacement) {
        state.modifiersData[name]._skip = true;
        state.placement = firstFittingPlacement;
        state.reset = true;
      }
    } // eslint-disable-next-line import/no-unused-modules


    const flip$1 = {
      name: 'flip',
      enabled: true,
      phase: 'main',
      fn: flip,
      requiresIfExists: ['offset'],
      data: {
        _skip: false
      }
    };

    function getSideOffsets(overflow, rect, preventedOffsets) {
      if (preventedOffsets === void 0) {
        preventedOffsets = {
          x: 0,
          y: 0
        };
      }

      return {
        top: overflow.top - rect.height - preventedOffsets.y,
        right: overflow.right - rect.width + preventedOffsets.x,
        bottom: overflow.bottom - rect.height + preventedOffsets.y,
        left: overflow.left - rect.width - preventedOffsets.x
      };
    }

    function isAnySideFullyClipped(overflow) {
      return [top, right, bottom, left].some(function (side) {
        return overflow[side] >= 0;
      });
    }

    function hide(_ref) {
      var state = _ref.state,
          name = _ref.name;
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var preventedOffsets = state.modifiersData.preventOverflow;
      var referenceOverflow = detectOverflow(state, {
        elementContext: 'reference'
      });
      var popperAltOverflow = detectOverflow(state, {
        altBoundary: true
      });
      var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
      var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
      var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
      var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
      state.modifiersData[name] = {
        referenceClippingOffsets: referenceClippingOffsets,
        popperEscapeOffsets: popperEscapeOffsets,
        isReferenceHidden: isReferenceHidden,
        hasPopperEscaped: hasPopperEscaped
      };
      state.attributes.popper = Object.assign({}, state.attributes.popper, {
        'data-popper-reference-hidden': isReferenceHidden,
        'data-popper-escaped': hasPopperEscaped
      });
    } // eslint-disable-next-line import/no-unused-modules


    const hide$1 = {
      name: 'hide',
      enabled: true,
      phase: 'main',
      requiresIfExists: ['preventOverflow'],
      fn: hide
    };

    function distanceAndSkiddingToXY(placement, rects, offset) {
      var basePlacement = getBasePlacement(placement);
      var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

      var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
        placement: placement
      })) : offset,
          skidding = _ref[0],
          distance = _ref[1];

      skidding = skidding || 0;
      distance = (distance || 0) * invertDistance;
      return [left, right].indexOf(basePlacement) >= 0 ? {
        x: distance,
        y: skidding
      } : {
        x: skidding,
        y: distance
      };
    }

    function offset(_ref2) {
      var state = _ref2.state,
          options = _ref2.options,
          name = _ref2.name;
      var _options$offset = options.offset,
          offset = _options$offset === void 0 ? [0, 0] : _options$offset;
      var data = placements.reduce(function (acc, placement) {
        acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
        return acc;
      }, {});
      var _data$state$placement = data[state.placement],
          x = _data$state$placement.x,
          y = _data$state$placement.y;

      if (state.modifiersData.popperOffsets != null) {
        state.modifiersData.popperOffsets.x += x;
        state.modifiersData.popperOffsets.y += y;
      }

      state.modifiersData[name] = data;
    } // eslint-disable-next-line import/no-unused-modules


    const offset$1 = {
      name: 'offset',
      enabled: true,
      phase: 'main',
      requires: ['popperOffsets'],
      fn: offset
    };

    function popperOffsets(_ref) {
      var state = _ref.state,
          name = _ref.name;
      // Offsets are the actual position the popper needs to have to be
      // properly positioned near its reference element
      // This is the most basic placement, and will be adjusted by
      // the modifiers in the next step
      state.modifiersData[name] = computeOffsets({
        reference: state.rects.reference,
        element: state.rects.popper,
        placement: state.placement
      });
    } // eslint-disable-next-line import/no-unused-modules


    const popperOffsets$1 = {
      name: 'popperOffsets',
      enabled: true,
      phase: 'read',
      fn: popperOffsets,
      data: {}
    };

    function getAltAxis(axis) {
      return axis === 'x' ? 'y' : 'x';
    }

    function preventOverflow(_ref) {
      var state = _ref.state,
          options = _ref.options,
          name = _ref.name;
      var _options$mainAxis = options.mainAxis,
          checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
          _options$altAxis = options.altAxis,
          checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
          boundary = options.boundary,
          rootBoundary = options.rootBoundary,
          altBoundary = options.altBoundary,
          padding = options.padding,
          _options$tether = options.tether,
          tether = _options$tether === void 0 ? true : _options$tether,
          _options$tetherOffset = options.tetherOffset,
          tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
      var overflow = detectOverflow(state, {
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding,
        altBoundary: altBoundary
      });
      var basePlacement = getBasePlacement(state.placement);
      var variation = getVariation(state.placement);
      var isBasePlacement = !variation;
      var mainAxis = getMainAxisFromPlacement(basePlacement);
      var altAxis = getAltAxis(mainAxis);
      var popperOffsets = state.modifiersData.popperOffsets;
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
        placement: state.placement
      })) : tetherOffset;
      var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
        mainAxis: tetherOffsetValue,
        altAxis: tetherOffsetValue
      } : Object.assign({
        mainAxis: 0,
        altAxis: 0
      }, tetherOffsetValue);
      var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
      var data = {
        x: 0,
        y: 0
      };

      if (!popperOffsets) {
        return;
      }

      if (checkMainAxis) {
        var _offsetModifierState$;

        var mainSide = mainAxis === 'y' ? top : left;
        var altSide = mainAxis === 'y' ? bottom : right;
        var len = mainAxis === 'y' ? 'height' : 'width';
        var offset = popperOffsets[mainAxis];
        var min$1 = offset + overflow[mainSide];
        var max$1 = offset - overflow[altSide];
        var additive = tether ? -popperRect[len] / 2 : 0;
        var minLen = variation === start ? referenceRect[len] : popperRect[len];
        var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
        // outside the reference bounds

        var arrowElement = state.elements.arrow;
        var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
          width: 0,
          height: 0
        };
        var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
        var arrowPaddingMin = arrowPaddingObject[mainSide];
        var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
        // to include its full size in the calculation. If the reference is small
        // and near the edge of a boundary, the popper can overflow even if the
        // reference is not overflowing as well (e.g. virtual elements with no
        // width or height)

        var arrowLen = within(0, referenceRect[len], arrowRect[len]);
        var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
        var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
        var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
        var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
        var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
        var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
        var tetherMax = offset + maxOffset - offsetModifierValue;
        var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
        popperOffsets[mainAxis] = preventedOffset;
        data[mainAxis] = preventedOffset - offset;
      }

      if (checkAltAxis) {
        var _offsetModifierState$2;

        var _mainSide = mainAxis === 'x' ? top : left;

        var _altSide = mainAxis === 'x' ? bottom : right;

        var _offset = popperOffsets[altAxis];

        var _len = altAxis === 'y' ? 'height' : 'width';

        var _min = _offset + overflow[_mainSide];

        var _max = _offset - overflow[_altSide];

        var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

        var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

        var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

        var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

        var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

        popperOffsets[altAxis] = _preventedOffset;
        data[altAxis] = _preventedOffset - _offset;
      }

      state.modifiersData[name] = data;
    } // eslint-disable-next-line import/no-unused-modules


    const preventOverflow$1 = {
      name: 'preventOverflow',
      enabled: true,
      phase: 'main',
      fn: preventOverflow,
      requiresIfExists: ['offset']
    };

    function getHTMLElementScroll(element) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }

    function getNodeScroll(node) {
      if (node === getWindow(node) || !isHTMLElement(node)) {
        return getWindowScroll(node);
      } else {
        return getHTMLElementScroll(node);
      }
    }

    function isElementScaled(element) {
      var rect = element.getBoundingClientRect();
      var scaleX = round(rect.width) / element.offsetWidth || 1;
      var scaleY = round(rect.height) / element.offsetHeight || 1;
      return scaleX !== 1 || scaleY !== 1;
    } // Returns the composite rect of an element relative to its offsetParent.
    // Composite means it takes into account transforms as well as layout.


    function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
      if (isFixed === void 0) {
        isFixed = false;
      }

      var isOffsetParentAnElement = isHTMLElement(offsetParent);
      var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
      var documentElement = getDocumentElement(offsetParent);
      var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
      var scroll = {
        scrollLeft: 0,
        scrollTop: 0
      };
      var offsets = {
        x: 0,
        y: 0
      };

      if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
        if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
        isScrollParent(documentElement)) {
          scroll = getNodeScroll(offsetParent);
        }

        if (isHTMLElement(offsetParent)) {
          offsets = getBoundingClientRect(offsetParent, true);
          offsets.x += offsetParent.clientLeft;
          offsets.y += offsetParent.clientTop;
        } else if (documentElement) {
          offsets.x = getWindowScrollBarX(documentElement);
        }
      }

      return {
        x: rect.left + scroll.scrollLeft - offsets.x,
        y: rect.top + scroll.scrollTop - offsets.y,
        width: rect.width,
        height: rect.height
      };
    }

    function order(modifiers) {
      var map = new Map();
      var visited = new Set();
      var result = [];
      modifiers.forEach(function (modifier) {
        map.set(modifier.name, modifier);
      }); // On visiting object, check for its dependencies and visit them recursively

      function sort(modifier) {
        visited.add(modifier.name);
        var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
        requires.forEach(function (dep) {
          if (!visited.has(dep)) {
            var depModifier = map.get(dep);

            if (depModifier) {
              sort(depModifier);
            }
          }
        });
        result.push(modifier);
      }

      modifiers.forEach(function (modifier) {
        if (!visited.has(modifier.name)) {
          // check for visited object
          sort(modifier);
        }
      });
      return result;
    }

    function orderModifiers(modifiers) {
      // order based on dependencies
      var orderedModifiers = order(modifiers); // order based on phase

      return modifierPhases.reduce(function (acc, phase) {
        return acc.concat(orderedModifiers.filter(function (modifier) {
          return modifier.phase === phase;
        }));
      }, []);
    }

    function debounce(fn) {
      var pending;
      return function () {
        if (!pending) {
          pending = new Promise(function (resolve) {
            Promise.resolve().then(function () {
              pending = undefined;
              resolve(fn());
            });
          });
        }

        return pending;
      };
    }

    function mergeByName(modifiers) {
      var merged = modifiers.reduce(function (merged, current) {
        var existing = merged[current.name];
        merged[current.name] = existing ? Object.assign({}, existing, current, {
          options: Object.assign({}, existing.options, current.options),
          data: Object.assign({}, existing.data, current.data)
        }) : current;
        return merged;
      }, {}); // IE11 does not support Object.values

      return Object.keys(merged).map(function (key) {
        return merged[key];
      });
    }

    var DEFAULT_OPTIONS = {
      placement: 'bottom',
      modifiers: [],
      strategy: 'absolute'
    };

    function areValidElements() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return !args.some(function (element) {
        return !(element && typeof element.getBoundingClientRect === 'function');
      });
    }

    function popperGenerator(generatorOptions) {
      if (generatorOptions === void 0) {
        generatorOptions = {};
      }

      var _generatorOptions = generatorOptions,
          _generatorOptions$def = _generatorOptions.defaultModifiers,
          defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
          _generatorOptions$def2 = _generatorOptions.defaultOptions,
          defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
      return function createPopper(reference, popper, options) {
        if (options === void 0) {
          options = defaultOptions;
        }

        var state = {
          placement: 'bottom',
          orderedModifiers: [],
          options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
          modifiersData: {},
          elements: {
            reference: reference,
            popper: popper
          },
          attributes: {},
          styles: {}
        };
        var effectCleanupFns = [];
        var isDestroyed = false;
        var instance = {
          state: state,
          setOptions: function setOptions(setOptionsAction) {
            var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
            cleanupModifierEffects();
            state.options = Object.assign({}, defaultOptions, state.options, options);
            state.scrollParents = {
              reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
              popper: listScrollParents(popper)
            }; // Orders the modifiers based on their dependencies and `phase`
            // properties

            var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

            state.orderedModifiers = orderedModifiers.filter(function (m) {
              return m.enabled;
            });
            runModifierEffects();
            return instance.update();
          },
          // Sync update – it will always be executed, even if not necessary. This
          // is useful for low frequency updates where sync behavior simplifies the
          // logic.
          // For high frequency updates (e.g. `resize` and `scroll` events), always
          // prefer the async Popper#update method
          forceUpdate: function forceUpdate() {
            if (isDestroyed) {
              return;
            }

            var _state$elements = state.elements,
                reference = _state$elements.reference,
                popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
            // anymore

            if (!areValidElements(reference, popper)) {
              return;
            } // Store the reference and popper rects to be read by modifiers


            state.rects = {
              reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
              popper: getLayoutRect(popper)
            }; // Modifiers have the ability to reset the current update cycle. The
            // most common use case for this is the `flip` modifier changing the
            // placement, which then needs to re-run all the modifiers, because the
            // logic was previously ran for the previous placement and is therefore
            // stale/incorrect

            state.reset = false;
            state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
            // is filled with the initial data specified by the modifier. This means
            // it doesn't persist and is fresh on each update.
            // To ensure persistent data, use `${name}#persistent`

            state.orderedModifiers.forEach(function (modifier) {
              return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
            });

            for (var index = 0; index < state.orderedModifiers.length; index++) {
              if (state.reset === true) {
                state.reset = false;
                index = -1;
                continue;
              }

              var _state$orderedModifie = state.orderedModifiers[index],
                  fn = _state$orderedModifie.fn,
                  _state$orderedModifie2 = _state$orderedModifie.options,
                  _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
                  name = _state$orderedModifie.name;

              if (typeof fn === 'function') {
                state = fn({
                  state: state,
                  options: _options,
                  name: name,
                  instance: instance
                }) || state;
              }
            }
          },
          // Async and optimistically optimized update – it will not be executed if
          // not necessary (debounced to run at most once-per-tick)
          update: debounce(function () {
            return new Promise(function (resolve) {
              instance.forceUpdate();
              resolve(state);
            });
          }),
          destroy: function destroy() {
            cleanupModifierEffects();
            isDestroyed = true;
          }
        };

        if (!areValidElements(reference, popper)) {
          return instance;
        }

        instance.setOptions(options).then(function (state) {
          if (!isDestroyed && options.onFirstUpdate) {
            options.onFirstUpdate(state);
          }
        }); // Modifiers have the ability to execute arbitrary code before the first
        // update cycle runs. They will be executed in the same order as the update
        // cycle. This is useful when a modifier adds some persistent data that
        // other modifiers need to use, but the modifier is run after the dependent
        // one.

        function runModifierEffects() {
          state.orderedModifiers.forEach(function (_ref) {
            var name = _ref.name,
                _ref$options = _ref.options,
                options = _ref$options === void 0 ? {} : _ref$options,
                effect = _ref.effect;

            if (typeof effect === 'function') {
              var cleanupFn = effect({
                state: state,
                name: name,
                instance: instance,
                options: options
              });

              var noopFn = function noopFn() {};

              effectCleanupFns.push(cleanupFn || noopFn);
            }
          });
        }

        function cleanupModifierEffects() {
          effectCleanupFns.forEach(function (fn) {
            return fn();
          });
          effectCleanupFns = [];
        }

        return instance;
      };
    }
    var createPopper$2 = /*#__PURE__*/popperGenerator(); // eslint-disable-next-line import/no-unused-modules

    var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
    var createPopper$1 = /*#__PURE__*/popperGenerator({
      defaultModifiers: defaultModifiers$1
    }); // eslint-disable-next-line import/no-unused-modules

    var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
    var createPopper = /*#__PURE__*/popperGenerator({
      defaultModifiers: defaultModifiers
    }); // eslint-disable-next-line import/no-unused-modules

    const Popper = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
      __proto__: null,
      afterMain,
      afterRead,
      afterWrite,
      applyStyles: applyStyles$1,
      arrow: arrow$1,
      auto,
      basePlacements,
      beforeMain,
      beforeRead,
      beforeWrite,
      bottom,
      clippingParents,
      computeStyles: computeStyles$1,
      createPopper,
      createPopperBase: createPopper$2,
      createPopperLite: createPopper$1,
      detectOverflow,
      end,
      eventListeners,
      flip: flip$1,
      hide: hide$1,
      left,
      main,
      modifierPhases,
      offset: offset$1,
      placements,
      popper,
      popperGenerator,
      popperOffsets: popperOffsets$1,
      preventOverflow: preventOverflow$1,
      read,
      reference,
      right,
      start,
      top,
      variationPlacements,
      viewport,
      write
    }, Symbol.toStringTag, { value: 'Module' }));

    /**
     * --------------------------------------------------------------------------
     * Bootstrap dropdown.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$a = 'dropdown';
    const DATA_KEY$6 = 'bs.dropdown';
    const EVENT_KEY$6 = `.${DATA_KEY$6}`;
    const DATA_API_KEY$3 = '.data-api';
    const ESCAPE_KEY$2 = 'Escape';
    const TAB_KEY$1 = 'Tab';
    const ARROW_UP_KEY$1 = 'ArrowUp';
    const ARROW_DOWN_KEY$1 = 'ArrowDown';
    const RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button

    const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
    const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
    const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
    const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
    const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const CLASS_NAME_SHOW$6 = 'show';
    const CLASS_NAME_DROPUP = 'dropup';
    const CLASS_NAME_DROPEND = 'dropend';
    const CLASS_NAME_DROPSTART = 'dropstart';
    const CLASS_NAME_DROPUP_CENTER = 'dropup-center';
    const CLASS_NAME_DROPDOWN_CENTER = 'dropdown-center';
    const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
    const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
    const SELECTOR_MENU = '.dropdown-menu';
    const SELECTOR_NAVBAR = '.navbar';
    const SELECTOR_NAVBAR_NAV = '.navbar-nav';
    const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
    const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start';
    const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end';
    const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start';
    const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end';
    const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start';
    const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start';
    const PLACEMENT_TOPCENTER = 'top';
    const PLACEMENT_BOTTOMCENTER = 'bottom';
    const Default$9 = {
      autoClose: true,
      boundary: 'clippingParents',
      display: 'dynamic',
      offset: [0, 2],
      popperConfig: null,
      reference: 'toggle'
    };
    const DefaultType$9 = {
      autoClose: '(boolean|string)',
      boundary: '(string|element)',
      display: 'string',
      offset: '(array|string|function)',
      popperConfig: '(null|object|function)',
      reference: '(string|element|object)'
    };

    /**
     * Class definition
     */

    class Dropdown extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._popper = null;
        this._parent = this._element.parentNode; // dropdown wrapper
        // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
        this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
        this._inNavbar = this._detectNavbar();
      }

      // Getters
      static get Default() {
        return Default$9;
      }
      static get DefaultType() {
        return DefaultType$9;
      }
      static get NAME() {
        return NAME$a;
      }

      // Public
      toggle() {
        return this._isShown() ? this.hide() : this.show();
      }
      show() {
        if (isDisabled(this._element) || this._isShown()) {
          return;
        }
        const relatedTarget = {
          relatedTarget: this._element
        };
        const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
        if (showEvent.defaultPrevented) {
          return;
        }
        this._createPopper();

        // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        if ('ontouchstart' in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
          for (const element of [].concat(...document.body.children)) {
            EventHandler.on(element, 'mouseover', noop);
          }
        }
        this._element.focus();
        this._element.setAttribute('aria-expanded', true);
        this._menu.classList.add(CLASS_NAME_SHOW$6);
        this._element.classList.add(CLASS_NAME_SHOW$6);
        EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
      }
      hide() {
        if (isDisabled(this._element) || !this._isShown()) {
          return;
        }
        const relatedTarget = {
          relatedTarget: this._element
        };
        this._completeHide(relatedTarget);
      }
      dispose() {
        if (this._popper) {
          this._popper.destroy();
        }
        super.dispose();
      }
      update() {
        this._inNavbar = this._detectNavbar();
        if (this._popper) {
          this._popper.update();
        }
      }

      // Private
      _completeHide(relatedTarget) {
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
        if (hideEvent.defaultPrevented) {
          return;
        }

        // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support
        if ('ontouchstart' in document.documentElement) {
          for (const element of [].concat(...document.body.children)) {
            EventHandler.off(element, 'mouseover', noop);
          }
        }
        if (this._popper) {
          this._popper.destroy();
        }
        this._menu.classList.remove(CLASS_NAME_SHOW$6);
        this._element.classList.remove(CLASS_NAME_SHOW$6);
        this._element.setAttribute('aria-expanded', 'false');
        Manipulator.removeDataAttribute(this._menu, 'popper');
        EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
      }
      _getConfig(config) {
        config = super._getConfig(config);
        if (typeof config.reference === 'object' && !isElement$1(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
          // Popper virtual elements require a getBoundingClientRect method
          throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
        }
        return config;
      }
      _createPopper() {
        if (typeof Popper === 'undefined') {
          throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org)');
        }
        let referenceElement = this._element;
        if (this._config.reference === 'parent') {
          referenceElement = this._parent;
        } else if (isElement$1(this._config.reference)) {
          referenceElement = getElement(this._config.reference);
        } else if (typeof this._config.reference === 'object') {
          referenceElement = this._config.reference;
        }
        const popperConfig = this._getPopperConfig();
        this._popper = createPopper(referenceElement, this._menu, popperConfig);
      }
      _isShown() {
        return this._menu.classList.contains(CLASS_NAME_SHOW$6);
      }
      _getPlacement() {
        const parentDropdown = this._parent;
        if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
          return PLACEMENT_RIGHT;
        }
        if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
          return PLACEMENT_LEFT;
        }
        if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
          return PLACEMENT_TOPCENTER;
        }
        if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
          return PLACEMENT_BOTTOMCENTER;
        }

        // We need to trim the value because custom properties can also include spaces
        const isEnd = getComputedStyle(this._menu).getPropertyValue('--bs-position').trim() === 'end';
        if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
          return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
        }
        return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
      }
      _detectNavbar() {
        return this._element.closest(SELECTOR_NAVBAR) !== null;
      }
      _getOffset() {
        const {
          offset
        } = this._config;
        if (typeof offset === 'string') {
          return offset.split(',').map(value => Number.parseInt(value, 10));
        }
        if (typeof offset === 'function') {
          return popperData => offset(popperData, this._element);
        }
        return offset;
      }
      _getPopperConfig() {
        const defaultBsPopperConfig = {
          placement: this._getPlacement(),
          modifiers: [{
            name: 'preventOverflow',
            options: {
              boundary: this._config.boundary
            }
          }, {
            name: 'offset',
            options: {
              offset: this._getOffset()
            }
          }]
        };

        // Disable Popper if we have a static display or Dropdown is in Navbar
        if (this._inNavbar || this._config.display === 'static') {
          Manipulator.setDataAttribute(this._menu, 'popper', 'static'); // TODO: v6 remove
          defaultBsPopperConfig.modifiers = [{
            name: 'applyStyles',
            enabled: false
          }];
        }
        return {
          ...defaultBsPopperConfig,
          ...execute(this._config.popperConfig, [defaultBsPopperConfig])
        };
      }
      _selectMenuItem({
        key,
        target
      }) {
        const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => isVisible(element));
        if (!items.length) {
          return;
        }

        // if target isn't included in items (e.g. when expanding the dropdown)
        // allow cycling to get the last item in case key equals ARROW_UP_KEY
        getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Dropdown.getOrCreateInstance(this, config);
          if (typeof config !== 'string') {
            return;
          }
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        });
      }
      static clearMenus(event) {
        if (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY$1) {
          return;
        }
        const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
        for (const toggle of openToggles) {
          const context = Dropdown.getInstance(toggle);
          if (!context || context._config.autoClose === false) {
            continue;
          }
          const composedPath = event.composedPath();
          const isMenuTarget = composedPath.includes(context._menu);
          if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
            continue;
          }

          // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu
          if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
            continue;
          }
          const relatedTarget = {
            relatedTarget: context._element
          };
          if (event.type === 'click') {
            relatedTarget.clickEvent = event;
          }
          context._completeHide(relatedTarget);
        }
      }
      static dataApiKeydownHandler(event) {
        // If not an UP | DOWN | ESCAPE key => not a dropdown command
        // If input/textarea && if key is other than ESCAPE => not a dropdown command

        const isInput = /input|textarea/i.test(event.target.tagName);
        const isEscapeEvent = event.key === ESCAPE_KEY$2;
        const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
        if (!isUpOrDownEvent && !isEscapeEvent) {
          return;
        }
        if (isInput && !isEscapeEvent) {
          return;
        }
        event.preventDefault();

        // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
        const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
        const instance = Dropdown.getOrCreateInstance(getToggleButton);
        if (isUpOrDownEvent) {
          event.stopPropagation();
          instance.show();
          instance._selectMenuItem(event);
          return;
        }
        if (instance._isShown()) {
          // else is escape and we check if it is shown
          event.stopPropagation();
          instance.hide();
          getToggleButton.focus();
        }
      }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
    EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
    EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
    EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
    EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function (event) {
      event.preventDefault();
      Dropdown.getOrCreateInstance(this).toggle();
    });

    /**
     * jQuery
     */

    defineJQueryPlugin(Dropdown);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/backdrop.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$9 = 'backdrop';
    const CLASS_NAME_FADE$4 = 'fade';
    const CLASS_NAME_SHOW$5 = 'show';
    const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
    const Default$8 = {
      className: 'modal-backdrop',
      clickCallback: null,
      isAnimated: false,
      isVisible: true,
      // if false, we use the backdrop helper without adding any element to the dom
      rootElement: 'body' // give the choice to place backdrop under different elements
    };
    const DefaultType$8 = {
      className: 'string',
      clickCallback: '(function|null)',
      isAnimated: 'boolean',
      isVisible: 'boolean',
      rootElement: '(element|string)'
    };

    /**
     * Class definition
     */

    class Backdrop extends Config {
      constructor(config) {
        super();
        this._config = this._getConfig(config);
        this._isAppended = false;
        this._element = null;
      }

      // Getters
      static get Default() {
        return Default$8;
      }
      static get DefaultType() {
        return DefaultType$8;
      }
      static get NAME() {
        return NAME$9;
      }

      // Public
      show(callback) {
        if (!this._config.isVisible) {
          execute(callback);
          return;
        }
        this._append();
        const element = this._getElement();
        if (this._config.isAnimated) {
          reflow(element);
        }
        element.classList.add(CLASS_NAME_SHOW$5);
        this._emulateAnimation(() => {
          execute(callback);
        });
      }
      hide(callback) {
        if (!this._config.isVisible) {
          execute(callback);
          return;
        }
        this._getElement().classList.remove(CLASS_NAME_SHOW$5);
        this._emulateAnimation(() => {
          this.dispose();
          execute(callback);
        });
      }
      dispose() {
        if (!this._isAppended) {
          return;
        }
        EventHandler.off(this._element, EVENT_MOUSEDOWN);
        this._element.remove();
        this._isAppended = false;
      }

      // Private
      _getElement() {
        if (!this._element) {
          const backdrop = document.createElement('div');
          backdrop.className = this._config.className;
          if (this._config.isAnimated) {
            backdrop.classList.add(CLASS_NAME_FADE$4);
          }
          this._element = backdrop;
        }
        return this._element;
      }
      _configAfterMerge(config) {
        // use getElement() with the default "body" to get a fresh Element on each instantiation
        config.rootElement = getElement(config.rootElement);
        return config;
      }
      _append() {
        if (this._isAppended) {
          return;
        }
        const element = this._getElement();
        this._config.rootElement.append(element);
        EventHandler.on(element, EVENT_MOUSEDOWN, () => {
          execute(this._config.clickCallback);
        });
        this._isAppended = true;
      }
      _emulateAnimation(callback) {
        executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
      }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/focustrap.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$8 = 'focustrap';
    const DATA_KEY$5 = 'bs.focustrap';
    const EVENT_KEY$5 = `.${DATA_KEY$5}`;
    const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
    const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
    const TAB_KEY = 'Tab';
    const TAB_NAV_FORWARD = 'forward';
    const TAB_NAV_BACKWARD = 'backward';
    const Default$7 = {
      autofocus: true,
      trapElement: null // The element to trap focus inside of
    };
    const DefaultType$7 = {
      autofocus: 'boolean',
      trapElement: 'element'
    };

    /**
     * Class definition
     */

    class FocusTrap extends Config {
      constructor(config) {
        super();
        this._config = this._getConfig(config);
        this._isActive = false;
        this._lastTabNavDirection = null;
      }

      // Getters
      static get Default() {
        return Default$7;
      }
      static get DefaultType() {
        return DefaultType$7;
      }
      static get NAME() {
        return NAME$8;
      }

      // Public
      activate() {
        if (this._isActive) {
          return;
        }
        if (this._config.autofocus) {
          this._config.trapElement.focus();
        }
        EventHandler.off(document, EVENT_KEY$5); // guard against infinite focus loop
        EventHandler.on(document, EVENT_FOCUSIN$2, event => this._handleFocusin(event));
        EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
        this._isActive = true;
      }
      deactivate() {
        if (!this._isActive) {
          return;
        }
        this._isActive = false;
        EventHandler.off(document, EVENT_KEY$5);
      }

      // Private
      _handleFocusin(event) {
        const {
          trapElement
        } = this._config;
        if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
          return;
        }
        const elements = SelectorEngine.focusableChildren(trapElement);
        if (elements.length === 0) {
          trapElement.focus();
        } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
          elements[elements.length - 1].focus();
        } else {
          elements[0].focus();
        }
      }
      _handleKeydown(event) {
        if (event.key !== TAB_KEY) {
          return;
        }
        this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
      }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/scrollBar.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
    const SELECTOR_STICKY_CONTENT = '.sticky-top';
    const PROPERTY_PADDING = 'padding-right';
    const PROPERTY_MARGIN = 'margin-right';

    /**
     * Class definition
     */

    class ScrollBarHelper {
      constructor() {
        this._element = document.body;
      }

      // Public
      getWidth() {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
        const documentWidth = document.documentElement.clientWidth;
        return Math.abs(window.innerWidth - documentWidth);
      }
      hide() {
        const width = this.getWidth();
        this._disableOverFlow();
        // give padding to element to balance the hidden scrollbar width
        this._setElementAttributes(this._element, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
        // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth
        this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
        this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, calculatedValue => calculatedValue - width);
      }
      reset() {
        this._resetElementAttributes(this._element, 'overflow');
        this._resetElementAttributes(this._element, PROPERTY_PADDING);
        this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
        this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
      }
      isOverflowing() {
        return this.getWidth() > 0;
      }

      // Private
      _disableOverFlow() {
        this._saveInitialAttribute(this._element, 'overflow');
        this._element.style.overflow = 'hidden';
      }
      _setElementAttributes(selector, styleProperty, callback) {
        const scrollbarWidth = this.getWidth();
        const manipulationCallBack = element => {
          if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
            return;
          }
          this._saveInitialAttribute(element, styleProperty);
          const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
          element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
        };
        this._applyManipulationCallback(selector, manipulationCallBack);
      }
      _saveInitialAttribute(element, styleProperty) {
        const actualValue = element.style.getPropertyValue(styleProperty);
        if (actualValue) {
          Manipulator.setDataAttribute(element, styleProperty, actualValue);
        }
      }
      _resetElementAttributes(selector, styleProperty) {
        const manipulationCallBack = element => {
          const value = Manipulator.getDataAttribute(element, styleProperty);
          // We only want to remove the property if the value is `null`; the value can also be zero
          if (value === null) {
            element.style.removeProperty(styleProperty);
            return;
          }
          Manipulator.removeDataAttribute(element, styleProperty);
          element.style.setProperty(styleProperty, value);
        };
        this._applyManipulationCallback(selector, manipulationCallBack);
      }
      _applyManipulationCallback(selector, callBack) {
        if (isElement$1(selector)) {
          callBack(selector);
          return;
        }
        for (const sel of SelectorEngine.find(selector, this._element)) {
          callBack(sel);
        }
      }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap modal.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$7 = 'modal';
    const DATA_KEY$4 = 'bs.modal';
    const EVENT_KEY$4 = `.${DATA_KEY$4}`;
    const DATA_API_KEY$2 = '.data-api';
    const ESCAPE_KEY$1 = 'Escape';
    const EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
    const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
    const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
    const EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
    const EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
    const EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
    const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
    const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
    const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
    const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
    const CLASS_NAME_OPEN = 'modal-open';
    const CLASS_NAME_FADE$3 = 'fade';
    const CLASS_NAME_SHOW$4 = 'show';
    const CLASS_NAME_STATIC = 'modal-static';
    const OPEN_SELECTOR$1 = '.modal.show';
    const SELECTOR_DIALOG = '.modal-dialog';
    const SELECTOR_MODAL_BODY = '.modal-body';
    const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
    const Default$6 = {
      backdrop: true,
      focus: true,
      keyboard: true
    };
    const DefaultType$6 = {
      backdrop: '(boolean|string)',
      focus: 'boolean',
      keyboard: 'boolean'
    };

    /**
     * Class definition
     */

    class Modal extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
        this._backdrop = this._initializeBackDrop();
        this._focustrap = this._initializeFocusTrap();
        this._isShown = false;
        this._isTransitioning = false;
        this._scrollBar = new ScrollBarHelper();
        this._addEventListeners();
      }

      // Getters
      static get Default() {
        return Default$6;
      }
      static get DefaultType() {
        return DefaultType$6;
      }
      static get NAME() {
        return NAME$7;
      }

      // Public
      toggle(relatedTarget) {
        return this._isShown ? this.hide() : this.show(relatedTarget);
      }
      show(relatedTarget) {
        if (this._isShown || this._isTransitioning) {
          return;
        }
        const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
          relatedTarget
        });
        if (showEvent.defaultPrevented) {
          return;
        }
        this._isShown = true;
        this._isTransitioning = true;
        this._scrollBar.hide();
        document.body.classList.add(CLASS_NAME_OPEN);
        this._adjustDialog();
        this._backdrop.show(() => this._showElement(relatedTarget));
      }
      hide() {
        if (!this._isShown || this._isTransitioning) {
          return;
        }
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
        if (hideEvent.defaultPrevented) {
          return;
        }
        this._isShown = false;
        this._isTransitioning = true;
        this._focustrap.deactivate();
        this._element.classList.remove(CLASS_NAME_SHOW$4);
        this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
      }
      dispose() {
        EventHandler.off(window, EVENT_KEY$4);
        EventHandler.off(this._dialog, EVENT_KEY$4);
        this._backdrop.dispose();
        this._focustrap.deactivate();
        super.dispose();
      }
      handleUpdate() {
        this._adjustDialog();
      }

      // Private
      _initializeBackDrop() {
        return new Backdrop({
          isVisible: Boolean(this._config.backdrop),
          // 'static' option will be translated to true, and booleans will keep their value,
          isAnimated: this._isAnimated()
        });
      }
      _initializeFocusTrap() {
        return new FocusTrap({
          trapElement: this._element
        });
      }
      _showElement(relatedTarget) {
        // try to append dynamic modal
        if (!document.body.contains(this._element)) {
          document.body.append(this._element);
        }
        this._element.style.display = 'block';
        this._element.removeAttribute('aria-hidden');
        this._element.setAttribute('aria-modal', true);
        this._element.setAttribute('role', 'dialog');
        this._element.scrollTop = 0;
        const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
        reflow(this._element);
        this._element.classList.add(CLASS_NAME_SHOW$4);
        const transitionComplete = () => {
          if (this._config.focus) {
            this._focustrap.activate();
          }
          this._isTransitioning = false;
          EventHandler.trigger(this._element, EVENT_SHOWN$4, {
            relatedTarget
          });
        };
        this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
      }
      _addEventListeners() {
        EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
          if (event.key !== ESCAPE_KEY$1) {
            return;
          }
          if (this._config.keyboard) {
            this.hide();
            return;
          }
          this._triggerBackdropTransition();
        });
        EventHandler.on(window, EVENT_RESIZE$1, () => {
          if (this._isShown && !this._isTransitioning) {
            this._adjustDialog();
          }
        });
        EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, event => {
          // a bad trick to segregate clicks that may start inside dialog but end outside, and avoid listen to scrollbar clicks
          EventHandler.one(this._element, EVENT_CLICK_DISMISS, event2 => {
            if (this._element !== event.target || this._element !== event2.target) {
              return;
            }
            if (this._config.backdrop === 'static') {
              this._triggerBackdropTransition();
              return;
            }
            if (this._config.backdrop) {
              this.hide();
            }
          });
        });
      }
      _hideModal() {
        this._element.style.display = 'none';
        this._element.setAttribute('aria-hidden', true);
        this._element.removeAttribute('aria-modal');
        this._element.removeAttribute('role');
        this._isTransitioning = false;
        this._backdrop.hide(() => {
          document.body.classList.remove(CLASS_NAME_OPEN);
          this._resetAdjustments();
          this._scrollBar.reset();
          EventHandler.trigger(this._element, EVENT_HIDDEN$4);
        });
      }
      _isAnimated() {
        return this._element.classList.contains(CLASS_NAME_FADE$3);
      }
      _triggerBackdropTransition() {
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
        if (hideEvent.defaultPrevented) {
          return;
        }
        const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
        const initialOverflowY = this._element.style.overflowY;
        // return if the following background transition hasn't yet completed
        if (initialOverflowY === 'hidden' || this._element.classList.contains(CLASS_NAME_STATIC)) {
          return;
        }
        if (!isModalOverflowing) {
          this._element.style.overflowY = 'hidden';
        }
        this._element.classList.add(CLASS_NAME_STATIC);
        this._queueCallback(() => {
          this._element.classList.remove(CLASS_NAME_STATIC);
          this._queueCallback(() => {
            this._element.style.overflowY = initialOverflowY;
          }, this._dialog);
        }, this._dialog);
        this._element.focus();
      }

      /**
       * The following methods are used to handle overflowing modals
       */

      _adjustDialog() {
        const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
        const scrollbarWidth = this._scrollBar.getWidth();
        const isBodyOverflowing = scrollbarWidth > 0;
        if (isBodyOverflowing && !isModalOverflowing) {
          const property = isRTL() ? 'paddingLeft' : 'paddingRight';
          this._element.style[property] = `${scrollbarWidth}px`;
        }
        if (!isBodyOverflowing && isModalOverflowing) {
          const property = isRTL() ? 'paddingRight' : 'paddingLeft';
          this._element.style[property] = `${scrollbarWidth}px`;
        }
      }
      _resetAdjustments() {
        this._element.style.paddingLeft = '';
        this._element.style.paddingRight = '';
      }

      // Static
      static jQueryInterface(config, relatedTarget) {
        return this.each(function () {
          const data = Modal.getOrCreateInstance(this, config);
          if (typeof config !== 'string') {
            return;
          }
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](relatedTarget);
        });
      }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function (event) {
      const target = SelectorEngine.getElementFromSelector(this);
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
      EventHandler.one(target, EVENT_SHOW$4, showEvent => {
        if (showEvent.defaultPrevented) {
          // only register focus restorer if modal will actually get shown
          return;
        }
        EventHandler.one(target, EVENT_HIDDEN$4, () => {
          if (isVisible(this)) {
            this.focus();
          }
        });
      });

      // avoid conflict when clicking modal toggler while another one is open
      const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
      if (alreadyOpen) {
        Modal.getInstance(alreadyOpen).hide();
      }
      const data = Modal.getOrCreateInstance(target);
      data.toggle(this);
    });
    enableDismissTrigger(Modal);

    /**
     * jQuery
     */

    defineJQueryPlugin(Modal);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap offcanvas.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$6 = 'offcanvas';
    const DATA_KEY$3 = 'bs.offcanvas';
    const EVENT_KEY$3 = `.${DATA_KEY$3}`;
    const DATA_API_KEY$1 = '.data-api';
    const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
    const ESCAPE_KEY = 'Escape';
    const CLASS_NAME_SHOW$3 = 'show';
    const CLASS_NAME_SHOWING$1 = 'showing';
    const CLASS_NAME_HIDING = 'hiding';
    const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
    const OPEN_SELECTOR = '.offcanvas.show';
    const EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
    const EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
    const EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
    const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
    const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
    const EVENT_RESIZE = `resize${EVENT_KEY$3}`;
    const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
    const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
    const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
    const Default$5 = {
      backdrop: true,
      keyboard: true,
      scroll: false
    };
    const DefaultType$5 = {
      backdrop: '(boolean|string)',
      keyboard: 'boolean',
      scroll: 'boolean'
    };

    /**
     * Class definition
     */

    class Offcanvas extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._isShown = false;
        this._backdrop = this._initializeBackDrop();
        this._focustrap = this._initializeFocusTrap();
        this._addEventListeners();
      }

      // Getters
      static get Default() {
        return Default$5;
      }
      static get DefaultType() {
        return DefaultType$5;
      }
      static get NAME() {
        return NAME$6;
      }

      // Public
      toggle(relatedTarget) {
        return this._isShown ? this.hide() : this.show(relatedTarget);
      }
      show(relatedTarget) {
        if (this._isShown) {
          return;
        }
        const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
          relatedTarget
        });
        if (showEvent.defaultPrevented) {
          return;
        }
        this._isShown = true;
        this._backdrop.show();
        if (!this._config.scroll) {
          new ScrollBarHelper().hide();
        }
        this._element.setAttribute('aria-modal', true);
        this._element.setAttribute('role', 'dialog');
        this._element.classList.add(CLASS_NAME_SHOWING$1);
        const completeCallBack = () => {
          if (!this._config.scroll || this._config.backdrop) {
            this._focustrap.activate();
          }
          this._element.classList.add(CLASS_NAME_SHOW$3);
          this._element.classList.remove(CLASS_NAME_SHOWING$1);
          EventHandler.trigger(this._element, EVENT_SHOWN$3, {
            relatedTarget
          });
        };
        this._queueCallback(completeCallBack, this._element, true);
      }
      hide() {
        if (!this._isShown) {
          return;
        }
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
        if (hideEvent.defaultPrevented) {
          return;
        }
        this._focustrap.deactivate();
        this._element.blur();
        this._isShown = false;
        this._element.classList.add(CLASS_NAME_HIDING);
        this._backdrop.hide();
        const completeCallback = () => {
          this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
          this._element.removeAttribute('aria-modal');
          this._element.removeAttribute('role');
          if (!this._config.scroll) {
            new ScrollBarHelper().reset();
          }
          EventHandler.trigger(this._element, EVENT_HIDDEN$3);
        };
        this._queueCallback(completeCallback, this._element, true);
      }
      dispose() {
        this._backdrop.dispose();
        this._focustrap.deactivate();
        super.dispose();
      }

      // Private
      _initializeBackDrop() {
        const clickCallback = () => {
          if (this._config.backdrop === 'static') {
            EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
            return;
          }
          this.hide();
        };

        // 'static' option will be translated to true, and booleans will keep their value
        const isVisible = Boolean(this._config.backdrop);
        return new Backdrop({
          className: CLASS_NAME_BACKDROP,
          isVisible,
          isAnimated: true,
          rootElement: this._element.parentNode,
          clickCallback: isVisible ? clickCallback : null
        });
      }
      _initializeFocusTrap() {
        return new FocusTrap({
          trapElement: this._element
        });
      }
      _addEventListeners() {
        EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
          if (event.key !== ESCAPE_KEY) {
            return;
          }
          if (this._config.keyboard) {
            this.hide();
            return;
          }
          EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
        });
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Offcanvas.getOrCreateInstance(this, config);
          if (typeof config !== 'string') {
            return;
          }
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](this);
        });
      }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function (event) {
      const target = SelectorEngine.getElementFromSelector(this);
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
      if (isDisabled(this)) {
        return;
      }
      EventHandler.one(target, EVENT_HIDDEN$3, () => {
        // focus on trigger when it is closed
        if (isVisible(this)) {
          this.focus();
        }
      });

      // avoid conflict when clicking a toggler of an offcanvas, while another is open
      const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
      if (alreadyOpen && alreadyOpen !== target) {
        Offcanvas.getInstance(alreadyOpen).hide();
      }
      const data = Offcanvas.getOrCreateInstance(target);
      data.toggle(this);
    });
    EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
      for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
        Offcanvas.getOrCreateInstance(selector).show();
      }
    });
    EventHandler.on(window, EVENT_RESIZE, () => {
      for (const element of SelectorEngine.find('[aria-modal][class*=show][class*=offcanvas-]')) {
        if (getComputedStyle(element).position !== 'fixed') {
          Offcanvas.getOrCreateInstance(element).hide();
        }
      }
    });
    enableDismissTrigger(Offcanvas);

    /**
     * jQuery
     */

    defineJQueryPlugin(Offcanvas);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/sanitizer.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    // js-docs-start allow-list
    const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
    const DefaultAllowlist = {
      // Global attributes allowed on any supplied element below.
      '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
      a: ['target', 'href', 'title', 'rel'],
      area: [],
      b: [],
      br: [],
      col: [],
      code: [],
      dd: [],
      div: [],
      dl: [],
      dt: [],
      em: [],
      hr: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      i: [],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
      li: [],
      ol: [],
      p: [],
      pre: [],
      s: [],
      small: [],
      span: [],
      sub: [],
      sup: [],
      strong: [],
      u: [],
      ul: []
    };
    // js-docs-end allow-list

    const uriAttributes = new Set(['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href']);

    /**
     * A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
     * contexts.
     *
     * Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
     */
    // eslint-disable-next-line unicorn/better-regex
    const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
    const allowedAttribute = (attribute, allowedAttributeList) => {
      const attributeName = attribute.nodeName.toLowerCase();
      if (allowedAttributeList.includes(attributeName)) {
        if (uriAttributes.has(attributeName)) {
          return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
        }
        return true;
      }

      // Check if a regular expression validates the attribute.
      return allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp).some(regex => regex.test(attributeName));
    };
    function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
      if (!unsafeHtml.length) {
        return unsafeHtml;
      }
      if (sanitizeFunction && typeof sanitizeFunction === 'function') {
        return sanitizeFunction(unsafeHtml);
      }
      const domParser = new window.DOMParser();
      const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
      const elements = [].concat(...createdDocument.body.querySelectorAll('*'));
      for (const element of elements) {
        const elementName = element.nodeName.toLowerCase();
        if (!Object.keys(allowList).includes(elementName)) {
          element.remove();
          continue;
        }
        const attributeList = [].concat(...element.attributes);
        const allowedAttributes = [].concat(allowList['*'] || [], allowList[elementName] || []);
        for (const attribute of attributeList) {
          if (!allowedAttribute(attribute, allowedAttributes)) {
            element.removeAttribute(attribute.nodeName);
          }
        }
      }
      return createdDocument.body.innerHTML;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap util/template-factory.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$5 = 'TemplateFactory';
    const Default$4 = {
      allowList: DefaultAllowlist,
      content: {},
      // { selector : text ,  selector2 : text2 , }
      extraClass: '',
      html: false,
      sanitize: true,
      sanitizeFn: null,
      template: '<div></div>'
    };
    const DefaultType$4 = {
      allowList: 'object',
      content: 'object',
      extraClass: '(string|function)',
      html: 'boolean',
      sanitize: 'boolean',
      sanitizeFn: '(null|function)',
      template: 'string'
    };
    const DefaultContentType = {
      entry: '(string|element|function|null)',
      selector: '(string|element)'
    };

    /**
     * Class definition
     */

    class TemplateFactory extends Config {
      constructor(config) {
        super();
        this._config = this._getConfig(config);
      }

      // Getters
      static get Default() {
        return Default$4;
      }
      static get DefaultType() {
        return DefaultType$4;
      }
      static get NAME() {
        return NAME$5;
      }

      // Public
      getContent() {
        return Object.values(this._config.content).map(config => this._resolvePossibleFunction(config)).filter(Boolean);
      }
      hasContent() {
        return this.getContent().length > 0;
      }
      changeContent(content) {
        this._checkContent(content);
        this._config.content = {
          ...this._config.content,
          ...content
        };
        return this;
      }
      toHtml() {
        const templateWrapper = document.createElement('div');
        templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
        for (const [selector, text] of Object.entries(this._config.content)) {
          this._setContent(templateWrapper, text, selector);
        }
        const template = templateWrapper.children[0];
        const extraClass = this._resolvePossibleFunction(this._config.extraClass);
        if (extraClass) {
          template.classList.add(...extraClass.split(' '));
        }
        return template;
      }

      // Private
      _typeCheckConfig(config) {
        super._typeCheckConfig(config);
        this._checkContent(config.content);
      }
      _checkContent(arg) {
        for (const [selector, content] of Object.entries(arg)) {
          super._typeCheckConfig({
            selector,
            entry: content
          }, DefaultContentType);
        }
      }
      _setContent(template, content, selector) {
        const templateElement = SelectorEngine.findOne(selector, template);
        if (!templateElement) {
          return;
        }
        content = this._resolvePossibleFunction(content);
        if (!content) {
          templateElement.remove();
          return;
        }
        if (isElement$1(content)) {
          this._putElementInTemplate(getElement(content), templateElement);
          return;
        }
        if (this._config.html) {
          templateElement.innerHTML = this._maybeSanitize(content);
          return;
        }
        templateElement.textContent = content;
      }
      _maybeSanitize(arg) {
        return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
      }
      _resolvePossibleFunction(arg) {
        return execute(arg, [this]);
      }
      _putElementInTemplate(element, templateElement) {
        if (this._config.html) {
          templateElement.innerHTML = '';
          templateElement.append(element);
          return;
        }
        templateElement.textContent = element.textContent;
      }
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap tooltip.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$4 = 'tooltip';
    const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn']);
    const CLASS_NAME_FADE$2 = 'fade';
    const CLASS_NAME_MODAL = 'modal';
    const CLASS_NAME_SHOW$2 = 'show';
    const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
    const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
    const EVENT_MODAL_HIDE = 'hide.bs.modal';
    const TRIGGER_HOVER = 'hover';
    const TRIGGER_FOCUS = 'focus';
    const TRIGGER_CLICK = 'click';
    const TRIGGER_MANUAL = 'manual';
    const EVENT_HIDE$2 = 'hide';
    const EVENT_HIDDEN$2 = 'hidden';
    const EVENT_SHOW$2 = 'show';
    const EVENT_SHOWN$2 = 'shown';
    const EVENT_INSERTED = 'inserted';
    const EVENT_CLICK$1 = 'click';
    const EVENT_FOCUSIN$1 = 'focusin';
    const EVENT_FOCUSOUT$1 = 'focusout';
    const EVENT_MOUSEENTER = 'mouseenter';
    const EVENT_MOUSELEAVE = 'mouseleave';
    const AttachmentMap = {
      AUTO: 'auto',
      TOP: 'top',
      RIGHT: isRTL() ? 'left' : 'right',
      BOTTOM: 'bottom',
      LEFT: isRTL() ? 'right' : 'left'
    };
    const Default$3 = {
      allowList: DefaultAllowlist,
      animation: true,
      boundary: 'clippingParents',
      container: false,
      customClass: '',
      delay: 0,
      fallbackPlacements: ['top', 'right', 'bottom', 'left'],
      html: false,
      offset: [0, 6],
      placement: 'top',
      popperConfig: null,
      sanitize: true,
      sanitizeFn: null,
      selector: false,
      template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
      title: '',
      trigger: 'hover focus'
    };
    const DefaultType$3 = {
      allowList: 'object',
      animation: 'boolean',
      boundary: '(string|element)',
      container: '(string|element|boolean)',
      customClass: '(string|function)',
      delay: '(number|object)',
      fallbackPlacements: 'array',
      html: 'boolean',
      offset: '(array|string|function)',
      placement: '(string|function)',
      popperConfig: '(null|object|function)',
      sanitize: 'boolean',
      sanitizeFn: '(null|function)',
      selector: '(string|boolean)',
      template: 'string',
      title: '(string|element|function)',
      trigger: 'string'
    };

    /**
     * Class definition
     */

    class Tooltip extends BaseComponent {
      constructor(element, config) {
        if (typeof Popper === 'undefined') {
          throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org)');
        }
        super(element, config);

        // Private
        this._isEnabled = true;
        this._timeout = 0;
        this._isHovered = null;
        this._activeTrigger = {};
        this._popper = null;
        this._templateFactory = null;
        this._newContent = null;

        // Protected
        this.tip = null;
        this._setListeners();
        if (!this._config.selector) {
          this._fixTitle();
        }
      }

      // Getters
      static get Default() {
        return Default$3;
      }
      static get DefaultType() {
        return DefaultType$3;
      }
      static get NAME() {
        return NAME$4;
      }

      // Public
      enable() {
        this._isEnabled = true;
      }
      disable() {
        this._isEnabled = false;
      }
      toggleEnabled() {
        this._isEnabled = !this._isEnabled;
      }
      toggle() {
        if (!this._isEnabled) {
          return;
        }
        this._activeTrigger.click = !this._activeTrigger.click;
        if (this._isShown()) {
          this._leave();
          return;
        }
        this._enter();
      }
      dispose() {
        clearTimeout(this._timeout);
        EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
        if (this._element.getAttribute('data-bs-original-title')) {
          this._element.setAttribute('title', this._element.getAttribute('data-bs-original-title'));
        }
        this._disposePopper();
        super.dispose();
      }
      show() {
        if (this._element.style.display === 'none') {
          throw new Error('Please use show on visible elements');
        }
        if (!(this._isWithContent() && this._isEnabled)) {
          return;
        }
        const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
        const shadowRoot = findShadowRoot(this._element);
        const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
        if (showEvent.defaultPrevented || !isInTheDom) {
          return;
        }

        // TODO: v6 remove this or make it optional
        this._disposePopper();
        const tip = this._getTipElement();
        this._element.setAttribute('aria-describedby', tip.getAttribute('id'));
        const {
          container
        } = this._config;
        if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
          container.append(tip);
          EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
        }
        this._popper = this._createPopper(tip);
        tip.classList.add(CLASS_NAME_SHOW$2);

        // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        if ('ontouchstart' in document.documentElement) {
          for (const element of [].concat(...document.body.children)) {
            EventHandler.on(element, 'mouseover', noop);
          }
        }
        const complete = () => {
          EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
          if (this._isHovered === false) {
            this._leave();
          }
          this._isHovered = false;
        };
        this._queueCallback(complete, this.tip, this._isAnimated());
      }
      hide() {
        if (!this._isShown()) {
          return;
        }
        const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
        if (hideEvent.defaultPrevented) {
          return;
        }
        const tip = this._getTipElement();
        tip.classList.remove(CLASS_NAME_SHOW$2);

        // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support
        if ('ontouchstart' in document.documentElement) {
          for (const element of [].concat(...document.body.children)) {
            EventHandler.off(element, 'mouseover', noop);
          }
        }
        this._activeTrigger[TRIGGER_CLICK] = false;
        this._activeTrigger[TRIGGER_FOCUS] = false;
        this._activeTrigger[TRIGGER_HOVER] = false;
        this._isHovered = null; // it is a trick to support manual triggering

        const complete = () => {
          if (this._isWithActiveTrigger()) {
            return;
          }
          if (!this._isHovered) {
            this._disposePopper();
          }
          this._element.removeAttribute('aria-describedby');
          EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
        };
        this._queueCallback(complete, this.tip, this._isAnimated());
      }
      update() {
        if (this._popper) {
          this._popper.update();
        }
      }

      // Protected
      _isWithContent() {
        return Boolean(this._getTitle());
      }
      _getTipElement() {
        if (!this.tip) {
          this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
        }
        return this.tip;
      }
      _createTipElement(content) {
        const tip = this._getTemplateFactory(content).toHtml();

        // TODO: remove this check in v6
        if (!tip) {
          return null;
        }
        tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
        // TODO: v6 the following can be achieved with CSS only
        tip.classList.add(`bs-${this.constructor.NAME}-auto`);
        const tipId = getUID(this.constructor.NAME).toString();
        tip.setAttribute('id', tipId);
        if (this._isAnimated()) {
          tip.classList.add(CLASS_NAME_FADE$2);
        }
        return tip;
      }
      setContent(content) {
        this._newContent = content;
        if (this._isShown()) {
          this._disposePopper();
          this.show();
        }
      }
      _getTemplateFactory(content) {
        if (this._templateFactory) {
          this._templateFactory.changeContent(content);
        } else {
          this._templateFactory = new TemplateFactory({
            ...this._config,
            // the `content` var has to be after `this._config`
            // to override config.content in case of popover
            content,
            extraClass: this._resolvePossibleFunction(this._config.customClass)
          });
        }
        return this._templateFactory;
      }
      _getContentForTemplate() {
        return {
          [SELECTOR_TOOLTIP_INNER]: this._getTitle()
        };
      }
      _getTitle() {
        return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute('data-bs-original-title');
      }

      // Private
      _initializeOnDelegatedTarget(event) {
        return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
      }
      _isAnimated() {
        return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
      }
      _isShown() {
        return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
      }
      _createPopper(tip) {
        const placement = execute(this._config.placement, [this, tip, this._element]);
        const attachment = AttachmentMap[placement.toUpperCase()];
        return createPopper(this._element, tip, this._getPopperConfig(attachment));
      }
      _getOffset() {
        const {
          offset
        } = this._config;
        if (typeof offset === 'string') {
          return offset.split(',').map(value => Number.parseInt(value, 10));
        }
        if (typeof offset === 'function') {
          return popperData => offset(popperData, this._element);
        }
        return offset;
      }
      _resolvePossibleFunction(arg) {
        return execute(arg, [this._element]);
      }
      _getPopperConfig(attachment) {
        const defaultBsPopperConfig = {
          placement: attachment,
          modifiers: [{
            name: 'flip',
            options: {
              fallbackPlacements: this._config.fallbackPlacements
            }
          }, {
            name: 'offset',
            options: {
              offset: this._getOffset()
            }
          }, {
            name: 'preventOverflow',
            options: {
              boundary: this._config.boundary
            }
          }, {
            name: 'arrow',
            options: {
              element: `.${this.constructor.NAME}-arrow`
            }
          }, {
            name: 'preSetPlacement',
            enabled: true,
            phase: 'beforeMain',
            fn: data => {
              // Pre-set Popper's placement attribute in order to read the arrow sizes properly.
              // Otherwise, Popper mixes up the width and height dimensions since the initial arrow style is for top placement
              this._getTipElement().setAttribute('data-popper-placement', data.state.placement);
            }
          }]
        };
        return {
          ...defaultBsPopperConfig,
          ...execute(this._config.popperConfig, [defaultBsPopperConfig])
        };
      }
      _setListeners() {
        const triggers = this._config.trigger.split(' ');
        for (const trigger of triggers) {
          if (trigger === 'click') {
            EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, event => {
              const context = this._initializeOnDelegatedTarget(event);
              context.toggle();
            });
          } else if (trigger !== TRIGGER_MANUAL) {
            const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
            const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
            EventHandler.on(this._element, eventIn, this._config.selector, event => {
              const context = this._initializeOnDelegatedTarget(event);
              context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
              context._enter();
            });
            EventHandler.on(this._element, eventOut, this._config.selector, event => {
              const context = this._initializeOnDelegatedTarget(event);
              context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
              context._leave();
            });
          }
        }
        this._hideModalHandler = () => {
          if (this._element) {
            this.hide();
          }
        };
        EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
      }
      _fixTitle() {
        const title = this._element.getAttribute('title');
        if (!title) {
          return;
        }
        if (!this._element.getAttribute('aria-label') && !this._element.textContent.trim()) {
          this._element.setAttribute('aria-label', title);
        }
        this._element.setAttribute('data-bs-original-title', title); // DO NOT USE IT. Is only for backwards compatibility
        this._element.removeAttribute('title');
      }
      _enter() {
        if (this._isShown() || this._isHovered) {
          this._isHovered = true;
          return;
        }
        this._isHovered = true;
        this._setTimeout(() => {
          if (this._isHovered) {
            this.show();
          }
        }, this._config.delay.show);
      }
      _leave() {
        if (this._isWithActiveTrigger()) {
          return;
        }
        this._isHovered = false;
        this._setTimeout(() => {
          if (!this._isHovered) {
            this.hide();
          }
        }, this._config.delay.hide);
      }
      _setTimeout(handler, timeout) {
        clearTimeout(this._timeout);
        this._timeout = setTimeout(handler, timeout);
      }
      _isWithActiveTrigger() {
        return Object.values(this._activeTrigger).includes(true);
      }
      _getConfig(config) {
        const dataAttributes = Manipulator.getDataAttributes(this._element);
        for (const dataAttribute of Object.keys(dataAttributes)) {
          if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
            delete dataAttributes[dataAttribute];
          }
        }
        config = {
          ...dataAttributes,
          ...(typeof config === 'object' && config ? config : {})
        };
        config = this._mergeConfigObj(config);
        config = this._configAfterMerge(config);
        this._typeCheckConfig(config);
        return config;
      }
      _configAfterMerge(config) {
        config.container = config.container === false ? document.body : getElement(config.container);
        if (typeof config.delay === 'number') {
          config.delay = {
            show: config.delay,
            hide: config.delay
          };
        }
        if (typeof config.title === 'number') {
          config.title = config.title.toString();
        }
        if (typeof config.content === 'number') {
          config.content = config.content.toString();
        }
        return config;
      }
      _getDelegateConfig() {
        const config = {};
        for (const [key, value] of Object.entries(this._config)) {
          if (this.constructor.Default[key] !== value) {
            config[key] = value;
          }
        }
        config.selector = false;
        config.trigger = 'manual';

        // In the future can be replaced with:
        // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
        // `Object.fromEntries(keysWithDifferentValues)`
        return config;
      }
      _disposePopper() {
        if (this._popper) {
          this._popper.destroy();
          this._popper = null;
        }
        if (this.tip) {
          this.tip.remove();
          this.tip = null;
        }
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Tooltip.getOrCreateInstance(this, config);
          if (typeof config !== 'string') {
            return;
          }
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        });
      }
    }

    /**
     * jQuery
     */

    defineJQueryPlugin(Tooltip);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap popover.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$3 = 'popover';
    const SELECTOR_TITLE = '.popover-header';
    const SELECTOR_CONTENT = '.popover-body';
    const Default$2 = {
      ...Tooltip.Default,
      content: '',
      offset: [0, 8],
      placement: 'right',
      template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + '</div>',
      trigger: 'click'
    };
    const DefaultType$2 = {
      ...Tooltip.DefaultType,
      content: '(null|string|element|function)'
    };

    /**
     * Class definition
     */

    class Popover extends Tooltip {
      // Getters
      static get Default() {
        return Default$2;
      }
      static get DefaultType() {
        return DefaultType$2;
      }
      static get NAME() {
        return NAME$3;
      }

      // Overrides
      _isWithContent() {
        return this._getTitle() || this._getContent();
      }

      // Private
      _getContentForTemplate() {
        return {
          [SELECTOR_TITLE]: this._getTitle(),
          [SELECTOR_CONTENT]: this._getContent()
        };
      }
      _getContent() {
        return this._resolvePossibleFunction(this._config.content);
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Popover.getOrCreateInstance(this, config);
          if (typeof config !== 'string') {
            return;
          }
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        });
      }
    }

    /**
     * jQuery
     */

    defineJQueryPlugin(Popover);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap scrollspy.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$2 = 'scrollspy';
    const DATA_KEY$2 = 'bs.scrollspy';
    const EVENT_KEY$2 = `.${DATA_KEY$2}`;
    const DATA_API_KEY = '.data-api';
    const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
    const EVENT_CLICK = `click${EVENT_KEY$2}`;
    const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
    const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
    const CLASS_NAME_ACTIVE$1 = 'active';
    const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
    const SELECTOR_TARGET_LINKS = '[href]';
    const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
    const SELECTOR_NAV_LINKS = '.nav-link';
    const SELECTOR_NAV_ITEMS = '.nav-item';
    const SELECTOR_LIST_ITEMS = '.list-group-item';
    const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
    const SELECTOR_DROPDOWN = '.dropdown';
    const SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
    const Default$1 = {
      offset: null,
      // TODO: v6 @deprecated, keep it for backwards compatibility reasons
      rootMargin: '0px 0px -25%',
      smoothScroll: false,
      target: null,
      threshold: [0.1, 0.5, 1]
    };
    const DefaultType$1 = {
      offset: '(number|null)',
      // TODO v6 @deprecated, keep it for backwards compatibility reasons
      rootMargin: 'string',
      smoothScroll: 'boolean',
      target: 'element',
      threshold: 'array'
    };

    /**
     * Class definition
     */

    class ScrollSpy extends BaseComponent {
      constructor(element, config) {
        super(element, config);

        // this._element is the observablesContainer and config.target the menu links wrapper
        this._targetLinks = new Map();
        this._observableSections = new Map();
        this._rootElement = getComputedStyle(this._element).overflowY === 'visible' ? null : this._element;
        this._activeTarget = null;
        this._observer = null;
        this._previousScrollData = {
          visibleEntryTop: 0,
          parentScrollTop: 0
        };
        this.refresh(); // initialize
      }

      // Getters
      static get Default() {
        return Default$1;
      }
      static get DefaultType() {
        return DefaultType$1;
      }
      static get NAME() {
        return NAME$2;
      }

      // Public
      refresh() {
        this._initializeTargetsAndObservables();
        this._maybeEnableSmoothScroll();
        if (this._observer) {
          this._observer.disconnect();
        } else {
          this._observer = this._getNewObserver();
        }
        for (const section of this._observableSections.values()) {
          this._observer.observe(section);
        }
      }
      dispose() {
        this._observer.disconnect();
        super.dispose();
      }

      // Private
      _configAfterMerge(config) {
        // TODO: on v6 target should be given explicitly & remove the {target: 'ss-target'} case
        config.target = getElement(config.target) || document.body;

        // TODO: v6 Only for backwards compatibility reasons. Use rootMargin only
        config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
        if (typeof config.threshold === 'string') {
          config.threshold = config.threshold.split(',').map(value => Number.parseFloat(value));
        }
        return config;
      }
      _maybeEnableSmoothScroll() {
        if (!this._config.smoothScroll) {
          return;
        }

        // unregister any previous listeners
        EventHandler.off(this._config.target, EVENT_CLICK);
        EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, event => {
          const observableSection = this._observableSections.get(event.target.hash);
          if (observableSection) {
            event.preventDefault();
            const root = this._rootElement || window;
            const height = observableSection.offsetTop - this._element.offsetTop;
            if (root.scrollTo) {
              root.scrollTo({
                top: height,
                behavior: 'smooth'
              });
              return;
            }

            // Chrome 60 doesn't support `scrollTo`
            root.scrollTop = height;
          }
        });
      }
      _getNewObserver() {
        const options = {
          root: this._rootElement,
          threshold: this._config.threshold,
          rootMargin: this._config.rootMargin
        };
        return new IntersectionObserver(entries => this._observerCallback(entries), options);
      }

      // The logic of selection
      _observerCallback(entries) {
        const targetElement = entry => this._targetLinks.get(`#${entry.target.id}`);
        const activate = entry => {
          this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
          this._process(targetElement(entry));
        };
        const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
        const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
        this._previousScrollData.parentScrollTop = parentScrollTop;
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            this._activeTarget = null;
            this._clearActiveClass(targetElement(entry));
            continue;
          }
          const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
          // if we are scrolling down, pick the bigger offsetTop
          if (userScrollsDown && entryIsLowerThanPrevious) {
            activate(entry);
            // if parent isn't scrolled, let's keep the first visible item, breaking the iteration
            if (!parentScrollTop) {
              return;
            }
            continue;
          }

          // if we are scrolling up, pick the smallest offsetTop
          if (!userScrollsDown && !entryIsLowerThanPrevious) {
            activate(entry);
          }
        }
      }
      _initializeTargetsAndObservables() {
        this._targetLinks = new Map();
        this._observableSections = new Map();
        const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
        for (const anchor of targetLinks) {
          // ensure that the anchor has an id and is not disabled
          if (!anchor.hash || isDisabled(anchor)) {
            continue;
          }
          const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);

          // ensure that the observableSection exists & is visible
          if (isVisible(observableSection)) {
            this._targetLinks.set(decodeURI(anchor.hash), anchor);
            this._observableSections.set(anchor.hash, observableSection);
          }
        }
      }
      _process(target) {
        if (this._activeTarget === target) {
          return;
        }
        this._clearActiveClass(this._config.target);
        this._activeTarget = target;
        target.classList.add(CLASS_NAME_ACTIVE$1);
        this._activateParents(target);
        EventHandler.trigger(this._element, EVENT_ACTIVATE, {
          relatedTarget: target
        });
      }
      _activateParents(target) {
        // Activate dropdown parents
        if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
          SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
          return;
        }
        for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
          // Set triggered links parents as active
          // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
          for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
            item.classList.add(CLASS_NAME_ACTIVE$1);
          }
        }
      }
      _clearActiveClass(parent) {
        parent.classList.remove(CLASS_NAME_ACTIVE$1);
        const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
        for (const node of activeNodes) {
          node.classList.remove(CLASS_NAME_ACTIVE$1);
        }
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = ScrollSpy.getOrCreateInstance(this, config);
          if (typeof config !== 'string') {
            return;
          }
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        });
      }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
      for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
        ScrollSpy.getOrCreateInstance(spy);
      }
    });

    /**
     * jQuery
     */

    defineJQueryPlugin(ScrollSpy);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap tab.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME$1 = 'tab';
    const DATA_KEY$1 = 'bs.tab';
    const EVENT_KEY$1 = `.${DATA_KEY$1}`;
    const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
    const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
    const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
    const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
    const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
    const EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
    const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
    const ARROW_LEFT_KEY = 'ArrowLeft';
    const ARROW_RIGHT_KEY = 'ArrowRight';
    const ARROW_UP_KEY = 'ArrowUp';
    const ARROW_DOWN_KEY = 'ArrowDown';
    const HOME_KEY = 'Home';
    const END_KEY = 'End';
    const CLASS_NAME_ACTIVE = 'active';
    const CLASS_NAME_FADE$1 = 'fade';
    const CLASS_NAME_SHOW$1 = 'show';
    const CLASS_DROPDOWN = 'dropdown';
    const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
    const SELECTOR_DROPDOWN_MENU = '.dropdown-menu';
    const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
    const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
    const SELECTOR_OUTER = '.nav-item, .list-group-item';
    const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
    const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]'; // TODO: could only be `tab` in v6
    const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
    const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;

    /**
     * Class definition
     */

    class Tab extends BaseComponent {
      constructor(element) {
        super(element);
        this._parent = this._element.closest(SELECTOR_TAB_PANEL);
        if (!this._parent) {
          return;
          // TODO: should throw exception in v6
          // throw new TypeError(`${element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`)
        }

        // Set up initial aria attributes
        this._setInitialAttributes(this._parent, this._getChildren());
        EventHandler.on(this._element, EVENT_KEYDOWN, event => this._keydown(event));
      }

      // Getters
      static get NAME() {
        return NAME$1;
      }

      // Public
      show() {
        // Shows this elem and deactivate the active sibling if exists
        const innerElem = this._element;
        if (this._elemIsActive(innerElem)) {
          return;
        }

        // Search for active tab on same parent to deactivate it
        const active = this._getActiveElem();
        const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
          relatedTarget: innerElem
        }) : null;
        const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
          relatedTarget: active
        });
        if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
          return;
        }
        this._deactivate(active, innerElem);
        this._activate(innerElem, active);
      }

      // Private
      _activate(element, relatedElem) {
        if (!element) {
          return;
        }
        element.classList.add(CLASS_NAME_ACTIVE);
        this._activate(SelectorEngine.getElementFromSelector(element)); // Search and activate/show the proper section

        const complete = () => {
          if (element.getAttribute('role') !== 'tab') {
            element.classList.add(CLASS_NAME_SHOW$1);
            return;
          }
          element.removeAttribute('tabindex');
          element.setAttribute('aria-selected', true);
          this._toggleDropDown(element, true);
          EventHandler.trigger(element, EVENT_SHOWN$1, {
            relatedTarget: relatedElem
          });
        };
        this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
      }
      _deactivate(element, relatedElem) {
        if (!element) {
          return;
        }
        element.classList.remove(CLASS_NAME_ACTIVE);
        element.blur();
        this._deactivate(SelectorEngine.getElementFromSelector(element)); // Search and deactivate the shown section too

        const complete = () => {
          if (element.getAttribute('role') !== 'tab') {
            element.classList.remove(CLASS_NAME_SHOW$1);
            return;
          }
          element.setAttribute('aria-selected', false);
          element.setAttribute('tabindex', '-1');
          this._toggleDropDown(element, false);
          EventHandler.trigger(element, EVENT_HIDDEN$1, {
            relatedTarget: relatedElem
          });
        };
        this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
      }
      _keydown(event) {
        if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
          return;
        }
        event.stopPropagation(); // stopPropagation/preventDefault both added to support up/down keys without scrolling the page
        event.preventDefault();
        const children = this._getChildren().filter(element => !isDisabled(element));
        let nextActiveElement;
        if ([HOME_KEY, END_KEY].includes(event.key)) {
          nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
        } else {
          const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
          nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
        }
        if (nextActiveElement) {
          nextActiveElement.focus({
            preventScroll: true
          });
          Tab.getOrCreateInstance(nextActiveElement).show();
        }
      }
      _getChildren() {
        // collection of inner elements
        return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
      }
      _getActiveElem() {
        return this._getChildren().find(child => this._elemIsActive(child)) || null;
      }
      _setInitialAttributes(parent, children) {
        this._setAttributeIfNotExists(parent, 'role', 'tablist');
        for (const child of children) {
          this._setInitialAttributesOnChild(child);
        }
      }
      _setInitialAttributesOnChild(child) {
        child = this._getInnerElement(child);
        const isActive = this._elemIsActive(child);
        const outerElem = this._getOuterElement(child);
        child.setAttribute('aria-selected', isActive);
        if (outerElem !== child) {
          this._setAttributeIfNotExists(outerElem, 'role', 'presentation');
        }
        if (!isActive) {
          child.setAttribute('tabindex', '-1');
        }
        this._setAttributeIfNotExists(child, 'role', 'tab');

        // set attributes to the related panel too
        this._setInitialAttributesOnTargetPanel(child);
      }
      _setInitialAttributesOnTargetPanel(child) {
        const target = SelectorEngine.getElementFromSelector(child);
        if (!target) {
          return;
        }
        this._setAttributeIfNotExists(target, 'role', 'tabpanel');
        if (child.id) {
          this._setAttributeIfNotExists(target, 'aria-labelledby', `${child.id}`);
        }
      }
      _toggleDropDown(element, open) {
        const outerElem = this._getOuterElement(element);
        if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
          return;
        }
        const toggle = (selector, className) => {
          const element = SelectorEngine.findOne(selector, outerElem);
          if (element) {
            element.classList.toggle(className, open);
          }
        };
        toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
        toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
        outerElem.setAttribute('aria-expanded', open);
      }
      _setAttributeIfNotExists(element, attribute, value) {
        if (!element.hasAttribute(attribute)) {
          element.setAttribute(attribute, value);
        }
      }
      _elemIsActive(elem) {
        return elem.classList.contains(CLASS_NAME_ACTIVE);
      }

      // Try to get the inner element (usually the .nav-link)
      _getInnerElement(elem) {
        return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
      }

      // Try to get the outer element (usually the .nav-item)
      _getOuterElement(elem) {
        return elem.closest(SELECTOR_OUTER) || elem;
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Tab.getOrCreateInstance(this);
          if (typeof config !== 'string') {
            return;
          }
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        });
      }
    }

    /**
     * Data API implementation
     */

    EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
      if (isDisabled(this)) {
        return;
      }
      Tab.getOrCreateInstance(this).show();
    });

    /**
     * Initialize on focus
     */
    EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
      for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
        Tab.getOrCreateInstance(element);
      }
    });
    /**
     * jQuery
     */

    defineJQueryPlugin(Tab);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap toast.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */


    /**
     * Constants
     */

    const NAME = 'toast';
    const DATA_KEY = 'bs.toast';
    const EVENT_KEY = `.${DATA_KEY}`;
    const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
    const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
    const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
    const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
    const EVENT_HIDE = `hide${EVENT_KEY}`;
    const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
    const EVENT_SHOW = `show${EVENT_KEY}`;
    const EVENT_SHOWN = `shown${EVENT_KEY}`;
    const CLASS_NAME_FADE = 'fade';
    const CLASS_NAME_HIDE = 'hide'; // @deprecated - kept here only for backwards compatibility
    const CLASS_NAME_SHOW = 'show';
    const CLASS_NAME_SHOWING = 'showing';
    const DefaultType = {
      animation: 'boolean',
      autohide: 'boolean',
      delay: 'number'
    };
    const Default = {
      animation: true,
      autohide: true,
      delay: 5000
    };

    /**
     * Class definition
     */

    class Toast extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._timeout = null;
        this._hasMouseInteraction = false;
        this._hasKeyboardInteraction = false;
        this._setListeners();
      }

      // Getters
      static get Default() {
        return Default;
      }
      static get DefaultType() {
        return DefaultType;
      }
      static get NAME() {
        return NAME;
      }

      // Public
      show() {
        const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
        if (showEvent.defaultPrevented) {
          return;
        }
        this._clearTimeout();
        if (this._config.animation) {
          this._element.classList.add(CLASS_NAME_FADE);
        }
        const complete = () => {
          this._element.classList.remove(CLASS_NAME_SHOWING);
          EventHandler.trigger(this._element, EVENT_SHOWN);
          this._maybeScheduleHide();
        };
        this._element.classList.remove(CLASS_NAME_HIDE); // @deprecated
        reflow(this._element);
        this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
        this._queueCallback(complete, this._element, this._config.animation);
      }
      hide() {
        if (!this.isShown()) {
          return;
        }
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
        if (hideEvent.defaultPrevented) {
          return;
        }
        const complete = () => {
          this._element.classList.add(CLASS_NAME_HIDE); // @deprecated
          this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
          EventHandler.trigger(this._element, EVENT_HIDDEN);
        };
        this._element.classList.add(CLASS_NAME_SHOWING);
        this._queueCallback(complete, this._element, this._config.animation);
      }
      dispose() {
        this._clearTimeout();
        if (this.isShown()) {
          this._element.classList.remove(CLASS_NAME_SHOW);
        }
        super.dispose();
      }
      isShown() {
        return this._element.classList.contains(CLASS_NAME_SHOW);
      }

      // Private

      _maybeScheduleHide() {
        if (!this._config.autohide) {
          return;
        }
        if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
          return;
        }
        this._timeout = setTimeout(() => {
          this.hide();
        }, this._config.delay);
      }
      _onInteraction(event, isInteracting) {
        switch (event.type) {
          case 'mouseover':
          case 'mouseout':
            {
              this._hasMouseInteraction = isInteracting;
              break;
            }
          case 'focusin':
          case 'focusout':
            {
              this._hasKeyboardInteraction = isInteracting;
              break;
            }
        }
        if (isInteracting) {
          this._clearTimeout();
          return;
        }
        const nextElement = event.relatedTarget;
        if (this._element === nextElement || this._element.contains(nextElement)) {
          return;
        }
        this._maybeScheduleHide();
      }
      _setListeners() {
        EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
        EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
        EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
        EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
      }
      _clearTimeout() {
        clearTimeout(this._timeout);
        this._timeout = null;
      }

      // Static
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Toast.getOrCreateInstance(this, config);
          if (typeof config === 'string') {
            if (typeof data[config] === 'undefined') {
              throw new TypeError(`No method named "${config}"`);
            }
            data[config](this);
          }
        });
      }
    }

    /**
     * Data API implementation
     */

    enableDismissTrigger(Toast);

    /**
     * jQuery
     */

    defineJQueryPlugin(Toast);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap index.umd.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
     * --------------------------------------------------------------------------
     */

    const index_umd = {
      Alert,
      Button,
      Carousel,
      Collapse,
      Dropdown,
      Modal,
      Offcanvas,
      Popover,
      ScrollSpy,
      Tab,
      Toast,
      Tooltip
    };

    return index_umd;

  }));

  function isObject$1(e){return null!==e&&"object"==typeof e&&"constructor"in e&&e.constructor===Object}function extend$1(e,t){void 0===e&&(e={}),void 0===t&&(t={}),Object.keys(t).forEach((n=>{void 0===e[n]?e[n]=t[n]:isObject$1(t[n])&&isObject$1(e[n])&&Object.keys(t[n]).length>0&&extend$1(e[n],t[n]);}));}const ssrDocument={body:{},addEventListener(){},removeEventListener(){},activeElement:{blur(){},nodeName:""},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,createEvent:()=>({initEvent(){}}),createElement:()=>({children:[],childNodes:[],style:{},setAttribute(){},getElementsByTagName:()=>[]}),createElementNS:()=>({}),importNode:()=>null,location:{hash:"",host:"",hostname:"",href:"",origin:"",pathname:"",protocol:"",search:""}};function getDocument(){const e="undefined"!=typeof document?document:{};return extend$1(e,ssrDocument),e}const ssrWindow={document:ssrDocument,navigator:{userAgent:""},location:{hash:"",host:"",hostname:"",href:"",origin:"",pathname:"",protocol:"",search:""},history:{replaceState(){},pushState(){},go(){},back(){}},CustomEvent:function(){return this},addEventListener(){},removeEventListener(){},getComputedStyle:()=>({getPropertyValue:()=>""}),Image(){},Date(){},screen:{},setTimeout(){},clearTimeout(){},matchMedia:()=>({}),requestAnimationFrame:e=>"undefined"==typeof setTimeout?(e(),null):setTimeout(e,0),cancelAnimationFrame(e){"undefined"!=typeof setTimeout&&clearTimeout(e);}};function getWindow(){const e="undefined"!=typeof window?window:{};return extend$1(e,ssrWindow),e}

  function classesToTokens(e){return void 0===e&&(e=""),e.trim().split(" ").filter((e=>!!e.trim()))}function deleteProps(e){const t=e;Object.keys(t).forEach((e=>{try{t[e]=null;}catch(e){}try{delete t[e];}catch(e){}}));}function nextTick(e,t){return void 0===t&&(t=0),setTimeout(e,t)}function now(){return Date.now()}function getComputedStyle$1(e){const t=getWindow();let n;return t.getComputedStyle&&(n=t.getComputedStyle(e,null)),!n&&e.currentStyle&&(n=e.currentStyle),n||(n=e.style),n}function getTranslate(e,t){void 0===t&&(t="x");const n=getWindow();let r,o,s;const l=getComputedStyle$1(e);return n.WebKitCSSMatrix?(o=l.transform||l.webkitTransform,o.split(",").length>6&&(o=o.split(", ").map((e=>e.replace(",","."))).join(", ")),s=new n.WebKitCSSMatrix("none"===o?"":o)):(s=l.MozTransform||l.OTransform||l.MsTransform||l.msTransform||l.transform||l.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),r=s.toString().split(",")),"x"===t&&(o=n.WebKitCSSMatrix?s.m41:16===r.length?parseFloat(r[12]):parseFloat(r[4])),"y"===t&&(o=n.WebKitCSSMatrix?s.m42:16===r.length?parseFloat(r[13]):parseFloat(r[5])),o||0}function isObject(e){return "object"==typeof e&&null!==e&&e.constructor&&"Object"===Object.prototype.toString.call(e).slice(8,-1)}function isNode(e){return "undefined"!=typeof window&&void 0!==window.HTMLElement?e instanceof HTMLElement:e&&(1===e.nodeType||11===e.nodeType)}function extend(){const e=Object(arguments.length<=0?void 0:arguments[0]),t=["__proto__","constructor","prototype"];for(let n=1;n<arguments.length;n+=1){const r=n<0||arguments.length<=n?void 0:arguments[n];if(null!=r&&!isNode(r)){const n=Object.keys(Object(r)).filter((e=>t.indexOf(e)<0));for(let t=0,o=n.length;t<o;t+=1){const o=n[t],s=Object.getOwnPropertyDescriptor(r,o);void 0!==s&&s.enumerable&&(isObject(e[o])&&isObject(r[o])?r[o].__swiper__?e[o]=r[o]:extend(e[o],r[o]):!isObject(e[o])&&isObject(r[o])?(e[o]={},r[o].__swiper__?e[o]=r[o]:extend(e[o],r[o])):e[o]=r[o]);}}}return e}function setCSSProperty(e,t,n){e.style.setProperty(t,n);}function animateCSSModeScroll(e){let{swiper:t,targetPosition:n,side:r}=e;const o=getWindow(),s=-t.translate;let l,i=null;const a=t.params.speed;t.wrapperEl.style.scrollSnapType="none",o.cancelAnimationFrame(t.cssModeFrameID);const c=n>s?"next":"prev",m=(e,t)=>"next"===c&&e>=t||"prev"===c&&e<=t,u=()=>{l=(new Date).getTime(),null===i&&(i=l);const e=Math.max(Math.min((l-i)/a,1),0),c=.5-Math.cos(e*Math.PI)/2;let d=s+c*(n-s);if(m(d,n)&&(d=n),t.wrapperEl.scrollTo({[r]:d}),m(d,n))return t.wrapperEl.style.overflow="hidden",t.wrapperEl.style.scrollSnapType="",setTimeout((()=>{t.wrapperEl.style.overflow="",t.wrapperEl.scrollTo({[r]:d});})),void o.cancelAnimationFrame(t.cssModeFrameID);t.cssModeFrameID=o.requestAnimationFrame(u);};u();}function getSlideTransformEl(e){return e.querySelector(".swiper-slide-transform")||e.shadowRoot&&e.shadowRoot.querySelector(".swiper-slide-transform")||e}function elementChildren(e,t){void 0===t&&(t="");const n=[...e.children];return e instanceof HTMLSlotElement&&n.push(...e.assignedElements()),t?n.filter((e=>e.matches(t))):n}function elementIsChildOf(e,t){const n=t.contains(e);if(!n&&t instanceof HTMLSlotElement){return [...t.assignedElements()].includes(e)}return n}function showWarning(e){try{return void console.warn(e)}catch(e){}}function createElement(e,t){void 0===t&&(t=[]);const n=document.createElement(e);return n.classList.add(...Array.isArray(t)?t:classesToTokens(t)),n}function elementOffset(e){const t=getWindow(),n=getDocument(),r=e.getBoundingClientRect(),o=n.body,s=e.clientTop||o.clientTop||0,l=e.clientLeft||o.clientLeft||0,i=e===t?t.scrollY:e.scrollTop,a=e===t?t.scrollX:e.scrollLeft;return {top:r.top+i-s,left:r.left+a-l}}function elementPrevAll(e,t){const n=[];for(;e.previousElementSibling;){const r=e.previousElementSibling;t?r.matches(t)&&n.push(r):n.push(r),e=r;}return n}function elementNextAll(e,t){const n=[];for(;e.nextElementSibling;){const r=e.nextElementSibling;t?r.matches(t)&&n.push(r):n.push(r),e=r;}return n}function elementStyle(e,t){return getWindow().getComputedStyle(e,null).getPropertyValue(t)}function elementIndex(e){let t,n=e;if(n){for(t=0;null!==(n=n.previousSibling);)1===n.nodeType&&(t+=1);return t}}function elementParents(e,t){const n=[];let r=e.parentElement;for(;r;)t?r.matches(t)&&n.push(r):n.push(r),r=r.parentElement;return n}function elementTransitionEnd(e,t){t&&e.addEventListener("transitionend",(function n(r){r.target===e&&(t.call(e,r),e.removeEventListener("transitionend",n));}));}function elementOuterSize(e,t,n){const r=getWindow();return n?e["width"===t?"offsetWidth":"offsetHeight"]+parseFloat(r.getComputedStyle(e,null).getPropertyValue("width"===t?"margin-right":"margin-top"))+parseFloat(r.getComputedStyle(e,null).getPropertyValue("width"===t?"margin-left":"margin-bottom")):e.offsetWidth}function makeElementsArray(e){return (Array.isArray(e)?e:[e]).filter((e=>!!e))}function getRotateFix(e){return t=>Math.abs(t)>0&&e.browser&&e.browser.need3dFix&&Math.abs(t)%90==0?t+.001:t}

  let support,deviceCached,browser;function calcSupport(){const e=getWindow(),t=getDocument();return {smoothScroll:t.documentElement&&t.documentElement.style&&"scrollBehavior"in t.documentElement.style,touch:!!("ontouchstart"in e||e.DocumentTouch&&t instanceof e.DocumentTouch)}}function getSupport(){return support||(support=calcSupport()),support}function calcDevice(e){let{userAgent:t}=void 0===e?{}:e;const s=getSupport(),i=getWindow(),r=i.navigator.platform,n=t||i.navigator.userAgent,a={ios:!1,android:!1},l=i.screen.width,o=i.screen.height,d=n.match(/(Android);?[\s\/]+([\d.]+)?/);let c=n.match(/(iPad).*OS\s([\d_]+)/);const p=n.match(/(iPod)(.*OS\s([\d_]+))?/),u=!c&&n.match(/(iPhone\sOS|iOS)\s([\d_]+)/),h="Win32"===r;let m="MacIntel"===r;return !c&&m&&s.touch&&["1024x1366","1366x1024","834x1194","1194x834","834x1112","1112x834","768x1024","1024x768","820x1180","1180x820","810x1080","1080x810"].indexOf(`${l}x${o}`)>=0&&(c=n.match(/(Version)\/([\d.]+)/),c||(c=[0,1,"13_0_0"]),m=!1),d&&!h&&(a.os="android",a.android=!0),(c||u||p)&&(a.os="ios",a.ios=!0),a}function getDevice(e){return void 0===e&&(e={}),deviceCached||(deviceCached=calcDevice(e)),deviceCached}function calcBrowser(){const e=getWindow(),t=getDevice();let s=!1;function i(){const t=e.navigator.userAgent.toLowerCase();return t.indexOf("safari")>=0&&t.indexOf("chrome")<0&&t.indexOf("android")<0}if(i()){const t=String(e.navigator.userAgent);if(t.includes("Version/")){const[e,i]=t.split("Version/")[1].split(" ")[0].split(".").map((e=>Number(e)));s=e<16||16===e&&i<2;}}const r=/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(e.navigator.userAgent),n=i();return {isSafari:s||n,needPerspectiveFix:s,need3dFix:n||r&&t.ios,isWebView:r}}function getBrowser(){return browser||(browser=calcBrowser()),browser}function Resize(e){let{swiper:t,on:s,emit:i}=e;const r=getWindow();let n=null,a=null;const l=()=>{t&&!t.destroyed&&t.initialized&&(i("beforeResize"),i("resize"));},o=()=>{t&&!t.destroyed&&t.initialized&&i("orientationchange");};s("init",(()=>{t.params.resizeObserver&&void 0!==r.ResizeObserver?t&&!t.destroyed&&t.initialized&&(n=new ResizeObserver((e=>{a=r.requestAnimationFrame((()=>{const{width:s,height:i}=t;let r=s,n=i;e.forEach((e=>{let{contentBoxSize:s,contentRect:i,target:a}=e;a&&a!==t.el||(r=i?i.width:(s[0]||s).inlineSize,n=i?i.height:(s[0]||s).blockSize);})),r===s&&n===i||l();}));})),n.observe(t.el)):(r.addEventListener("resize",l),r.addEventListener("orientationchange",o));})),s("destroy",(()=>{a&&r.cancelAnimationFrame(a),n&&n.unobserve&&t.el&&(n.unobserve(t.el),n=null),r.removeEventListener("resize",l),r.removeEventListener("orientationchange",o);}));}function Observer(e){let{swiper:t,extendParams:s,on:i,emit:r}=e;const n=[],a=getWindow(),l=function(e,s){void 0===s&&(s={});const i=new(a.MutationObserver||a.WebkitMutationObserver)((e=>{if(t.__preventObserver__)return;if(1===e.length)return void r("observerUpdate",e[0]);const s=function(){r("observerUpdate",e[0]);};a.requestAnimationFrame?a.requestAnimationFrame(s):a.setTimeout(s,0);}));i.observe(e,{attributes:void 0===s.attributes||s.attributes,childList:t.isElement||(void 0===s.childList||s).childList,characterData:void 0===s.characterData||s.characterData}),n.push(i);};s({observer:!1,observeParents:!1,observeSlideChildren:!1}),i("init",(()=>{if(t.params.observer){if(t.params.observeParents){const e=elementParents(t.hostEl);for(let t=0;t<e.length;t+=1)l(e[t]);}l(t.hostEl,{childList:t.params.observeSlideChildren}),l(t.wrapperEl,{attributes:!1});}})),i("destroy",(()=>{n.forEach((e=>{e.disconnect();})),n.splice(0,n.length);}));}var eventsEmitter={on(e,t,s){const i=this;if(!i.eventsListeners||i.destroyed)return i;if("function"!=typeof t)return i;const r=s?"unshift":"push";return e.split(" ").forEach((e=>{i.eventsListeners[e]||(i.eventsListeners[e]=[]),i.eventsListeners[e][r](t);})),i},once(e,t,s){const i=this;if(!i.eventsListeners||i.destroyed)return i;if("function"!=typeof t)return i;function r(){i.off(e,r),r.__emitterProxy&&delete r.__emitterProxy;for(var s=arguments.length,n=new Array(s),a=0;a<s;a++)n[a]=arguments[a];t.apply(i,n);}return r.__emitterProxy=t,i.on(e,r,s)},onAny(e,t){const s=this;if(!s.eventsListeners||s.destroyed)return s;if("function"!=typeof e)return s;const i=t?"unshift":"push";return s.eventsAnyListeners.indexOf(e)<0&&s.eventsAnyListeners[i](e),s},offAny(e){const t=this;if(!t.eventsListeners||t.destroyed)return t;if(!t.eventsAnyListeners)return t;const s=t.eventsAnyListeners.indexOf(e);return s>=0&&t.eventsAnyListeners.splice(s,1),t},off(e,t){const s=this;return !s.eventsListeners||s.destroyed?s:s.eventsListeners?(e.split(" ").forEach((e=>{void 0===t?s.eventsListeners[e]=[]:s.eventsListeners[e]&&s.eventsListeners[e].forEach(((i,r)=>{(i===t||i.__emitterProxy&&i.__emitterProxy===t)&&s.eventsListeners[e].splice(r,1);}));})),s):s},emit(){const e=this;if(!e.eventsListeners||e.destroyed)return e;if(!e.eventsListeners)return e;let t,s,i;for(var r=arguments.length,n=new Array(r),a=0;a<r;a++)n[a]=arguments[a];"string"==typeof n[0]||Array.isArray(n[0])?(t=n[0],s=n.slice(1,n.length),i=e):(t=n[0].events,s=n[0].data,i=n[0].context||e),s.unshift(i);return (Array.isArray(t)?t:t.split(" ")).forEach((t=>{e.eventsAnyListeners&&e.eventsAnyListeners.length&&e.eventsAnyListeners.forEach((e=>{e.apply(i,[t,...s]);})),e.eventsListeners&&e.eventsListeners[t]&&e.eventsListeners[t].forEach((e=>{e.apply(i,s);}));})),e}};function updateSize(){const e=this;let t,s;const i=e.el;t=void 0!==e.params.width&&null!==e.params.width?e.params.width:i.clientWidth,s=void 0!==e.params.height&&null!==e.params.height?e.params.height:i.clientHeight,0===t&&e.isHorizontal()||0===s&&e.isVertical()||(t=t-parseInt(elementStyle(i,"padding-left")||0,10)-parseInt(elementStyle(i,"padding-right")||0,10),s=s-parseInt(elementStyle(i,"padding-top")||0,10)-parseInt(elementStyle(i,"padding-bottom")||0,10),Number.isNaN(t)&&(t=0),Number.isNaN(s)&&(s=0),Object.assign(e,{width:t,height:s,size:e.isHorizontal()?t:s}));}function updateSlides(){const e=this;function t(t,s){return parseFloat(t.getPropertyValue(e.getDirectionLabel(s))||0)}const s=e.params,{wrapperEl:i,slidesEl:r,size:n,rtlTranslate:a,wrongRTL:l}=e,o=e.virtual&&s.virtual.enabled,d=o?e.virtual.slides.length:e.slides.length,c=elementChildren(r,`.${e.params.slideClass}, swiper-slide`),p=o?e.virtual.slides.length:c.length;let u=[];const h=[],m=[];let f=s.slidesOffsetBefore;"function"==typeof f&&(f=s.slidesOffsetBefore.call(e));let v=s.slidesOffsetAfter;"function"==typeof v&&(v=s.slidesOffsetAfter.call(e));const g=e.snapGrid.length,w=e.slidesGrid.length;let S=s.spaceBetween,T=-f,b=0,x=0;if(void 0===n)return;"string"==typeof S&&S.indexOf("%")>=0?S=parseFloat(S.replace("%",""))/100*n:"string"==typeof S&&(S=parseFloat(S)),e.virtualSize=-S,c.forEach((e=>{a?e.style.marginLeft="":e.style.marginRight="",e.style.marginBottom="",e.style.marginTop="";})),s.centeredSlides&&s.cssMode&&(setCSSProperty(i,"--swiper-centered-offset-before",""),setCSSProperty(i,"--swiper-centered-offset-after",""));const y=s.grid&&s.grid.rows>1&&e.grid;let E;y?e.grid.initSlides(c):e.grid&&e.grid.unsetSlides();const C="auto"===s.slidesPerView&&s.breakpoints&&Object.keys(s.breakpoints).filter((e=>void 0!==s.breakpoints[e].slidesPerView)).length>0;for(let i=0;i<p;i+=1){let r;if(E=0,c[i]&&(r=c[i]),y&&e.grid.updateSlide(i,r,c),!c[i]||"none"!==elementStyle(r,"display")){if("auto"===s.slidesPerView){C&&(c[i].style[e.getDirectionLabel("width")]="");const n=getComputedStyle(r),a=r.style.transform,l=r.style.webkitTransform;if(a&&(r.style.transform="none"),l&&(r.style.webkitTransform="none"),s.roundLengths)E=e.isHorizontal()?elementOuterSize(r,"width",!0):elementOuterSize(r,"height",!0);else {const e=t(n,"width"),s=t(n,"padding-left"),i=t(n,"padding-right"),a=t(n,"margin-left"),l=t(n,"margin-right"),o=n.getPropertyValue("box-sizing");if(o&&"border-box"===o)E=e+a+l;else {const{clientWidth:t,offsetWidth:n}=r;E=e+s+i+a+l+(n-t);}}a&&(r.style.transform=a),l&&(r.style.webkitTransform=l),s.roundLengths&&(E=Math.floor(E));}else E=(n-(s.slidesPerView-1)*S)/s.slidesPerView,s.roundLengths&&(E=Math.floor(E)),c[i]&&(c[i].style[e.getDirectionLabel("width")]=`${E}px`);c[i]&&(c[i].swiperSlideSize=E),m.push(E),s.centeredSlides?(T=T+E/2+b/2+S,0===b&&0!==i&&(T=T-n/2-S),0===i&&(T=T-n/2-S),Math.abs(T)<.001&&(T=0),s.roundLengths&&(T=Math.floor(T)),x%s.slidesPerGroup==0&&u.push(T),h.push(T)):(s.roundLengths&&(T=Math.floor(T)),(x-Math.min(e.params.slidesPerGroupSkip,x))%e.params.slidesPerGroup==0&&u.push(T),h.push(T),T=T+E+S),e.virtualSize+=E+S,b=E,x+=1;}}if(e.virtualSize=Math.max(e.virtualSize,n)+v,a&&l&&("slide"===s.effect||"coverflow"===s.effect)&&(i.style.width=`${e.virtualSize+S}px`),s.setWrapperSize&&(i.style[e.getDirectionLabel("width")]=`${e.virtualSize+S}px`),y&&e.grid.updateWrapperSize(E,u),!s.centeredSlides){const t=[];for(let i=0;i<u.length;i+=1){let r=u[i];s.roundLengths&&(r=Math.floor(r)),u[i]<=e.virtualSize-n&&t.push(r);}u=t,Math.floor(e.virtualSize-n)-Math.floor(u[u.length-1])>1&&u.push(e.virtualSize-n);}if(o&&s.loop){const t=m[0]+S;if(s.slidesPerGroup>1){const i=Math.ceil((e.virtual.slidesBefore+e.virtual.slidesAfter)/s.slidesPerGroup),r=t*s.slidesPerGroup;for(let e=0;e<i;e+=1)u.push(u[u.length-1]+r);}for(let i=0;i<e.virtual.slidesBefore+e.virtual.slidesAfter;i+=1)1===s.slidesPerGroup&&u.push(u[u.length-1]+t),h.push(h[h.length-1]+t),e.virtualSize+=t;}if(0===u.length&&(u=[0]),0!==S){const t=e.isHorizontal()&&a?"marginLeft":e.getDirectionLabel("marginRight");c.filter(((e,t)=>!(s.cssMode&&!s.loop)||t!==c.length-1)).forEach((e=>{e.style[t]=`${S}px`;}));}if(s.centeredSlides&&s.centeredSlidesBounds){let e=0;m.forEach((t=>{e+=t+(S||0);})),e-=S;const t=e>n?e-n:0;u=u.map((e=>e<=0?-f:e>t?t+v:e));}if(s.centerInsufficientSlides){let e=0;m.forEach((t=>{e+=t+(S||0);})),e-=S;const t=(s.slidesOffsetBefore||0)+(s.slidesOffsetAfter||0);if(e+t<n){const s=(n-e-t)/2;u.forEach(((e,t)=>{u[t]=e-s;})),h.forEach(((e,t)=>{h[t]=e+s;}));}}if(Object.assign(e,{slides:c,snapGrid:u,slidesGrid:h,slidesSizesGrid:m}),s.centeredSlides&&s.cssMode&&!s.centeredSlidesBounds){setCSSProperty(i,"--swiper-centered-offset-before",-u[0]+"px"),setCSSProperty(i,"--swiper-centered-offset-after",e.size/2-m[m.length-1]/2+"px");const t=-e.snapGrid[0],s=-e.slidesGrid[0];e.snapGrid=e.snapGrid.map((e=>e+t)),e.slidesGrid=e.slidesGrid.map((e=>e+s));}if(p!==d&&e.emit("slidesLengthChange"),u.length!==g&&(e.params.watchOverflow&&e.checkOverflow(),e.emit("snapGridLengthChange")),h.length!==w&&e.emit("slidesGridLengthChange"),s.watchSlidesProgress&&e.updateSlidesOffset(),e.emit("slidesUpdated"),!(o||s.cssMode||"slide"!==s.effect&&"fade"!==s.effect)){const t=`${s.containerModifierClass}backface-hidden`,i=e.el.classList.contains(t);p<=s.maxBackfaceHiddenSlides?i||e.el.classList.add(t):i&&e.el.classList.remove(t);}}function updateAutoHeight(e){const t=this,s=[],i=t.virtual&&t.params.virtual.enabled;let r,n=0;"number"==typeof e?t.setTransition(e):!0===e&&t.setTransition(t.params.speed);const a=e=>i?t.slides[t.getSlideIndexByData(e)]:t.slides[e];if("auto"!==t.params.slidesPerView&&t.params.slidesPerView>1)if(t.params.centeredSlides)(t.visibleSlides||[]).forEach((e=>{s.push(e);}));else for(r=0;r<Math.ceil(t.params.slidesPerView);r+=1){const e=t.activeIndex+r;if(e>t.slides.length&&!i)break;s.push(a(e));}else s.push(a(t.activeIndex));for(r=0;r<s.length;r+=1)if(void 0!==s[r]){const e=s[r].offsetHeight;n=e>n?e:n;}(n||0===n)&&(t.wrapperEl.style.height=`${n}px`);}function updateSlidesOffset(){const e=this,t=e.slides,s=e.isElement?e.isHorizontal()?e.wrapperEl.offsetLeft:e.wrapperEl.offsetTop:0;for(let i=0;i<t.length;i+=1)t[i].swiperSlideOffset=(e.isHorizontal()?t[i].offsetLeft:t[i].offsetTop)-s-e.cssOverflowAdjustment();}const toggleSlideClasses$1=(e,t,s)=>{t&&!e.classList.contains(s)?e.classList.add(s):!t&&e.classList.contains(s)&&e.classList.remove(s);};function updateSlidesProgress(e){void 0===e&&(e=this&&this.translate||0);const t=this,s=t.params,{slides:i,rtlTranslate:r,snapGrid:n}=t;if(0===i.length)return;void 0===i[0].swiperSlideOffset&&t.updateSlidesOffset();let a=-e;r&&(a=e),t.visibleSlidesIndexes=[],t.visibleSlides=[];let l=s.spaceBetween;"string"==typeof l&&l.indexOf("%")>=0?l=parseFloat(l.replace("%",""))/100*t.size:"string"==typeof l&&(l=parseFloat(l));for(let e=0;e<i.length;e+=1){const o=i[e];let d=o.swiperSlideOffset;s.cssMode&&s.centeredSlides&&(d-=i[0].swiperSlideOffset);const c=(a+(s.centeredSlides?t.minTranslate():0)-d)/(o.swiperSlideSize+l),p=(a-n[0]+(s.centeredSlides?t.minTranslate():0)-d)/(o.swiperSlideSize+l),u=-(a-d),h=u+t.slidesSizesGrid[e],m=u>=0&&u<=t.size-t.slidesSizesGrid[e],f=u>=0&&u<t.size-1||h>1&&h<=t.size||u<=0&&h>=t.size;f&&(t.visibleSlides.push(o),t.visibleSlidesIndexes.push(e)),toggleSlideClasses$1(o,f,s.slideVisibleClass),toggleSlideClasses$1(o,m,s.slideFullyVisibleClass),o.progress=r?-c:c,o.originalProgress=r?-p:p;}}function updateProgress(e){const t=this;if(void 0===e){const s=t.rtlTranslate?-1:1;e=t&&t.translate&&t.translate*s||0;}const s=t.params,i=t.maxTranslate()-t.minTranslate();let{progress:r,isBeginning:n,isEnd:a,progressLoop:l}=t;const o=n,d=a;if(0===i)r=0,n=!0,a=!0;else {r=(e-t.minTranslate())/i;const s=Math.abs(e-t.minTranslate())<1,l=Math.abs(e-t.maxTranslate())<1;n=s||r<=0,a=l||r>=1,s&&(r=0),l&&(r=1);}if(s.loop){const s=t.getSlideIndexByData(0),i=t.getSlideIndexByData(t.slides.length-1),r=t.slidesGrid[s],n=t.slidesGrid[i],a=t.slidesGrid[t.slidesGrid.length-1],o=Math.abs(e);l=o>=r?(o-r)/a:(o+a-n)/a,l>1&&(l-=1);}Object.assign(t,{progress:r,progressLoop:l,isBeginning:n,isEnd:a}),(s.watchSlidesProgress||s.centeredSlides&&s.autoHeight)&&t.updateSlidesProgress(e),n&&!o&&t.emit("reachBeginning toEdge"),a&&!d&&t.emit("reachEnd toEdge"),(o&&!n||d&&!a)&&t.emit("fromEdge"),t.emit("progress",r);}const toggleSlideClasses=(e,t,s)=>{t&&!e.classList.contains(s)?e.classList.add(s):!t&&e.classList.contains(s)&&e.classList.remove(s);};function updateSlidesClasses(){const e=this,{slides:t,params:s,slidesEl:i,activeIndex:r}=e,n=e.virtual&&s.virtual.enabled,a=e.grid&&s.grid&&s.grid.rows>1,l=e=>elementChildren(i,`.${s.slideClass}${e}, swiper-slide${e}`)[0];let o,d,c;if(n)if(s.loop){let t=r-e.virtual.slidesBefore;t<0&&(t=e.virtual.slides.length+t),t>=e.virtual.slides.length&&(t-=e.virtual.slides.length),o=l(`[data-swiper-slide-index="${t}"]`);}else o=l(`[data-swiper-slide-index="${r}"]`);else a?(o=t.filter((e=>e.column===r))[0],c=t.filter((e=>e.column===r+1))[0],d=t.filter((e=>e.column===r-1))[0]):o=t[r];o&&(a||(c=elementNextAll(o,`.${s.slideClass}, swiper-slide`)[0],s.loop&&!c&&(c=t[0]),d=elementPrevAll(o,`.${s.slideClass}, swiper-slide`)[0],s.loop&&0===!d&&(d=t[t.length-1]))),t.forEach((e=>{toggleSlideClasses(e,e===o,s.slideActiveClass),toggleSlideClasses(e,e===c,s.slideNextClass),toggleSlideClasses(e,e===d,s.slidePrevClass);})),e.emitSlidesClasses();}const processLazyPreloader=(e,t)=>{if(!e||e.destroyed||!e.params)return;const s=t.closest(e.isElement?"swiper-slide":`.${e.params.slideClass}`);if(s){let t=s.querySelector(`.${e.params.lazyPreloaderClass}`);!t&&e.isElement&&(s.shadowRoot?t=s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`):requestAnimationFrame((()=>{s.shadowRoot&&(t=s.shadowRoot.querySelector(`.${e.params.lazyPreloaderClass}`),t&&t.remove());}))),t&&t.remove();}},unlazy=(e,t)=>{if(!e.slides[t])return;const s=e.slides[t].querySelector('[loading="lazy"]');s&&s.removeAttribute("loading");},preload=e=>{if(!e||e.destroyed||!e.params)return;let t=e.params.lazyPreloadPrevNext;const s=e.slides.length;if(!s||!t||t<0)return;t=Math.min(t,s);const i="auto"===e.params.slidesPerView?e.slidesPerViewDynamic():Math.ceil(e.params.slidesPerView),r=e.activeIndex;if(e.params.grid&&e.params.grid.rows>1){const s=r,n=[s-t];return n.push(...Array.from({length:t}).map(((e,t)=>s+i+t))),void e.slides.forEach(((t,s)=>{n.includes(t.column)&&unlazy(e,s);}))}const n=r+i-1;if(e.params.rewind||e.params.loop)for(let i=r-t;i<=n+t;i+=1){const t=(i%s+s)%s;(t<r||t>n)&&unlazy(e,t);}else for(let i=Math.max(r-t,0);i<=Math.min(n+t,s-1);i+=1)i!==r&&(i>n||i<r)&&unlazy(e,i);};function getActiveIndexByTranslate(e){const{slidesGrid:t,params:s}=e,i=e.rtlTranslate?e.translate:-e.translate;let r;for(let e=0;e<t.length;e+=1)void 0!==t[e+1]?i>=t[e]&&i<t[e+1]-(t[e+1]-t[e])/2?r=e:i>=t[e]&&i<t[e+1]&&(r=e+1):i>=t[e]&&(r=e);return s.normalizeSlideIndex&&(r<0||void 0===r)&&(r=0),r}function updateActiveIndex(e){const t=this,s=t.rtlTranslate?t.translate:-t.translate,{snapGrid:i,params:r,activeIndex:n,realIndex:a,snapIndex:l}=t;let o,d=e;const c=e=>{let s=e-t.virtual.slidesBefore;return s<0&&(s=t.virtual.slides.length+s),s>=t.virtual.slides.length&&(s-=t.virtual.slides.length),s};if(void 0===d&&(d=getActiveIndexByTranslate(t)),i.indexOf(s)>=0)o=i.indexOf(s);else {const e=Math.min(r.slidesPerGroupSkip,d);o=e+Math.floor((d-e)/r.slidesPerGroup);}if(o>=i.length&&(o=i.length-1),d===n&&!t.params.loop)return void(o!==l&&(t.snapIndex=o,t.emit("snapIndexChange")));if(d===n&&t.params.loop&&t.virtual&&t.params.virtual.enabled)return void(t.realIndex=c(d));const p=t.grid&&r.grid&&r.grid.rows>1;let u;if(t.virtual&&r.virtual.enabled&&r.loop)u=c(d);else if(p){const e=t.slides.filter((e=>e.column===d))[0];let s=parseInt(e.getAttribute("data-swiper-slide-index"),10);Number.isNaN(s)&&(s=Math.max(t.slides.indexOf(e),0)),u=Math.floor(s/r.grid.rows);}else if(t.slides[d]){const e=t.slides[d].getAttribute("data-swiper-slide-index");u=e?parseInt(e,10):d;}else u=d;Object.assign(t,{previousSnapIndex:l,snapIndex:o,previousRealIndex:a,realIndex:u,previousIndex:n,activeIndex:d}),t.initialized&&preload(t),t.emit("activeIndexChange"),t.emit("snapIndexChange"),(t.initialized||t.params.runCallbacksOnInit)&&(a!==u&&t.emit("realIndexChange"),t.emit("slideChange"));}function updateClickedSlide(e,t){const s=this,i=s.params;let r=e.closest(`.${i.slideClass}, swiper-slide`);!r&&s.isElement&&t&&t.length>1&&t.includes(e)&&[...t.slice(t.indexOf(e)+1,t.length)].forEach((e=>{!r&&e.matches&&e.matches(`.${i.slideClass}, swiper-slide`)&&(r=e);}));let n,a=!1;if(r)for(let e=0;e<s.slides.length;e+=1)if(s.slides[e]===r){a=!0,n=e;break}if(!r||!a)return s.clickedSlide=void 0,void(s.clickedIndex=void 0);s.clickedSlide=r,s.virtual&&s.params.virtual.enabled?s.clickedIndex=parseInt(r.getAttribute("data-swiper-slide-index"),10):s.clickedIndex=n,i.slideToClickedSlide&&void 0!==s.clickedIndex&&s.clickedIndex!==s.activeIndex&&s.slideToClickedSlide();}var update={updateSize:updateSize,updateSlides:updateSlides,updateAutoHeight:updateAutoHeight,updateSlidesOffset:updateSlidesOffset,updateSlidesProgress:updateSlidesProgress,updateProgress:updateProgress,updateSlidesClasses:updateSlidesClasses,updateActiveIndex:updateActiveIndex,updateClickedSlide:updateClickedSlide};function getSwiperTranslate(e){void 0===e&&(e=this.isHorizontal()?"x":"y");const{params:t,rtlTranslate:s,translate:i,wrapperEl:r}=this;if(t.virtualTranslate)return s?-i:i;if(t.cssMode)return i;let n=getTranslate(r,e);return n+=this.cssOverflowAdjustment(),s&&(n=-n),n||0}function setTranslate(e,t){const s=this,{rtlTranslate:i,params:r,wrapperEl:n,progress:a}=s;let l=0,o=0;let d;s.isHorizontal()?l=i?-e:e:o=e,r.roundLengths&&(l=Math.floor(l),o=Math.floor(o)),s.previousTranslate=s.translate,s.translate=s.isHorizontal()?l:o,r.cssMode?n[s.isHorizontal()?"scrollLeft":"scrollTop"]=s.isHorizontal()?-l:-o:r.virtualTranslate||(s.isHorizontal()?l-=s.cssOverflowAdjustment():o-=s.cssOverflowAdjustment(),n.style.transform=`translate3d(${l}px, ${o}px, 0px)`);const c=s.maxTranslate()-s.minTranslate();d=0===c?0:(e-s.minTranslate())/c,d!==a&&s.updateProgress(e),s.emit("setTranslate",s.translate,t);}function minTranslate(){return -this.snapGrid[0]}function maxTranslate(){return -this.snapGrid[this.snapGrid.length-1]}function translateTo(e,t,s,i,r){void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===s&&(s=!0),void 0===i&&(i=!0);const n=this,{params:a,wrapperEl:l}=n;if(n.animating&&a.preventInteractionOnTransition)return !1;const o=n.minTranslate(),d=n.maxTranslate();let c;if(c=i&&e>o?o:i&&e<d?d:e,n.updateProgress(c),a.cssMode){const e=n.isHorizontal();if(0===t)l[e?"scrollLeft":"scrollTop"]=-c;else {if(!n.support.smoothScroll)return animateCSSModeScroll({swiper:n,targetPosition:-c,side:e?"left":"top"}),!0;l.scrollTo({[e?"left":"top"]:-c,behavior:"smooth"});}return !0}return 0===t?(n.setTransition(0),n.setTranslate(c),s&&(n.emit("beforeTransitionStart",t,r),n.emit("transitionEnd"))):(n.setTransition(t),n.setTranslate(c),s&&(n.emit("beforeTransitionStart",t,r),n.emit("transitionStart")),n.animating||(n.animating=!0,n.onTranslateToWrapperTransitionEnd||(n.onTranslateToWrapperTransitionEnd=function(e){n&&!n.destroyed&&e.target===this&&(n.wrapperEl.removeEventListener("transitionend",n.onTranslateToWrapperTransitionEnd),n.onTranslateToWrapperTransitionEnd=null,delete n.onTranslateToWrapperTransitionEnd,n.animating=!1,s&&n.emit("transitionEnd"));}),n.wrapperEl.addEventListener("transitionend",n.onTranslateToWrapperTransitionEnd))),!0}var translate={getTranslate:getSwiperTranslate,setTranslate:setTranslate,minTranslate:minTranslate,maxTranslate:maxTranslate,translateTo:translateTo};function setTransition(e,t){const s=this;s.params.cssMode||(s.wrapperEl.style.transitionDuration=`${e}ms`,s.wrapperEl.style.transitionDelay=0===e?"0ms":""),s.emit("setTransition",e,t);}function transitionEmit(e){let{swiper:t,runCallbacks:s,direction:i,step:r}=e;const{activeIndex:n,previousIndex:a}=t;let l=i;if(l||(l=n>a?"next":n<a?"prev":"reset"),t.emit(`transition${r}`),s&&n!==a){if("reset"===l)return void t.emit(`slideResetTransition${r}`);t.emit(`slideChangeTransition${r}`),"next"===l?t.emit(`slideNextTransition${r}`):t.emit(`slidePrevTransition${r}`);}}function transitionStart(e,t){void 0===e&&(e=!0);const s=this,{params:i}=s;i.cssMode||(i.autoHeight&&s.updateAutoHeight(),transitionEmit({swiper:s,runCallbacks:e,direction:t,step:"Start"}));}function transitionEnd(e,t){void 0===e&&(e=!0);const s=this,{params:i}=s;s.animating=!1,i.cssMode||(s.setTransition(0),transitionEmit({swiper:s,runCallbacks:e,direction:t,step:"End"}));}var transition={setTransition:setTransition,transitionStart:transitionStart,transitionEnd:transitionEnd};function slideTo(e,t,s,i,r){void 0===e&&(e=0),void 0===s&&(s=!0),"string"==typeof e&&(e=parseInt(e,10));const n=this;let a=e;a<0&&(a=0);const{params:l,snapGrid:o,slidesGrid:d,previousIndex:c,activeIndex:p,rtlTranslate:u,wrapperEl:h,enabled:m}=n;if(!m&&!i&&!r||n.destroyed||n.animating&&l.preventInteractionOnTransition)return !1;void 0===t&&(t=n.params.speed);const f=Math.min(n.params.slidesPerGroupSkip,a);let v=f+Math.floor((a-f)/n.params.slidesPerGroup);v>=o.length&&(v=o.length-1);const g=-o[v];if(l.normalizeSlideIndex)for(let e=0;e<d.length;e+=1){const t=-Math.floor(100*g),s=Math.floor(100*d[e]),i=Math.floor(100*d[e+1]);void 0!==d[e+1]?t>=s&&t<i-(i-s)/2?a=e:t>=s&&t<i&&(a=e+1):t>=s&&(a=e);}if(n.initialized&&a!==p){if(!n.allowSlideNext&&(u?g>n.translate&&g>n.minTranslate():g<n.translate&&g<n.minTranslate()))return !1;if(!n.allowSlidePrev&&g>n.translate&&g>n.maxTranslate()&&(p||0)!==a)return !1}let w;a!==(c||0)&&s&&n.emit("beforeSlideChangeStart"),n.updateProgress(g),w=a>p?"next":a<p?"prev":"reset";const S=n.virtual&&n.params.virtual.enabled;if(!(S&&r)&&(u&&-g===n.translate||!u&&g===n.translate))return n.updateActiveIndex(a),l.autoHeight&&n.updateAutoHeight(),n.updateSlidesClasses(),"slide"!==l.effect&&n.setTranslate(g),"reset"!==w&&(n.transitionStart(s,w),n.transitionEnd(s,w)),!1;if(l.cssMode){const e=n.isHorizontal(),s=u?g:-g;if(0===t)S&&(n.wrapperEl.style.scrollSnapType="none",n._immediateVirtual=!0),S&&!n._cssModeVirtualInitialSet&&n.params.initialSlide>0?(n._cssModeVirtualInitialSet=!0,requestAnimationFrame((()=>{h[e?"scrollLeft":"scrollTop"]=s;}))):h[e?"scrollLeft":"scrollTop"]=s,S&&requestAnimationFrame((()=>{n.wrapperEl.style.scrollSnapType="",n._immediateVirtual=!1;}));else {if(!n.support.smoothScroll)return animateCSSModeScroll({swiper:n,targetPosition:s,side:e?"left":"top"}),!0;h.scrollTo({[e?"left":"top"]:s,behavior:"smooth"});}return !0}return n.setTransition(t),n.setTranslate(g),n.updateActiveIndex(a),n.updateSlidesClasses(),n.emit("beforeTransitionStart",t,i),n.transitionStart(s,w),0===t?n.transitionEnd(s,w):n.animating||(n.animating=!0,n.onSlideToWrapperTransitionEnd||(n.onSlideToWrapperTransitionEnd=function(e){n&&!n.destroyed&&e.target===this&&(n.wrapperEl.removeEventListener("transitionend",n.onSlideToWrapperTransitionEnd),n.onSlideToWrapperTransitionEnd=null,delete n.onSlideToWrapperTransitionEnd,n.transitionEnd(s,w));}),n.wrapperEl.addEventListener("transitionend",n.onSlideToWrapperTransitionEnd)),!0}function slideToLoop(e,t,s,i){if(void 0===e&&(e=0),void 0===s&&(s=!0),"string"==typeof e){e=parseInt(e,10);}const r=this;if(r.destroyed)return;void 0===t&&(t=r.params.speed);const n=r.grid&&r.params.grid&&r.params.grid.rows>1;let a=e;if(r.params.loop)if(r.virtual&&r.params.virtual.enabled)a+=r.virtual.slidesBefore;else {let e;if(n){const t=a*r.params.grid.rows;e=r.slides.filter((e=>1*e.getAttribute("data-swiper-slide-index")===t))[0].column;}else e=r.getSlideIndexByData(a);const t=n?Math.ceil(r.slides.length/r.params.grid.rows):r.slides.length,{centeredSlides:s}=r.params;let l=r.params.slidesPerView;"auto"===l?l=r.slidesPerViewDynamic():(l=Math.ceil(parseFloat(r.params.slidesPerView,10)),s&&l%2==0&&(l+=1));let o=t-e<l;if(s&&(o=o||e<Math.ceil(l/2)),i&&s&&"auto"!==r.params.slidesPerView&&!n&&(o=!1),o){const i=s?e<r.activeIndex?"prev":"next":e-r.activeIndex-1<r.params.slidesPerView?"next":"prev";r.loopFix({direction:i,slideTo:!0,activeSlideIndex:"next"===i?e+1:e-t+1,slideRealIndex:"next"===i?r.realIndex:void 0});}if(n){const e=a*r.params.grid.rows;a=r.slides.filter((t=>1*t.getAttribute("data-swiper-slide-index")===e))[0].column;}else a=r.getSlideIndexByData(a);}return requestAnimationFrame((()=>{r.slideTo(a,t,s,i);})),r}function slideNext(e,t,s){void 0===t&&(t=!0);const i=this,{enabled:r,params:n,animating:a}=i;if(!r||i.destroyed)return i;void 0===e&&(e=i.params.speed);let l=n.slidesPerGroup;"auto"===n.slidesPerView&&1===n.slidesPerGroup&&n.slidesPerGroupAuto&&(l=Math.max(i.slidesPerViewDynamic("current",!0),1));const o=i.activeIndex<n.slidesPerGroupSkip?1:l,d=i.virtual&&n.virtual.enabled;if(n.loop){if(a&&!d&&n.loopPreventsSliding)return !1;if(i.loopFix({direction:"next"}),i._clientLeft=i.wrapperEl.clientLeft,i.activeIndex===i.slides.length-1&&n.cssMode)return requestAnimationFrame((()=>{i.slideTo(i.activeIndex+o,e,t,s);})),!0}return n.rewind&&i.isEnd?i.slideTo(0,e,t,s):i.slideTo(i.activeIndex+o,e,t,s)}function slidePrev(e,t,s){void 0===t&&(t=!0);const i=this,{params:r,snapGrid:n,slidesGrid:a,rtlTranslate:l,enabled:o,animating:d}=i;if(!o||i.destroyed)return i;void 0===e&&(e=i.params.speed);const c=i.virtual&&r.virtual.enabled;if(r.loop){if(d&&!c&&r.loopPreventsSliding)return !1;i.loopFix({direction:"prev"}),i._clientLeft=i.wrapperEl.clientLeft;}function p(e){return e<0?-Math.floor(Math.abs(e)):Math.floor(e)}const u=p(l?i.translate:-i.translate),h=n.map((e=>p(e)));let m=n[h.indexOf(u)-1];if(void 0===m&&r.cssMode){let e;n.forEach(((t,s)=>{u>=t&&(e=s);})),void 0!==e&&(m=n[e>0?e-1:e]);}let f=0;if(void 0!==m&&(f=a.indexOf(m),f<0&&(f=i.activeIndex-1),"auto"===r.slidesPerView&&1===r.slidesPerGroup&&r.slidesPerGroupAuto&&(f=f-i.slidesPerViewDynamic("previous",!0)+1,f=Math.max(f,0))),r.rewind&&i.isBeginning){const r=i.params.virtual&&i.params.virtual.enabled&&i.virtual?i.virtual.slides.length-1:i.slides.length-1;return i.slideTo(r,e,t,s)}return r.loop&&0===i.activeIndex&&r.cssMode?(requestAnimationFrame((()=>{i.slideTo(f,e,t,s);})),!0):i.slideTo(f,e,t,s)}function slideReset(e,t,s){void 0===t&&(t=!0);const i=this;if(!i.destroyed)return void 0===e&&(e=i.params.speed),i.slideTo(i.activeIndex,e,t,s)}function slideToClosest(e,t,s,i){void 0===t&&(t=!0),void 0===i&&(i=.5);const r=this;if(r.destroyed)return;void 0===e&&(e=r.params.speed);let n=r.activeIndex;const a=Math.min(r.params.slidesPerGroupSkip,n),l=a+Math.floor((n-a)/r.params.slidesPerGroup),o=r.rtlTranslate?r.translate:-r.translate;if(o>=r.snapGrid[l]){const e=r.snapGrid[l];o-e>(r.snapGrid[l+1]-e)*i&&(n+=r.params.slidesPerGroup);}else {const e=r.snapGrid[l-1];o-e<=(r.snapGrid[l]-e)*i&&(n-=r.params.slidesPerGroup);}return n=Math.max(n,0),n=Math.min(n,r.slidesGrid.length-1),r.slideTo(n,e,t,s)}function slideToClickedSlide(){const e=this;if(e.destroyed)return;const{params:t,slidesEl:s}=e,i="auto"===t.slidesPerView?e.slidesPerViewDynamic():t.slidesPerView;let r,n=e.clickedIndex;const a=e.isElement?"swiper-slide":`.${t.slideClass}`;if(t.loop){if(e.animating)return;r=parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"),10),t.centeredSlides?n<e.loopedSlides-i/2||n>e.slides.length-e.loopedSlides+i/2?(e.loopFix(),n=e.getSlideIndex(elementChildren(s,`${a}[data-swiper-slide-index="${r}"]`)[0]),nextTick((()=>{e.slideTo(n);}))):e.slideTo(n):n>e.slides.length-i?(e.loopFix(),n=e.getSlideIndex(elementChildren(s,`${a}[data-swiper-slide-index="${r}"]`)[0]),nextTick((()=>{e.slideTo(n);}))):e.slideTo(n);}else e.slideTo(n);}var slide={slideTo:slideTo,slideToLoop:slideToLoop,slideNext:slideNext,slidePrev:slidePrev,slideReset:slideReset,slideToClosest:slideToClosest,slideToClickedSlide:slideToClickedSlide};function loopCreate(e){const t=this,{params:s,slidesEl:i}=t;if(!s.loop||t.virtual&&t.params.virtual.enabled)return;const r=()=>{elementChildren(i,`.${s.slideClass}, swiper-slide`).forEach(((e,t)=>{e.setAttribute("data-swiper-slide-index",t);}));},n=t.grid&&s.grid&&s.grid.rows>1,a=s.slidesPerGroup*(n?s.grid.rows:1),l=t.slides.length%a!=0,o=n&&t.slides.length%s.grid.rows!=0,d=e=>{for(let i=0;i<e;i+=1){const e=t.isElement?createElement("swiper-slide",[s.slideBlankClass]):createElement("div",[s.slideClass,s.slideBlankClass]);t.slidesEl.append(e);}};if(l){if(s.loopAddBlankSlides){d(a-t.slides.length%a),t.recalcSlides(),t.updateSlides();}else showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");r();}else if(o){if(s.loopAddBlankSlides){d(s.grid.rows-t.slides.length%s.grid.rows),t.recalcSlides(),t.updateSlides();}else showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");r();}else r();t.loopFix({slideRealIndex:e,direction:s.centeredSlides?void 0:"next"});}function loopFix(e){let{slideRealIndex:t,slideTo:s=!0,direction:i,setTranslate:r,activeSlideIndex:n,byController:a,byMousewheel:l}=void 0===e?{}:e;const o=this;if(!o.params.loop)return;o.emit("beforeLoopFix");const{slides:d,allowSlidePrev:c,allowSlideNext:p,slidesEl:u,params:h}=o,{centeredSlides:m}=h;if(o.allowSlidePrev=!0,o.allowSlideNext=!0,o.virtual&&h.virtual.enabled)return s&&(h.centeredSlides||0!==o.snapIndex?h.centeredSlides&&o.snapIndex<h.slidesPerView?o.slideTo(o.virtual.slides.length+o.snapIndex,0,!1,!0):o.snapIndex===o.snapGrid.length-1&&o.slideTo(o.virtual.slidesBefore,0,!1,!0):o.slideTo(o.virtual.slides.length,0,!1,!0)),o.allowSlidePrev=c,o.allowSlideNext=p,void o.emit("loopFix");let f=h.slidesPerView;"auto"===f?f=o.slidesPerViewDynamic():(f=Math.ceil(parseFloat(h.slidesPerView,10)),m&&f%2==0&&(f+=1));const v=h.slidesPerGroupAuto?f:h.slidesPerGroup;let g=v;g%v!=0&&(g+=v-g%v),g+=h.loopAdditionalSlides,o.loopedSlides=g;const w=o.grid&&h.grid&&h.grid.rows>1;d.length<f+g?showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters"):w&&"row"===h.grid.fill&&showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");const S=[],T=[];let b=o.activeIndex;void 0===n?n=o.getSlideIndex(d.filter((e=>e.classList.contains(h.slideActiveClass)))[0]):b=n;const x="next"===i||!i,y="prev"===i||!i;let E=0,C=0;const P=w?Math.ceil(d.length/h.grid.rows):d.length,M=(w?d[n].column:n)+(m&&void 0===r?-f/2+.5:0);if(M<g){E=Math.max(g-M,v);for(let e=0;e<g-M;e+=1){const t=e-Math.floor(e/P)*P;if(w){const e=P-t-1;for(let t=d.length-1;t>=0;t-=1)d[t].column===e&&S.push(t);}else S.push(P-t-1);}}else if(M+f>P-g){C=Math.max(M-(P-2*g),v);for(let e=0;e<C;e+=1){const t=e-Math.floor(e/P)*P;w?d.forEach(((e,s)=>{e.column===t&&T.push(s);})):T.push(t);}}if(o.__preventObserver__=!0,requestAnimationFrame((()=>{o.__preventObserver__=!1;})),y&&S.forEach((e=>{d[e].swiperLoopMoveDOM=!0,u.prepend(d[e]),d[e].swiperLoopMoveDOM=!1;})),x&&T.forEach((e=>{d[e].swiperLoopMoveDOM=!0,u.append(d[e]),d[e].swiperLoopMoveDOM=!1;})),o.recalcSlides(),"auto"===h.slidesPerView?o.updateSlides():w&&(S.length>0&&y||T.length>0&&x)&&o.slides.forEach(((e,t)=>{o.grid.updateSlide(t,e,o.slides);})),h.watchSlidesProgress&&o.updateSlidesOffset(),s)if(S.length>0&&y){if(void 0===t){const e=o.slidesGrid[b],t=o.slidesGrid[b+E]-e;l?o.setTranslate(o.translate-t):(o.slideTo(b+Math.ceil(E),0,!1,!0),r&&(o.touchEventsData.startTranslate=o.touchEventsData.startTranslate-t,o.touchEventsData.currentTranslate=o.touchEventsData.currentTranslate-t));}else if(r){const e=w?S.length/h.grid.rows:S.length;o.slideTo(o.activeIndex+e,0,!1,!0),o.touchEventsData.currentTranslate=o.translate;}}else if(T.length>0&&x)if(void 0===t){const e=o.slidesGrid[b],t=o.slidesGrid[b-C]-e;l?o.setTranslate(o.translate-t):(o.slideTo(b-C,0,!1,!0),r&&(o.touchEventsData.startTranslate=o.touchEventsData.startTranslate-t,o.touchEventsData.currentTranslate=o.touchEventsData.currentTranslate-t));}else {const e=w?T.length/h.grid.rows:T.length;o.slideTo(o.activeIndex-e,0,!1,!0);}if(o.allowSlidePrev=c,o.allowSlideNext=p,o.controller&&o.controller.control&&!a){const e={slideRealIndex:t,direction:i,setTranslate:r,activeSlideIndex:n,byController:!0};Array.isArray(o.controller.control)?o.controller.control.forEach((t=>{!t.destroyed&&t.params.loop&&t.loopFix({...e,slideTo:t.params.slidesPerView===h.slidesPerView&&s});})):o.controller.control instanceof o.constructor&&o.controller.control.params.loop&&o.controller.control.loopFix({...e,slideTo:o.controller.control.params.slidesPerView===h.slidesPerView&&s});}o.emit("loopFix");}function loopDestroy(){const e=this,{params:t,slidesEl:s}=e;if(!t.loop||e.virtual&&e.params.virtual.enabled)return;e.recalcSlides();const i=[];e.slides.forEach((e=>{const t=void 0===e.swiperSlideIndex?1*e.getAttribute("data-swiper-slide-index"):e.swiperSlideIndex;i[t]=e;})),e.slides.forEach((e=>{e.removeAttribute("data-swiper-slide-index");})),i.forEach((e=>{s.append(e);})),e.recalcSlides(),e.slideTo(e.realIndex,0);}var loop={loopCreate:loopCreate,loopFix:loopFix,loopDestroy:loopDestroy};function setGrabCursor(e){const t=this;if(!t.params.simulateTouch||t.params.watchOverflow&&t.isLocked||t.params.cssMode)return;const s="container"===t.params.touchEventsTarget?t.el:t.wrapperEl;t.isElement&&(t.__preventObserver__=!0),s.style.cursor="move",s.style.cursor=e?"grabbing":"grab",t.isElement&&requestAnimationFrame((()=>{t.__preventObserver__=!1;}));}function unsetGrabCursor(){const e=this;e.params.watchOverflow&&e.isLocked||e.params.cssMode||(e.isElement&&(e.__preventObserver__=!0),e["container"===e.params.touchEventsTarget?"el":"wrapperEl"].style.cursor="",e.isElement&&requestAnimationFrame((()=>{e.__preventObserver__=!1;})));}var grabCursor={setGrabCursor:setGrabCursor,unsetGrabCursor:unsetGrabCursor};function closestElement(e,t){return void 0===t&&(t=this),function t(s){if(!s||s===getDocument()||s===getWindow())return null;s.assignedSlot&&(s=s.assignedSlot);const i=s.closest(e);return i||s.getRootNode?i||t(s.getRootNode().host):null}(t)}function preventEdgeSwipe(e,t,s){const i=getWindow(),{params:r}=e,n=r.edgeSwipeDetection,a=r.edgeSwipeThreshold;return !n||!(s<=a||s>=i.innerWidth-a)||"prevent"===n&&(t.preventDefault(),!0)}function onTouchStart(e){const t=this,s=getDocument();let i=e;i.originalEvent&&(i=i.originalEvent);const r=t.touchEventsData;if("pointerdown"===i.type){if(null!==r.pointerId&&r.pointerId!==i.pointerId)return;r.pointerId=i.pointerId;}else "touchstart"===i.type&&1===i.targetTouches.length&&(r.touchId=i.targetTouches[0].identifier);if("touchstart"===i.type)return void preventEdgeSwipe(t,i,i.targetTouches[0].pageX);const{params:n,touches:a,enabled:l}=t;if(!l)return;if(!n.simulateTouch&&"mouse"===i.pointerType)return;if(t.animating&&n.preventInteractionOnTransition)return;!t.animating&&n.cssMode&&n.loop&&t.loopFix();let o=i.target;if("wrapper"===n.touchEventsTarget&&!elementIsChildOf(o,t.wrapperEl))return;if("which"in i&&3===i.which)return;if("button"in i&&i.button>0)return;if(r.isTouched&&r.isMoved)return;const d=!!n.noSwipingClass&&""!==n.noSwipingClass,c=i.composedPath?i.composedPath():i.path;d&&i.target&&i.target.shadowRoot&&c&&(o=c[0]);const p=n.noSwipingSelector?n.noSwipingSelector:`.${n.noSwipingClass}`,u=!(!i.target||!i.target.shadowRoot);if(n.noSwiping&&(u?closestElement(p,o):o.closest(p)))return void(t.allowClick=!0);if(n.swipeHandler&&!o.closest(n.swipeHandler))return;a.currentX=i.pageX,a.currentY=i.pageY;const h=a.currentX,m=a.currentY;if(!preventEdgeSwipe(t,i,h))return;Object.assign(r,{isTouched:!0,isMoved:!1,allowTouchCallbacks:!0,isScrolling:void 0,startMoving:void 0}),a.startX=h,a.startY=m,r.touchStartTime=now(),t.allowClick=!0,t.updateSize(),t.swipeDirection=void 0,n.threshold>0&&(r.allowThresholdMove=!1);let f=!0;o.matches(r.focusableElements)&&(f=!1,"SELECT"===o.nodeName&&(r.isTouched=!1)),s.activeElement&&s.activeElement.matches(r.focusableElements)&&s.activeElement!==o&&("mouse"===i.pointerType||"mouse"!==i.pointerType&&!o.matches(r.focusableElements))&&s.activeElement.blur();const v=f&&t.allowTouchMove&&n.touchStartPreventDefault;!n.touchStartForcePreventDefault&&!v||o.isContentEditable||i.preventDefault(),n.freeMode&&n.freeMode.enabled&&t.freeMode&&t.animating&&!n.cssMode&&t.freeMode.onTouchStart(),t.emit("touchStart",i);}function onTouchMove(e){const t=getDocument(),s=this,i=s.touchEventsData,{params:r,touches:n,rtlTranslate:a,enabled:l}=s;if(!l)return;if(!r.simulateTouch&&"mouse"===e.pointerType)return;let o,d=e;if(d.originalEvent&&(d=d.originalEvent),"pointermove"===d.type){if(null!==i.touchId)return;if(d.pointerId!==i.pointerId)return}if("touchmove"===d.type){if(o=[...d.changedTouches].filter((e=>e.identifier===i.touchId))[0],!o||o.identifier!==i.touchId)return}else o=d;if(!i.isTouched)return void(i.startMoving&&i.isScrolling&&s.emit("touchMoveOpposite",d));const c=o.pageX,p=o.pageY;if(d.preventedByNestedSwiper)return n.startX=c,void(n.startY=p);if(!s.allowTouchMove)return d.target.matches(i.focusableElements)||(s.allowClick=!1),void(i.isTouched&&(Object.assign(n,{startX:c,startY:p,currentX:c,currentY:p}),i.touchStartTime=now()));if(r.touchReleaseOnEdges&&!r.loop)if(s.isVertical()){if(p<n.startY&&s.translate<=s.maxTranslate()||p>n.startY&&s.translate>=s.minTranslate())return i.isTouched=!1,void(i.isMoved=!1)}else if(c<n.startX&&s.translate<=s.maxTranslate()||c>n.startX&&s.translate>=s.minTranslate())return;if(t.activeElement&&t.activeElement.matches(i.focusableElements)&&t.activeElement!==d.target&&"mouse"!==d.pointerType&&t.activeElement.blur(),t.activeElement&&d.target===t.activeElement&&d.target.matches(i.focusableElements))return i.isMoved=!0,void(s.allowClick=!1);i.allowTouchCallbacks&&s.emit("touchMove",d),n.previousX=n.currentX,n.previousY=n.currentY,n.currentX=c,n.currentY=p;const u=n.currentX-n.startX,h=n.currentY-n.startY;if(s.params.threshold&&Math.sqrt(u**2+h**2)<s.params.threshold)return;if(void 0===i.isScrolling){let e;s.isHorizontal()&&n.currentY===n.startY||s.isVertical()&&n.currentX===n.startX?i.isScrolling=!1:u*u+h*h>=25&&(e=180*Math.atan2(Math.abs(h),Math.abs(u))/Math.PI,i.isScrolling=s.isHorizontal()?e>r.touchAngle:90-e>r.touchAngle);}if(i.isScrolling&&s.emit("touchMoveOpposite",d),void 0===i.startMoving&&(n.currentX===n.startX&&n.currentY===n.startY||(i.startMoving=!0)),i.isScrolling||"touchmove"===d.type&&i.preventTouchMoveFromPointerMove)return void(i.isTouched=!1);if(!i.startMoving)return;s.allowClick=!1,!r.cssMode&&d.cancelable&&d.preventDefault(),r.touchMoveStopPropagation&&!r.nested&&d.stopPropagation();let m=s.isHorizontal()?u:h,f=s.isHorizontal()?n.currentX-n.previousX:n.currentY-n.previousY;r.oneWayMovement&&(m=Math.abs(m)*(a?1:-1),f=Math.abs(f)*(a?1:-1)),n.diff=m,m*=r.touchRatio,a&&(m=-m,f=-f);const v=s.touchesDirection;s.swipeDirection=m>0?"prev":"next",s.touchesDirection=f>0?"prev":"next";const g=s.params.loop&&!r.cssMode,w="next"===s.touchesDirection&&s.allowSlideNext||"prev"===s.touchesDirection&&s.allowSlidePrev;if(!i.isMoved){if(g&&w&&s.loopFix({direction:s.swipeDirection}),i.startTranslate=s.getTranslate(),s.setTransition(0),s.animating){const e=new window.CustomEvent("transitionend",{bubbles:!0,cancelable:!0,detail:{bySwiperTouchMove:!0}});s.wrapperEl.dispatchEvent(e);}i.allowMomentumBounce=!1,!r.grabCursor||!0!==s.allowSlideNext&&!0!==s.allowSlidePrev||s.setGrabCursor(!0),s.emit("sliderFirstMove",d);}if((new Date).getTime(),i.isMoved&&i.allowThresholdMove&&v!==s.touchesDirection&&g&&w&&Math.abs(m)>=1)return Object.assign(n,{startX:c,startY:p,currentX:c,currentY:p,startTranslate:i.currentTranslate}),i.loopSwapReset=!0,void(i.startTranslate=i.currentTranslate);s.emit("sliderMove",d),i.isMoved=!0,i.currentTranslate=m+i.startTranslate;let S=!0,T=r.resistanceRatio;if(r.touchReleaseOnEdges&&(T=0),m>0?(g&&w&&i.allowThresholdMove&&i.currentTranslate>(r.centeredSlides?s.minTranslate()-s.slidesSizesGrid[s.activeIndex+1]-("auto"!==r.slidesPerView&&s.slides.length-r.slidesPerView>=2?s.slidesSizesGrid[s.activeIndex+1]+s.params.spaceBetween:0)-s.params.spaceBetween:s.minTranslate())&&s.loopFix({direction:"prev",setTranslate:!0,activeSlideIndex:0}),i.currentTranslate>s.minTranslate()&&(S=!1,r.resistance&&(i.currentTranslate=s.minTranslate()-1+(-s.minTranslate()+i.startTranslate+m)**T))):m<0&&(g&&w&&i.allowThresholdMove&&i.currentTranslate<(r.centeredSlides?s.maxTranslate()+s.slidesSizesGrid[s.slidesSizesGrid.length-1]+s.params.spaceBetween+("auto"!==r.slidesPerView&&s.slides.length-r.slidesPerView>=2?s.slidesSizesGrid[s.slidesSizesGrid.length-1]+s.params.spaceBetween:0):s.maxTranslate())&&s.loopFix({direction:"next",setTranslate:!0,activeSlideIndex:s.slides.length-("auto"===r.slidesPerView?s.slidesPerViewDynamic():Math.ceil(parseFloat(r.slidesPerView,10)))}),i.currentTranslate<s.maxTranslate()&&(S=!1,r.resistance&&(i.currentTranslate=s.maxTranslate()+1-(s.maxTranslate()-i.startTranslate-m)**T))),S&&(d.preventedByNestedSwiper=!0),!s.allowSlideNext&&"next"===s.swipeDirection&&i.currentTranslate<i.startTranslate&&(i.currentTranslate=i.startTranslate),!s.allowSlidePrev&&"prev"===s.swipeDirection&&i.currentTranslate>i.startTranslate&&(i.currentTranslate=i.startTranslate),s.allowSlidePrev||s.allowSlideNext||(i.currentTranslate=i.startTranslate),r.threshold>0){if(!(Math.abs(m)>r.threshold||i.allowThresholdMove))return void(i.currentTranslate=i.startTranslate);if(!i.allowThresholdMove)return i.allowThresholdMove=!0,n.startX=n.currentX,n.startY=n.currentY,i.currentTranslate=i.startTranslate,void(n.diff=s.isHorizontal()?n.currentX-n.startX:n.currentY-n.startY)}r.followFinger&&!r.cssMode&&((r.freeMode&&r.freeMode.enabled&&s.freeMode||r.watchSlidesProgress)&&(s.updateActiveIndex(),s.updateSlidesClasses()),r.freeMode&&r.freeMode.enabled&&s.freeMode&&s.freeMode.onTouchMove(),s.updateProgress(i.currentTranslate),s.setTranslate(i.currentTranslate));}function onTouchEnd(e){const t=this,s=t.touchEventsData;let i,r=e;r.originalEvent&&(r=r.originalEvent);if("touchend"===r.type||"touchcancel"===r.type){if(i=[...r.changedTouches].filter((e=>e.identifier===s.touchId))[0],!i||i.identifier!==s.touchId)return}else {if(null!==s.touchId)return;if(r.pointerId!==s.pointerId)return;i=r;}if(["pointercancel","pointerout","pointerleave","contextmenu"].includes(r.type)){if(!(["pointercancel","contextmenu"].includes(r.type)&&(t.browser.isSafari||t.browser.isWebView)))return}s.pointerId=null,s.touchId=null;const{params:n,touches:a,rtlTranslate:l,slidesGrid:o,enabled:d}=t;if(!d)return;if(!n.simulateTouch&&"mouse"===r.pointerType)return;if(s.allowTouchCallbacks&&t.emit("touchEnd",r),s.allowTouchCallbacks=!1,!s.isTouched)return s.isMoved&&n.grabCursor&&t.setGrabCursor(!1),s.isMoved=!1,void(s.startMoving=!1);n.grabCursor&&s.isMoved&&s.isTouched&&(!0===t.allowSlideNext||!0===t.allowSlidePrev)&&t.setGrabCursor(!1);const c=now(),p=c-s.touchStartTime;if(t.allowClick){const e=r.path||r.composedPath&&r.composedPath();t.updateClickedSlide(e&&e[0]||r.target,e),t.emit("tap click",r),p<300&&c-s.lastClickTime<300&&t.emit("doubleTap doubleClick",r);}if(s.lastClickTime=now(),nextTick((()=>{t.destroyed||(t.allowClick=!0);})),!s.isTouched||!s.isMoved||!t.swipeDirection||0===a.diff&&!s.loopSwapReset||s.currentTranslate===s.startTranslate&&!s.loopSwapReset)return s.isTouched=!1,s.isMoved=!1,void(s.startMoving=!1);let u;if(s.isTouched=!1,s.isMoved=!1,s.startMoving=!1,u=n.followFinger?l?t.translate:-t.translate:-s.currentTranslate,n.cssMode)return;if(n.freeMode&&n.freeMode.enabled)return void t.freeMode.onTouchEnd({currentPos:u});const h=u>=-t.maxTranslate()&&!t.params.loop;let m=0,f=t.slidesSizesGrid[0];for(let e=0;e<o.length;e+=e<n.slidesPerGroupSkip?1:n.slidesPerGroup){const t=e<n.slidesPerGroupSkip-1?1:n.slidesPerGroup;void 0!==o[e+t]?(h||u>=o[e]&&u<o[e+t])&&(m=e,f=o[e+t]-o[e]):(h||u>=o[e])&&(m=e,f=o[o.length-1]-o[o.length-2]);}let v=null,g=null;n.rewind&&(t.isBeginning?g=n.virtual&&n.virtual.enabled&&t.virtual?t.virtual.slides.length-1:t.slides.length-1:t.isEnd&&(v=0));const w=(u-o[m])/f,S=m<n.slidesPerGroupSkip-1?1:n.slidesPerGroup;if(p>n.longSwipesMs){if(!n.longSwipes)return void t.slideTo(t.activeIndex);"next"===t.swipeDirection&&(w>=n.longSwipesRatio?t.slideTo(n.rewind&&t.isEnd?v:m+S):t.slideTo(m)),"prev"===t.swipeDirection&&(w>1-n.longSwipesRatio?t.slideTo(m+S):null!==g&&w<0&&Math.abs(w)>n.longSwipesRatio?t.slideTo(g):t.slideTo(m));}else {if(!n.shortSwipes)return void t.slideTo(t.activeIndex);t.navigation&&(r.target===t.navigation.nextEl||r.target===t.navigation.prevEl)?r.target===t.navigation.nextEl?t.slideTo(m+S):t.slideTo(m):("next"===t.swipeDirection&&t.slideTo(null!==v?v:m+S),"prev"===t.swipeDirection&&t.slideTo(null!==g?g:m));}}function onResize(){const e=this,{params:t,el:s}=e;if(s&&0===s.offsetWidth)return;t.breakpoints&&e.setBreakpoint();const{allowSlideNext:i,allowSlidePrev:r,snapGrid:n}=e,a=e.virtual&&e.params.virtual.enabled;e.allowSlideNext=!0,e.allowSlidePrev=!0,e.updateSize(),e.updateSlides(),e.updateSlidesClasses();const l=a&&t.loop;!("auto"===t.slidesPerView||t.slidesPerView>1)||!e.isEnd||e.isBeginning||e.params.centeredSlides||l?e.params.loop&&!a?e.slideToLoop(e.realIndex,0,!1,!0):e.slideTo(e.activeIndex,0,!1,!0):e.slideTo(e.slides.length-1,0,!1,!0),e.autoplay&&e.autoplay.running&&e.autoplay.paused&&(clearTimeout(e.autoplay.resizeTimeout),e.autoplay.resizeTimeout=setTimeout((()=>{e.autoplay&&e.autoplay.running&&e.autoplay.paused&&e.autoplay.resume();}),500)),e.allowSlidePrev=r,e.allowSlideNext=i,e.params.watchOverflow&&n!==e.snapGrid&&e.checkOverflow();}function onClick(e){const t=this;t.enabled&&(t.allowClick||(t.params.preventClicks&&e.preventDefault(),t.params.preventClicksPropagation&&t.animating&&(e.stopPropagation(),e.stopImmediatePropagation())));}function onScroll(){const e=this,{wrapperEl:t,rtlTranslate:s,enabled:i}=e;if(!i)return;let r;e.previousTranslate=e.translate,e.isHorizontal()?e.translate=-t.scrollLeft:e.translate=-t.scrollTop,0===e.translate&&(e.translate=0),e.updateActiveIndex(),e.updateSlidesClasses();const n=e.maxTranslate()-e.minTranslate();r=0===n?0:(e.translate-e.minTranslate())/n,r!==e.progress&&e.updateProgress(s?-e.translate:e.translate),e.emit("setTranslate",e.translate,!1);}function onLoad(e){const t=this;processLazyPreloader(t,e.target),t.params.cssMode||"auto"!==t.params.slidesPerView&&!t.params.autoHeight||t.update();}function onDocumentTouchStart(){const e=this;e.documentTouchHandlerProceeded||(e.documentTouchHandlerProceeded=!0,e.params.touchReleaseOnEdges&&(e.el.style.touchAction="auto"));}const events=(e,t)=>{const s=getDocument(),{params:i,el:r,wrapperEl:n,device:a}=e,l=!!i.nested,o="on"===t?"addEventListener":"removeEventListener",d=t;r&&"string"!=typeof r&&(s[o]("touchstart",e.onDocumentTouchStart,{passive:!1,capture:l}),r[o]("touchstart",e.onTouchStart,{passive:!1}),r[o]("pointerdown",e.onTouchStart,{passive:!1}),s[o]("touchmove",e.onTouchMove,{passive:!1,capture:l}),s[o]("pointermove",e.onTouchMove,{passive:!1,capture:l}),s[o]("touchend",e.onTouchEnd,{passive:!0}),s[o]("pointerup",e.onTouchEnd,{passive:!0}),s[o]("pointercancel",e.onTouchEnd,{passive:!0}),s[o]("touchcancel",e.onTouchEnd,{passive:!0}),s[o]("pointerout",e.onTouchEnd,{passive:!0}),s[o]("pointerleave",e.onTouchEnd,{passive:!0}),s[o]("contextmenu",e.onTouchEnd,{passive:!0}),(i.preventClicks||i.preventClicksPropagation)&&r[o]("click",e.onClick,!0),i.cssMode&&n[o]("scroll",e.onScroll),i.updateOnWindowResize?e[d](a.ios||a.android?"resize orientationchange observerUpdate":"resize observerUpdate",onResize,!0):e[d]("observerUpdate",onResize,!0),r[o]("load",e.onLoad,{capture:!0}));};function attachEvents(){const e=this,{params:t}=e;e.onTouchStart=onTouchStart.bind(e),e.onTouchMove=onTouchMove.bind(e),e.onTouchEnd=onTouchEnd.bind(e),e.onDocumentTouchStart=onDocumentTouchStart.bind(e),t.cssMode&&(e.onScroll=onScroll.bind(e)),e.onClick=onClick.bind(e),e.onLoad=onLoad.bind(e),events(e,"on");}function detachEvents(){events(this,"off");}var events$1={attachEvents:attachEvents,detachEvents:detachEvents};const isGridEnabled=(e,t)=>e.grid&&t.grid&&t.grid.rows>1;function setBreakpoint(){const e=this,{realIndex:t,initialized:s,params:i,el:r}=e,n=i.breakpoints;if(!n||n&&0===Object.keys(n).length)return;const a=e.getBreakpoint(n,e.params.breakpointsBase,e.el);if(!a||e.currentBreakpoint===a)return;const l=(a in n?n[a]:void 0)||e.originalParams,o=isGridEnabled(e,i),d=isGridEnabled(e,l),c=e.params.grabCursor,p=l.grabCursor,u=i.enabled;o&&!d?(r.classList.remove(`${i.containerModifierClass}grid`,`${i.containerModifierClass}grid-column`),e.emitContainerClasses()):!o&&d&&(r.classList.add(`${i.containerModifierClass}grid`),(l.grid.fill&&"column"===l.grid.fill||!l.grid.fill&&"column"===i.grid.fill)&&r.classList.add(`${i.containerModifierClass}grid-column`),e.emitContainerClasses()),c&&!p?e.unsetGrabCursor():!c&&p&&e.setGrabCursor(),["navigation","pagination","scrollbar"].forEach((t=>{if(void 0===l[t])return;const s=i[t]&&i[t].enabled,r=l[t]&&l[t].enabled;s&&!r&&e[t].disable(),!s&&r&&e[t].enable();}));const h=l.direction&&l.direction!==i.direction,m=i.loop&&(l.slidesPerView!==i.slidesPerView||h),f=i.loop;h&&s&&e.changeDirection(),extend(e.params,l);const v=e.params.enabled,g=e.params.loop;Object.assign(e,{allowTouchMove:e.params.allowTouchMove,allowSlideNext:e.params.allowSlideNext,allowSlidePrev:e.params.allowSlidePrev}),u&&!v?e.disable():!u&&v&&e.enable(),e.currentBreakpoint=a,e.emit("_beforeBreakpoint",l),s&&(m?(e.loopDestroy(),e.loopCreate(t),e.updateSlides()):!f&&g?(e.loopCreate(t),e.updateSlides()):f&&!g&&e.loopDestroy()),e.emit("breakpoint",l);}function getBreakpoint(e,t,s){if(void 0===t&&(t="window"),!e||"container"===t&&!s)return;let i=!1;const r=getWindow(),n="window"===t?r.innerHeight:s.clientHeight,a=Object.keys(e).map((e=>{if("string"==typeof e&&0===e.indexOf("@")){const t=parseFloat(e.substr(1));return {value:n*t,point:e}}return {value:e,point:e}}));a.sort(((e,t)=>parseInt(e.value,10)-parseInt(t.value,10)));for(let e=0;e<a.length;e+=1){const{point:n,value:l}=a[e];"window"===t?r.matchMedia(`(min-width: ${l}px)`).matches&&(i=n):l<=s.clientWidth&&(i=n);}return i||"max"}var breakpoints={setBreakpoint:setBreakpoint,getBreakpoint:getBreakpoint};function prepareClasses(e,t){const s=[];return e.forEach((e=>{"object"==typeof e?Object.keys(e).forEach((i=>{e[i]&&s.push(t+i);})):"string"==typeof e&&s.push(t+e);})),s}function addClasses(){const e=this,{classNames:t,params:s,rtl:i,el:r,device:n}=e,a=prepareClasses(["initialized",s.direction,{"free-mode":e.params.freeMode&&s.freeMode.enabled},{autoheight:s.autoHeight},{rtl:i},{grid:s.grid&&s.grid.rows>1},{"grid-column":s.grid&&s.grid.rows>1&&"column"===s.grid.fill},{android:n.android},{ios:n.ios},{"css-mode":s.cssMode},{centered:s.cssMode&&s.centeredSlides},{"watch-progress":s.watchSlidesProgress}],s.containerModifierClass);t.push(...a),r.classList.add(...t),e.emitContainerClasses();}function removeClasses(){const{el:e,classNames:t}=this;e&&"string"!=typeof e&&(e.classList.remove(...t),this.emitContainerClasses());}var classes={addClasses:addClasses,removeClasses:removeClasses};function checkOverflow(){const e=this,{isLocked:t,params:s}=e,{slidesOffsetBefore:i}=s;if(i){const t=e.slides.length-1,s=e.slidesGrid[t]+e.slidesSizesGrid[t]+2*i;e.isLocked=e.size>s;}else e.isLocked=1===e.snapGrid.length;!0===s.allowSlideNext&&(e.allowSlideNext=!e.isLocked),!0===s.allowSlidePrev&&(e.allowSlidePrev=!e.isLocked),t&&t!==e.isLocked&&(e.isEnd=!1),t!==e.isLocked&&e.emit(e.isLocked?"lock":"unlock");}var checkOverflow$1={checkOverflow:checkOverflow},defaults={init:!0,direction:"horizontal",oneWayMovement:!1,swiperElementNodeName:"SWIPER-CONTAINER",touchEventsTarget:"wrapper",initialSlide:0,speed:300,cssMode:!1,updateOnWindowResize:!0,resizeObserver:!0,nested:!1,createElements:!1,eventsPrefix:"swiper",enabled:!0,focusableElements:"input, select, option, textarea, button, video, label",width:null,height:null,preventInteractionOnTransition:!1,userAgent:null,url:null,edgeSwipeDetection:!1,edgeSwipeThreshold:20,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",breakpoints:void 0,breakpointsBase:"window",spaceBetween:0,slidesPerView:1,slidesPerGroup:1,slidesPerGroupSkip:0,slidesPerGroupAuto:!1,centeredSlides:!1,centeredSlidesBounds:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,normalizeSlideIndex:!0,centerInsufficientSlides:!1,watchOverflow:!0,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,allowTouchMove:!0,threshold:5,touchMoveStopPropagation:!1,touchStartPreventDefault:!0,touchStartForcePreventDefault:!1,touchReleaseOnEdges:!1,uniqueNavElements:!0,resistance:!0,resistanceRatio:.85,watchSlidesProgress:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,loop:!1,loopAddBlankSlides:!0,loopAdditionalSlides:0,loopPreventsSliding:!0,rewind:!1,allowSlidePrev:!0,allowSlideNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",noSwipingSelector:null,passiveListeners:!0,maxBackfaceHiddenSlides:10,containerModifierClass:"swiper-",slideClass:"swiper-slide",slideBlankClass:"swiper-slide-blank",slideActiveClass:"swiper-slide-active",slideVisibleClass:"swiper-slide-visible",slideFullyVisibleClass:"swiper-slide-fully-visible",slideNextClass:"swiper-slide-next",slidePrevClass:"swiper-slide-prev",wrapperClass:"swiper-wrapper",lazyPreloaderClass:"swiper-lazy-preloader",lazyPreloadPrevNext:0,runCallbacksOnInit:!0,_emitClasses:!1};function moduleExtendParams(e,t){return function(s){void 0===s&&(s={});const i=Object.keys(s)[0],r=s[i];"object"==typeof r&&null!==r?(!0===e[i]&&(e[i]={enabled:!0}),"navigation"===i&&e[i]&&e[i].enabled&&!e[i].prevEl&&!e[i].nextEl&&(e[i].auto=!0),["pagination","scrollbar"].indexOf(i)>=0&&e[i]&&e[i].enabled&&!e[i].el&&(e[i].auto=!0),i in e&&"enabled"in r?("object"!=typeof e[i]||"enabled"in e[i]||(e[i].enabled=!0),e[i]||(e[i]={enabled:!1}),extend(t,s)):extend(t,s)):extend(t,s);}}const prototypes={eventsEmitter:eventsEmitter,update:update,translate:translate,transition:transition,slide:slide,loop:loop,grabCursor:grabCursor,events:events$1,breakpoints:breakpoints,checkOverflow:checkOverflow$1,classes:classes},extendedDefaults={};class Swiper{constructor(){let e,t;for(var s=arguments.length,i=new Array(s),r=0;r<s;r++)i[r]=arguments[r];1===i.length&&i[0].constructor&&"Object"===Object.prototype.toString.call(i[0]).slice(8,-1)?t=i[0]:[e,t]=i,t||(t={}),t=extend({},t),e&&!t.el&&(t.el=e);const n=getDocument();if(t.el&&"string"==typeof t.el&&n.querySelectorAll(t.el).length>1){const e=[];return n.querySelectorAll(t.el).forEach((s=>{const i=extend({},t,{el:s});e.push(new Swiper(i));})),e}const a=this;a.__swiper__=!0,a.support=getSupport(),a.device=getDevice({userAgent:t.userAgent}),a.browser=getBrowser(),a.eventsListeners={},a.eventsAnyListeners=[],a.modules=[...a.__modules__],t.modules&&Array.isArray(t.modules)&&a.modules.push(...t.modules);const l={};a.modules.forEach((e=>{e({params:t,swiper:a,extendParams:moduleExtendParams(t,l),on:a.on.bind(a),once:a.once.bind(a),off:a.off.bind(a),emit:a.emit.bind(a)});}));const o=extend({},defaults,l);return a.params=extend({},o,extendedDefaults,t),a.originalParams=extend({},a.params),a.passedParams=extend({},t),a.params&&a.params.on&&Object.keys(a.params.on).forEach((e=>{a.on(e,a.params.on[e]);})),a.params&&a.params.onAny&&a.onAny(a.params.onAny),Object.assign(a,{enabled:a.params.enabled,el:e,classNames:[],slides:[],slidesGrid:[],snapGrid:[],slidesSizesGrid:[],isHorizontal:()=>"horizontal"===a.params.direction,isVertical:()=>"vertical"===a.params.direction,activeIndex:0,realIndex:0,isBeginning:!0,isEnd:!1,translate:0,previousTranslate:0,progress:0,velocity:0,animating:!1,cssOverflowAdjustment(){return Math.trunc(this.translate/2**23)*2**23},allowSlideNext:a.params.allowSlideNext,allowSlidePrev:a.params.allowSlidePrev,touchEventsData:{isTouched:void 0,isMoved:void 0,allowTouchCallbacks:void 0,touchStartTime:void 0,isScrolling:void 0,currentTranslate:void 0,startTranslate:void 0,allowThresholdMove:void 0,focusableElements:a.params.focusableElements,lastClickTime:0,clickTimeout:void 0,velocities:[],allowMomentumBounce:void 0,startMoving:void 0,pointerId:null,touchId:null},allowClick:!0,allowTouchMove:a.params.allowTouchMove,touches:{startX:0,startY:0,currentX:0,currentY:0,diff:0},imagesToLoad:[],imagesLoaded:0}),a.emit("_swiper"),a.params.init&&a.init(),a}getDirectionLabel(e){return this.isHorizontal()?e:{width:"height","margin-top":"margin-left","margin-bottom ":"margin-right","margin-left":"margin-top","margin-right":"margin-bottom","padding-left":"padding-top","padding-right":"padding-bottom",marginRight:"marginBottom"}[e]}getSlideIndex(e){const{slidesEl:t,params:s}=this,i=elementChildren(t,`.${s.slideClass}, swiper-slide`),r=elementIndex(i[0]);return elementIndex(e)-r}getSlideIndexByData(e){return this.getSlideIndex(this.slides.filter((t=>1*t.getAttribute("data-swiper-slide-index")===e))[0])}recalcSlides(){const{slidesEl:e,params:t}=this;this.slides=elementChildren(e,`.${t.slideClass}, swiper-slide`);}enable(){const e=this;e.enabled||(e.enabled=!0,e.params.grabCursor&&e.setGrabCursor(),e.emit("enable"));}disable(){const e=this;e.enabled&&(e.enabled=!1,e.params.grabCursor&&e.unsetGrabCursor(),e.emit("disable"));}setProgress(e,t){const s=this;e=Math.min(Math.max(e,0),1);const i=s.minTranslate(),r=(s.maxTranslate()-i)*e+i;s.translateTo(r,void 0===t?0:t),s.updateActiveIndex(),s.updateSlidesClasses();}emitContainerClasses(){const e=this;if(!e.params._emitClasses||!e.el)return;const t=e.el.className.split(" ").filter((t=>0===t.indexOf("swiper")||0===t.indexOf(e.params.containerModifierClass)));e.emit("_containerClasses",t.join(" "));}getSlideClasses(e){const t=this;return t.destroyed?"":e.className.split(" ").filter((e=>0===e.indexOf("swiper-slide")||0===e.indexOf(t.params.slideClass))).join(" ")}emitSlidesClasses(){const e=this;if(!e.params._emitClasses||!e.el)return;const t=[];e.slides.forEach((s=>{const i=e.getSlideClasses(s);t.push({slideEl:s,classNames:i}),e.emit("_slideClass",s,i);})),e.emit("_slideClasses",t);}slidesPerViewDynamic(e,t){void 0===e&&(e="current"),void 0===t&&(t=!1);const{params:s,slides:i,slidesGrid:r,slidesSizesGrid:n,size:a,activeIndex:l}=this;let o=1;if("number"==typeof s.slidesPerView)return s.slidesPerView;if(s.centeredSlides){let e,t=i[l]?Math.ceil(i[l].swiperSlideSize):0;for(let s=l+1;s<i.length;s+=1)i[s]&&!e&&(t+=Math.ceil(i[s].swiperSlideSize),o+=1,t>a&&(e=!0));for(let s=l-1;s>=0;s-=1)i[s]&&!e&&(t+=i[s].swiperSlideSize,o+=1,t>a&&(e=!0));}else if("current"===e)for(let e=l+1;e<i.length;e+=1){(t?r[e]+n[e]-r[l]<a:r[e]-r[l]<a)&&(o+=1);}else for(let e=l-1;e>=0;e-=1){r[l]-r[e]<a&&(o+=1);}return o}update(){const e=this;if(!e||e.destroyed)return;const{snapGrid:t,params:s}=e;function i(){const t=e.rtlTranslate?-1*e.translate:e.translate,s=Math.min(Math.max(t,e.maxTranslate()),e.minTranslate());e.setTranslate(s),e.updateActiveIndex(),e.updateSlidesClasses();}let r;if(s.breakpoints&&e.setBreakpoint(),[...e.el.querySelectorAll('[loading="lazy"]')].forEach((t=>{t.complete&&processLazyPreloader(e,t);})),e.updateSize(),e.updateSlides(),e.updateProgress(),e.updateSlidesClasses(),s.freeMode&&s.freeMode.enabled&&!s.cssMode)i(),s.autoHeight&&e.updateAutoHeight();else {if(("auto"===s.slidesPerView||s.slidesPerView>1)&&e.isEnd&&!s.centeredSlides){const t=e.virtual&&s.virtual.enabled?e.virtual.slides:e.slides;r=e.slideTo(t.length-1,0,!1,!0);}else r=e.slideTo(e.activeIndex,0,!1,!0);r||i();}s.watchOverflow&&t!==e.snapGrid&&e.checkOverflow(),e.emit("update");}changeDirection(e,t){void 0===t&&(t=!0);const s=this,i=s.params.direction;return e||(e="horizontal"===i?"vertical":"horizontal"),e===i||"horizontal"!==e&&"vertical"!==e||(s.el.classList.remove(`${s.params.containerModifierClass}${i}`),s.el.classList.add(`${s.params.containerModifierClass}${e}`),s.emitContainerClasses(),s.params.direction=e,s.slides.forEach((t=>{"vertical"===e?t.style.width="":t.style.height="";})),s.emit("changeDirection"),t&&s.update()),s}changeLanguageDirection(e){const t=this;t.rtl&&"rtl"===e||!t.rtl&&"ltr"===e||(t.rtl="rtl"===e,t.rtlTranslate="horizontal"===t.params.direction&&t.rtl,t.rtl?(t.el.classList.add(`${t.params.containerModifierClass}rtl`),t.el.dir="rtl"):(t.el.classList.remove(`${t.params.containerModifierClass}rtl`),t.el.dir="ltr"),t.update());}mount(e){const t=this;if(t.mounted)return !0;let s=e||t.params.el;if("string"==typeof s&&(s=document.querySelector(s)),!s)return !1;s.swiper=t,s.parentNode&&s.parentNode.host&&s.parentNode.host.nodeName===t.params.swiperElementNodeName.toUpperCase()&&(t.isElement=!0);const i=()=>`.${(t.params.wrapperClass||"").trim().split(" ").join(".")}`;let r=(()=>{if(s&&s.shadowRoot&&s.shadowRoot.querySelector){return s.shadowRoot.querySelector(i())}return elementChildren(s,i())[0]})();return !r&&t.params.createElements&&(r=createElement("div",t.params.wrapperClass),s.append(r),elementChildren(s,`.${t.params.slideClass}`).forEach((e=>{r.append(e);}))),Object.assign(t,{el:s,wrapperEl:r,slidesEl:t.isElement&&!s.parentNode.host.slideSlots?s.parentNode.host:r,hostEl:t.isElement?s.parentNode.host:s,mounted:!0,rtl:"rtl"===s.dir.toLowerCase()||"rtl"===elementStyle(s,"direction"),rtlTranslate:"horizontal"===t.params.direction&&("rtl"===s.dir.toLowerCase()||"rtl"===elementStyle(s,"direction")),wrongRTL:"-webkit-box"===elementStyle(r,"display")}),!0}init(e){const t=this;if(t.initialized)return t;if(!1===t.mount(e))return t;t.emit("beforeInit"),t.params.breakpoints&&t.setBreakpoint(),t.addClasses(),t.updateSize(),t.updateSlides(),t.params.watchOverflow&&t.checkOverflow(),t.params.grabCursor&&t.enabled&&t.setGrabCursor(),t.params.loop&&t.virtual&&t.params.virtual.enabled?t.slideTo(t.params.initialSlide+t.virtual.slidesBefore,0,t.params.runCallbacksOnInit,!1,!0):t.slideTo(t.params.initialSlide,0,t.params.runCallbacksOnInit,!1,!0),t.params.loop&&t.loopCreate(),t.attachEvents();const s=[...t.el.querySelectorAll('[loading="lazy"]')];return t.isElement&&s.push(...t.hostEl.querySelectorAll('[loading="lazy"]')),s.forEach((e=>{e.complete?processLazyPreloader(t,e):e.addEventListener("load",(e=>{processLazyPreloader(t,e.target);}));})),preload(t),t.initialized=!0,preload(t),t.emit("init"),t.emit("afterInit"),t}destroy(e,t){void 0===e&&(e=!0),void 0===t&&(t=!0);const s=this,{params:i,el:r,wrapperEl:n,slides:a}=s;return void 0===s.params||s.destroyed||(s.emit("beforeDestroy"),s.initialized=!1,s.detachEvents(),i.loop&&s.loopDestroy(),t&&(s.removeClasses(),r&&"string"!=typeof r&&r.removeAttribute("style"),n&&n.removeAttribute("style"),a&&a.length&&a.forEach((e=>{e.classList.remove(i.slideVisibleClass,i.slideFullyVisibleClass,i.slideActiveClass,i.slideNextClass,i.slidePrevClass),e.removeAttribute("style"),e.removeAttribute("data-swiper-slide-index");}))),s.emit("destroy"),Object.keys(s.eventsListeners).forEach((e=>{s.off(e);})),!1!==e&&(s.el&&"string"!=typeof s.el&&(s.el.swiper=null),deleteProps(s)),s.destroyed=!0),null}static extendDefaults(e){extend(extendedDefaults,e);}static get extendedDefaults(){return extendedDefaults}static get defaults(){return defaults}static installModule(e){Swiper.prototype.__modules__||(Swiper.prototype.__modules__=[]);const t=Swiper.prototype.__modules__;"function"==typeof e&&t.indexOf(e)<0&&t.push(e);}static use(e){return Array.isArray(e)?(e.forEach((e=>Swiper.installModule(e))),Swiper):(Swiper.installModule(e),Swiper)}}Object.keys(prototypes).forEach((e=>{Object.keys(prototypes[e]).forEach((t=>{Swiper.prototype[t]=prototypes[e][t];}));})),Swiper.use([Resize,Observer]);

  function Virtual(e){let s,{swiper:t,extendParams:i,on:r,emit:a}=e;i({virtual:{enabled:!1,slides:[],cache:!0,renderSlide:null,renderExternal:null,renderExternalUpdate:!0,addSlidesBefore:0,addSlidesAfter:0}});const l=getDocument();t.virtual={cache:{},from:void 0,to:void 0,slides:[],offset:0,slidesGrid:[]};const d=l.createElement("div");function n(e,s){const i=t.params.virtual;if(i.cache&&t.virtual.cache[s])return t.virtual.cache[s];let r;return i.renderSlide?(r=i.renderSlide.call(t,e,s),"string"==typeof r&&(d.innerHTML=r,r=d.children[0])):r=t.isElement?createElement("swiper-slide"):createElement("div",t.params.slideClass),r.setAttribute("data-swiper-slide-index",s),i.renderSlide||(r.innerHTML=e),i.cache&&(t.virtual.cache[s]=r),r}function c(e,s){const{slidesPerView:i,slidesPerGroup:r,centeredSlides:l,loop:d,initialSlide:c}=t.params;if(s&&!d&&c>0)return;const{addSlidesBefore:o,addSlidesAfter:u}=t.params.virtual,{from:p,to:h,slides:f,slidesGrid:v,offset:m}=t.virtual;t.params.cssMode||t.updateActiveIndex();const g=t.activeIndex||0;let E,x,w;E=t.rtlTranslate?"right":t.isHorizontal()?"left":"top",l?(x=Math.floor(i/2)+r+u,w=Math.floor(i/2)+r+o):(x=i+(r-1)+u,w=(d?i:r)+o);let S=g-w,b=g+x;d||(S=Math.max(S,0),b=Math.min(b,f.length-1));let A=(t.slidesGrid[S]||0)-(t.slidesGrid[0]||0);function M(){t.updateSlides(),t.updateProgress(),t.updateSlidesClasses(),a("virtualUpdate");}if(d&&g>=w?(S-=w,l||(A+=t.slidesGrid[0])):d&&g<w&&(S=-w,l&&(A+=t.slidesGrid[0])),Object.assign(t.virtual,{from:S,to:b,offset:A,slidesGrid:t.slidesGrid,slidesBefore:w,slidesAfter:x}),p===S&&h===b&&!e)return t.slidesGrid!==v&&A!==m&&t.slides.forEach((e=>{e.style[E]=A-Math.abs(t.cssOverflowAdjustment())+"px";})),t.updateProgress(),void a("virtualUpdate");if(t.params.virtual.renderExternal)return t.params.virtual.renderExternal.call(t,{offset:A,from:S,to:b,slides:function(){const e=[];for(let s=S;s<=b;s+=1)e.push(f[s]);return e}()}),void(t.params.virtual.renderExternalUpdate?M():a("virtualUpdate"));const y=[],P=[],j=e=>{let s=e;return e<0?s=f.length+e:s>=f.length&&(s-=f.length),s};if(e)t.slides.filter((e=>e.matches(`.${t.params.slideClass}, swiper-slide`))).forEach((e=>{e.remove();}));else for(let e=p;e<=h;e+=1)if(e<S||e>b){const s=j(e);t.slides.filter((e=>e.matches(`.${t.params.slideClass}[data-swiper-slide-index="${s}"], swiper-slide[data-swiper-slide-index="${s}"]`))).forEach((e=>{e.remove();}));}const C=d?-f.length:0,G=d?2*f.length:f.length;for(let s=C;s<G;s+=1)if(s>=S&&s<=b){const t=j(s);void 0===h||e?P.push(t):(s>h&&P.push(t),s<p&&y.push(t));}if(P.forEach((e=>{t.slidesEl.append(n(f[e],e));})),d)for(let e=y.length-1;e>=0;e-=1){const s=y[e];t.slidesEl.prepend(n(f[s],s));}else y.sort(((e,s)=>s-e)),y.forEach((e=>{t.slidesEl.prepend(n(f[e],e));}));elementChildren(t.slidesEl,".swiper-slide, swiper-slide").forEach((e=>{e.style[E]=A-Math.abs(t.cssOverflowAdjustment())+"px";})),M();}r("beforeInit",(()=>{if(!t.params.virtual.enabled)return;let e;if(void 0===t.passedParams.virtual.slides){const s=[...t.slidesEl.children].filter((e=>e.matches(`.${t.params.slideClass}, swiper-slide`)));s&&s.length&&(t.virtual.slides=[...s],e=!0,s.forEach(((e,s)=>{e.setAttribute("data-swiper-slide-index",s),t.virtual.cache[s]=e,e.remove();})));}e||(t.virtual.slides=t.params.virtual.slides),t.classNames.push(`${t.params.containerModifierClass}virtual`),t.params.watchSlidesProgress=!0,t.originalParams.watchSlidesProgress=!0,c(!1,!0);})),r("setTranslate",(()=>{t.params.virtual.enabled&&(t.params.cssMode&&!t._immediateVirtual?(clearTimeout(s),s=setTimeout((()=>{c();}),100)):c());})),r("init update resize",(()=>{t.params.virtual.enabled&&t.params.cssMode&&setCSSProperty(t.wrapperEl,"--swiper-virtual-size",`${t.virtualSize}px`);})),Object.assign(t.virtual,{appendSlide:function(e){if("object"==typeof e&&"length"in e)for(let s=0;s<e.length;s+=1)e[s]&&t.virtual.slides.push(e[s]);else t.virtual.slides.push(e);c(!0);},prependSlide:function(e){const s=t.activeIndex;let i=s+1,r=1;if(Array.isArray(e)){for(let s=0;s<e.length;s+=1)e[s]&&t.virtual.slides.unshift(e[s]);i=s+e.length,r=e.length;}else t.virtual.slides.unshift(e);if(t.params.virtual.cache){const e=t.virtual.cache,s={};Object.keys(e).forEach((t=>{const i=e[t],a=i.getAttribute("data-swiper-slide-index");a&&i.setAttribute("data-swiper-slide-index",parseInt(a,10)+r),s[parseInt(t,10)+r]=i;})),t.virtual.cache=s;}c(!0),t.slideTo(i,0);},removeSlide:function(e){if(null==e)return;let s=t.activeIndex;if(Array.isArray(e))for(let i=e.length-1;i>=0;i-=1)t.params.virtual.cache&&(delete t.virtual.cache[e[i]],Object.keys(t.virtual.cache).forEach((s=>{s>e&&(t.virtual.cache[s-1]=t.virtual.cache[s],t.virtual.cache[s-1].setAttribute("data-swiper-slide-index",s-1),delete t.virtual.cache[s]);}))),t.virtual.slides.splice(e[i],1),e[i]<s&&(s-=1),s=Math.max(s,0);else t.params.virtual.cache&&(delete t.virtual.cache[e],Object.keys(t.virtual.cache).forEach((s=>{s>e&&(t.virtual.cache[s-1]=t.virtual.cache[s],t.virtual.cache[s-1].setAttribute("data-swiper-slide-index",s-1),delete t.virtual.cache[s]);}))),t.virtual.slides.splice(e,1),e<s&&(s-=1),s=Math.max(s,0);c(!0),t.slideTo(s,0);},removeAllSlides:function(){t.virtual.slides=[],t.params.virtual.cache&&(t.virtual.cache={}),c(!0),t.slideTo(0,0);},update:c});}

  function Keyboard(e){let{swiper:t,extendParams:n,on:a,emit:r}=e;const l=getDocument(),i=getWindow();function o(e){if(!t.enabled)return;const{rtlTranslate:n}=t;let a=e;a.originalEvent&&(a=a.originalEvent);const o=a.keyCode||a.charCode,s=t.params.keyboard.pageUpDown,d=s&&33===o,f=s&&34===o,m=37===o,b=39===o,c=38===o,p=40===o;if(!t.allowSlideNext&&(t.isHorizontal()&&b||t.isVertical()&&p||f))return !1;if(!t.allowSlidePrev&&(t.isHorizontal()&&m||t.isVertical()&&c||d))return !1;if(!(a.shiftKey||a.altKey||a.ctrlKey||a.metaKey||l.activeElement&&l.activeElement.nodeName&&("input"===l.activeElement.nodeName.toLowerCase()||"textarea"===l.activeElement.nodeName.toLowerCase()))){if(t.params.keyboard.onlyInViewport&&(d||f||m||b||c||p)){let e=!1;if(elementParents(t.el,`.${t.params.slideClass}, swiper-slide`).length>0&&0===elementParents(t.el,`.${t.params.slideActiveClass}`).length)return;const a=t.el,r=a.clientWidth,l=a.clientHeight,o=i.innerWidth,s=i.innerHeight,d=elementOffset(a);n&&(d.left-=a.scrollLeft);const f=[[d.left,d.top],[d.left+r,d.top],[d.left,d.top+l],[d.left+r,d.top+l]];for(let t=0;t<f.length;t+=1){const n=f[t];if(n[0]>=0&&n[0]<=o&&n[1]>=0&&n[1]<=s){if(0===n[0]&&0===n[1])continue;e=!0;}}if(!e)return}t.isHorizontal()?((d||f||m||b)&&(a.preventDefault?a.preventDefault():a.returnValue=!1),((f||b)&&!n||(d||m)&&n)&&t.slideNext(),((d||m)&&!n||(f||b)&&n)&&t.slidePrev()):((d||f||c||p)&&(a.preventDefault?a.preventDefault():a.returnValue=!1),(f||p)&&t.slideNext(),(d||c)&&t.slidePrev()),r("keyPress",o);}}function s(){t.keyboard.enabled||(l.addEventListener("keydown",o),t.keyboard.enabled=!0);}function d(){t.keyboard.enabled&&(l.removeEventListener("keydown",o),t.keyboard.enabled=!1);}t.keyboard={enabled:!1},n({keyboard:{enabled:!1,onlyInViewport:!0,pageUpDown:!0}}),a("init",(()=>{t.params.keyboard.enabled&&s();})),a("destroy",(()=>{t.keyboard.enabled&&d();})),Object.assign(t.keyboard,{enable:s,disable:d});}

  function Mousewheel(e){let{swiper:t,extendParams:a,on:s,emit:n}=e;const l=getWindow();let i;a({mousewheel:{enabled:!1,releaseOnEdges:!1,invert:!1,forceToAxis:!1,sensitivity:1,eventsTarget:"container",thresholdDelta:null,thresholdTime:null,noMousewheelClass:"swiper-no-mousewheel"}}),t.mousewheel={enabled:!1};let r,o=now();const d=[];function m(){t.enabled&&(t.mouseEntered=!0);}function p(){t.enabled&&(t.mouseEntered=!1);}function u(e){return !(t.params.mousewheel.thresholdDelta&&e.delta<t.params.mousewheel.thresholdDelta)&&(!(t.params.mousewheel.thresholdTime&&now()-o<t.params.mousewheel.thresholdTime)&&(e.delta>=6&&now()-o<60||(e.direction<0?t.isEnd&&!t.params.loop||t.animating||(t.slideNext(),n("scroll",e.raw)):t.isBeginning&&!t.params.loop||t.animating||(t.slidePrev(),n("scroll",e.raw)),o=(new l.Date).getTime(),!1)))}function h(e){let a=e,s=!0;if(!t.enabled)return;if(e.target.closest(`.${t.params.mousewheel.noMousewheelClass}`))return;const l=t.params.mousewheel;t.params.cssMode&&a.preventDefault();let o=t.el;"container"!==t.params.mousewheel.eventsTarget&&(o=document.querySelector(t.params.mousewheel.eventsTarget));const m=o&&o.contains(a.target);if(!t.mouseEntered&&!m&&!l.releaseOnEdges)return !0;a.originalEvent&&(a=a.originalEvent);let p=0;const h=t.rtlTranslate?-1:1,c=function(e){let t=0,a=0,s=0,n=0;return "detail"in e&&(a=e.detail),"wheelDelta"in e&&(a=-e.wheelDelta/120),"wheelDeltaY"in e&&(a=-e.wheelDeltaY/120),"wheelDeltaX"in e&&(t=-e.wheelDeltaX/120),"axis"in e&&e.axis===e.HORIZONTAL_AXIS&&(t=a,a=0),s=10*t,n=10*a,"deltaY"in e&&(n=e.deltaY),"deltaX"in e&&(s=e.deltaX),e.shiftKey&&!s&&(s=n,n=0),(s||n)&&e.deltaMode&&(1===e.deltaMode?(s*=40,n*=40):(s*=800,n*=800)),s&&!t&&(t=s<1?-1:1),n&&!a&&(a=n<1?-1:1),{spinX:t,spinY:a,pixelX:s,pixelY:n}}(a);if(l.forceToAxis)if(t.isHorizontal()){if(!(Math.abs(c.pixelX)>Math.abs(c.pixelY)))return !0;p=-c.pixelX*h;}else {if(!(Math.abs(c.pixelY)>Math.abs(c.pixelX)))return !0;p=-c.pixelY;}else p=Math.abs(c.pixelX)>Math.abs(c.pixelY)?-c.pixelX*h:-c.pixelY;if(0===p)return !0;l.invert&&(p=-p);let w=t.getTranslate()+p*l.sensitivity;if(w>=t.minTranslate()&&(w=t.minTranslate()),w<=t.maxTranslate()&&(w=t.maxTranslate()),s=!!t.params.loop||!(w===t.minTranslate()||w===t.maxTranslate()),s&&t.params.nested&&a.stopPropagation(),t.params.freeMode&&t.params.freeMode.enabled){const e={time:now(),delta:Math.abs(p),direction:Math.sign(p)},s=r&&e.time<r.time+500&&e.delta<=r.delta&&e.direction===r.direction;if(!s){r=void 0;let o=t.getTranslate()+p*l.sensitivity;const m=t.isBeginning,u=t.isEnd;if(o>=t.minTranslate()&&(o=t.minTranslate()),o<=t.maxTranslate()&&(o=t.maxTranslate()),t.setTransition(0),t.setTranslate(o),t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses(),(!m&&t.isBeginning||!u&&t.isEnd)&&t.updateSlidesClasses(),t.params.loop&&t.loopFix({direction:e.direction<0?"next":"prev",byMousewheel:!0}),t.params.freeMode.sticky){clearTimeout(i),i=void 0,d.length>=15&&d.shift();const a=d.length?d[d.length-1]:void 0,s=d[0];if(d.push(e),a&&(e.delta>a.delta||e.direction!==a.direction))d.splice(0);else if(d.length>=15&&e.time-s.time<500&&s.delta-e.delta>=1&&e.delta<=6){const a=p>0?.8:.2;r=e,d.splice(0),i=nextTick((()=>{!t.destroyed&&t.params&&t.slideToClosest(t.params.speed,!0,void 0,a);}),0);}i||(i=nextTick((()=>{if(t.destroyed||!t.params)return;r=e,d.splice(0),t.slideToClosest(t.params.speed,!0,void 0,.5);}),500));}if(s||n("scroll",a),t.params.autoplay&&t.params.autoplayDisableOnInteraction&&t.autoplay.stop(),l.releaseOnEdges&&(o===t.minTranslate()||o===t.maxTranslate()))return !0}}else {const a={time:now(),delta:Math.abs(p),direction:Math.sign(p),raw:e};d.length>=2&&d.shift();const s=d.length?d[d.length-1]:void 0;if(d.push(a),s?(a.direction!==s.direction||a.delta>s.delta||a.time>s.time+150)&&u(a):u(a),function(e){const a=t.params.mousewheel;if(e.direction<0){if(t.isEnd&&!t.params.loop&&a.releaseOnEdges)return !0}else if(t.isBeginning&&!t.params.loop&&a.releaseOnEdges)return !0;return !1}(a))return !0}return a.preventDefault?a.preventDefault():a.returnValue=!1,!1}function c(e){let a=t.el;"container"!==t.params.mousewheel.eventsTarget&&(a=document.querySelector(t.params.mousewheel.eventsTarget)),a[e]("mouseenter",m),a[e]("mouseleave",p),a[e]("wheel",h);}function w(){return t.params.cssMode?(t.wrapperEl.removeEventListener("wheel",h),!0):!t.mousewheel.enabled&&(c("addEventListener"),t.mousewheel.enabled=!0,!0)}function f(){return t.params.cssMode?(t.wrapperEl.addEventListener(event,h),!0):!!t.mousewheel.enabled&&(c("removeEventListener"),t.mousewheel.enabled=!1,!0)}s("init",(()=>{!t.params.mousewheel.enabled&&t.params.cssMode&&f(),t.params.mousewheel.enabled&&w();})),s("destroy",(()=>{t.params.cssMode&&w(),t.mousewheel.enabled&&f();})),Object.assign(t.mousewheel,{enable:w,disable:f});}

  function createElementIfNotDefined(e,t,n,a){return e.params.createElements&&Object.keys(a).forEach((l=>{if(!n[l]&&!0===n.auto){let r=elementChildren(e.el,`.${a[l]}`)[0];r||(r=createElement("div",a[l]),r.className=a[l],e.el.append(r)),n[l]=r,t[l]=r;}})),n}

  function Navigation(a){let{swiper:e,extendParams:n,on:i,emit:t}=a;function s(a){let n;return a&&"string"==typeof a&&e.isElement&&(n=e.el.querySelector(a)||e.hostEl.querySelector(a),n)?n:(a&&("string"==typeof a&&(n=[...document.querySelectorAll(a)]),e.params.uniqueNavElements&&"string"==typeof a&&n&&n.length>1&&1===e.el.querySelectorAll(a).length?n=e.el.querySelector(a):n&&1===n.length&&(n=n[0])),a&&!n?a:n)}function l(a,n){const i=e.params.navigation;(a=makeElementsArray(a)).forEach((a=>{a&&(a.classList[n?"add":"remove"](...i.disabledClass.split(" ")),"BUTTON"===a.tagName&&(a.disabled=n),e.params.watchOverflow&&e.enabled&&a.classList[e.isLocked?"add":"remove"](i.lockClass));}));}function r(){const{nextEl:a,prevEl:n}=e.navigation;if(e.params.loop)return l(n,!1),void l(a,!1);l(n,e.isBeginning&&!e.params.rewind),l(a,e.isEnd&&!e.params.rewind);}function o(a){a.preventDefault(),(!e.isBeginning||e.params.loop||e.params.rewind)&&(e.slidePrev(),t("navigationPrev"));}function d(a){a.preventDefault(),(!e.isEnd||e.params.loop||e.params.rewind)&&(e.slideNext(),t("navigationNext"));}function c(){const a=e.params.navigation;if(e.params.navigation=createElementIfNotDefined(e,e.originalParams.navigation,e.params.navigation,{nextEl:"swiper-button-next",prevEl:"swiper-button-prev"}),!a.nextEl&&!a.prevEl)return;let n=s(a.nextEl),i=s(a.prevEl);Object.assign(e.navigation,{nextEl:n,prevEl:i}),n=makeElementsArray(n),i=makeElementsArray(i);const t=(n,i)=>{n&&n.addEventListener("click","next"===i?d:o),!e.enabled&&n&&n.classList.add(...a.lockClass.split(" "));};n.forEach((a=>t(a,"next"))),i.forEach((a=>t(a,"prev")));}function m(){let{nextEl:a,prevEl:n}=e.navigation;a=makeElementsArray(a),n=makeElementsArray(n);const i=(a,n)=>{a.removeEventListener("click","next"===n?d:o),a.classList.remove(...e.params.navigation.disabledClass.split(" "));};a.forEach((a=>i(a,"next"))),n.forEach((a=>i(a,"prev")));}n({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper-button-lock",navigationDisabledClass:"swiper-navigation-disabled"}}),e.navigation={nextEl:null,prevEl:null},i("init",(()=>{!1===e.params.navigation.enabled?p():(c(),r());})),i("toEdge fromEdge lock unlock",(()=>{r();})),i("destroy",(()=>{m();})),i("enable disable",(()=>{let{nextEl:a,prevEl:n}=e.navigation;a=makeElementsArray(a),n=makeElementsArray(n),e.enabled?r():[...a,...n].filter((a=>!!a)).forEach((a=>a.classList.add(e.params.navigation.lockClass)));})),i("click",((a,n)=>{let{nextEl:i,prevEl:s}=e.navigation;i=makeElementsArray(i),s=makeElementsArray(s);const l=n.target;let r=s.includes(l)||i.includes(l);if(e.isElement&&!r){const a=n.path||n.composedPath&&n.composedPath();a&&(r=a.find((a=>i.includes(a)||s.includes(a))));}if(e.params.navigation.hideOnClick&&!r){if(e.pagination&&e.params.pagination&&e.params.pagination.clickable&&(e.pagination.el===l||e.pagination.el.contains(l)))return;let a;i.length?a=i[0].classList.contains(e.params.navigation.hiddenClass):s.length&&(a=s[0].classList.contains(e.params.navigation.hiddenClass)),t(!0===a?"navigationShow":"navigationHide"),[...i,...s].filter((a=>!!a)).forEach((a=>a.classList.toggle(e.params.navigation.hiddenClass)));}}));const p=()=>{e.el.classList.add(...e.params.navigation.navigationDisabledClass.split(" ")),m();};Object.assign(e.navigation,{enable:()=>{e.el.classList.remove(...e.params.navigation.navigationDisabledClass.split(" ")),c(),r();},disable:p,update:r,init:c,destroy:m});}

  function classesToSelector(e){return void 0===e&&(e=""),`.${e.trim().replace(/([\.:!+\/])/g,"\\$1").replace(/ /g,".")}`}

  function Pagination(e){let{swiper:a,extendParams:s,on:l,emit:t}=e;const i="swiper-pagination";let n;s({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,renderFraction:null,renderCustom:null,progressbarOpposite:!1,type:"bullets",dynamicBullets:!1,dynamicMainBullets:1,formatFractionCurrent:e=>e,formatFractionTotal:e=>e,bulletClass:`${i}-bullet`,bulletActiveClass:`${i}-bullet-active`,modifierClass:`${i}-`,currentClass:`${i}-current`,totalClass:`${i}-total`,hiddenClass:`${i}-hidden`,progressbarFillClass:`${i}-progressbar-fill`,progressbarOppositeClass:`${i}-progressbar-opposite`,clickableClass:`${i}-clickable`,lockClass:`${i}-lock`,horizontalClass:`${i}-horizontal`,verticalClass:`${i}-vertical`,paginationDisabledClass:`${i}-disabled`}}),a.pagination={el:null,bullets:[]};let r=0;function o(){return !a.params.pagination.el||!a.pagination.el||Array.isArray(a.pagination.el)&&0===a.pagination.el.length}function p(e,s){const{bulletActiveClass:l}=a.params.pagination;e&&(e=e[("prev"===s?"previous":"next")+"ElementSibling"])&&(e.classList.add(`${l}-${s}`),(e=e[("prev"===s?"previous":"next")+"ElementSibling"])&&e.classList.add(`${l}-${s}-${s}`));}function c(e){const s=e.target.closest(classesToSelector(a.params.pagination.bulletClass));if(!s)return;e.preventDefault();const l=elementIndex(s)*a.params.slidesPerGroup;if(a.params.loop){if(a.realIndex===l)return;const e=(t=a.realIndex,i=l,n=a.slides.length,(i%=n)==1+(t%=n)?"next":i===t-1?"previous":void 0);"next"===e?a.slideNext():"previous"===e?a.slidePrev():a.slideToLoop(l);}else a.slideTo(l);var t,i,n;}function d(){const e=a.rtl,s=a.params.pagination;if(o())return;let l,i,c=a.pagination.el;c=makeElementsArray(c);const d=a.virtual&&a.params.virtual.enabled?a.virtual.slides.length:a.slides.length,m=a.params.loop?Math.ceil(d/a.params.slidesPerGroup):a.snapGrid.length;if(a.params.loop?(i=a.previousRealIndex||0,l=a.params.slidesPerGroup>1?Math.floor(a.realIndex/a.params.slidesPerGroup):a.realIndex):void 0!==a.snapIndex?(l=a.snapIndex,i=a.previousSnapIndex):(i=a.previousIndex||0,l=a.activeIndex||0),"bullets"===s.type&&a.pagination.bullets&&a.pagination.bullets.length>0){const t=a.pagination.bullets;let o,d,m;if(s.dynamicBullets&&(n=elementOuterSize(t[0],a.isHorizontal()?"width":"height",!0),c.forEach((e=>{e.style[a.isHorizontal()?"width":"height"]=n*(s.dynamicMainBullets+4)+"px";})),s.dynamicMainBullets>1&&void 0!==i&&(r+=l-(i||0),r>s.dynamicMainBullets-1?r=s.dynamicMainBullets-1:r<0&&(r=0)),o=Math.max(l-r,0),d=o+(Math.min(t.length,s.dynamicMainBullets)-1),m=(d+o)/2),t.forEach((e=>{const a=[...["","-next","-next-next","-prev","-prev-prev","-main"].map((e=>`${s.bulletActiveClass}${e}`))].map((e=>"string"==typeof e&&e.includes(" ")?e.split(" "):e)).flat();e.classList.remove(...a);})),c.length>1)t.forEach((e=>{const t=elementIndex(e);t===l?e.classList.add(...s.bulletActiveClass.split(" ")):a.isElement&&e.setAttribute("part","bullet"),s.dynamicBullets&&(t>=o&&t<=d&&e.classList.add(...`${s.bulletActiveClass}-main`.split(" ")),t===o&&p(e,"prev"),t===d&&p(e,"next"));}));else {const e=t[l];if(e&&e.classList.add(...s.bulletActiveClass.split(" ")),a.isElement&&t.forEach(((e,a)=>{e.setAttribute("part",a===l?"bullet-active":"bullet");})),s.dynamicBullets){const e=t[o],a=t[d];for(let e=o;e<=d;e+=1)t[e]&&t[e].classList.add(...`${s.bulletActiveClass}-main`.split(" "));p(e,"prev"),p(a,"next");}}if(s.dynamicBullets){const l=Math.min(t.length,s.dynamicMainBullets+4),i=(n*l-n)/2-m*n,r=e?"right":"left";t.forEach((e=>{e.style[a.isHorizontal()?r:"top"]=`${i}px`;}));}}c.forEach(((e,i)=>{if("fraction"===s.type&&(e.querySelectorAll(classesToSelector(s.currentClass)).forEach((e=>{e.textContent=s.formatFractionCurrent(l+1);})),e.querySelectorAll(classesToSelector(s.totalClass)).forEach((e=>{e.textContent=s.formatFractionTotal(m);}))),"progressbar"===s.type){let t;t=s.progressbarOpposite?a.isHorizontal()?"vertical":"horizontal":a.isHorizontal()?"horizontal":"vertical";const i=(l+1)/m;let n=1,r=1;"horizontal"===t?n=i:r=i,e.querySelectorAll(classesToSelector(s.progressbarFillClass)).forEach((e=>{e.style.transform=`translate3d(0,0,0) scaleX(${n}) scaleY(${r})`,e.style.transitionDuration=`${a.params.speed}ms`;}));}"custom"===s.type&&s.renderCustom?(e.innerHTML=s.renderCustom(a,l+1,m),0===i&&t("paginationRender",e)):(0===i&&t("paginationRender",e),t("paginationUpdate",e)),a.params.watchOverflow&&a.enabled&&e.classList[a.isLocked?"add":"remove"](s.lockClass);}));}function m(){const e=a.params.pagination;if(o())return;const s=a.virtual&&a.params.virtual.enabled?a.virtual.slides.length:a.grid&&a.params.grid.rows>1?a.slides.length/Math.ceil(a.params.grid.rows):a.slides.length;let l=a.pagination.el;l=makeElementsArray(l);let i="";if("bullets"===e.type){let l=a.params.loop?Math.ceil(s/a.params.slidesPerGroup):a.snapGrid.length;a.params.freeMode&&a.params.freeMode.enabled&&l>s&&(l=s);for(let s=0;s<l;s+=1)e.renderBullet?i+=e.renderBullet.call(a,s,e.bulletClass):i+=`<${e.bulletElement} ${a.isElement?'part="bullet"':""} class="${e.bulletClass}"></${e.bulletElement}>`;}"fraction"===e.type&&(i=e.renderFraction?e.renderFraction.call(a,e.currentClass,e.totalClass):`<span class="${e.currentClass}"></span> / <span class="${e.totalClass}"></span>`),"progressbar"===e.type&&(i=e.renderProgressbar?e.renderProgressbar.call(a,e.progressbarFillClass):`<span class="${e.progressbarFillClass}"></span>`),a.pagination.bullets=[],l.forEach((s=>{"custom"!==e.type&&(s.innerHTML=i||""),"bullets"===e.type&&a.pagination.bullets.push(...s.querySelectorAll(classesToSelector(e.bulletClass)));})),"custom"!==e.type&&t("paginationRender",l[0]);}function u(){a.params.pagination=createElementIfNotDefined(a,a.originalParams.pagination,a.params.pagination,{el:"swiper-pagination"});const e=a.params.pagination;if(!e.el)return;let s;"string"==typeof e.el&&a.isElement&&(s=a.el.querySelector(e.el)),s||"string"!=typeof e.el||(s=[...document.querySelectorAll(e.el)]),s||(s=e.el),s&&0!==s.length&&(a.params.uniqueNavElements&&"string"==typeof e.el&&Array.isArray(s)&&s.length>1&&(s=[...a.el.querySelectorAll(e.el)],s.length>1&&(s=s.filter((e=>elementParents(e,".swiper")[0]===a.el))[0])),Array.isArray(s)&&1===s.length&&(s=s[0]),Object.assign(a.pagination,{el:s}),s=makeElementsArray(s),s.forEach((s=>{"bullets"===e.type&&e.clickable&&s.classList.add(...(e.clickableClass||"").split(" ")),s.classList.add(e.modifierClass+e.type),s.classList.add(a.isHorizontal()?e.horizontalClass:e.verticalClass),"bullets"===e.type&&e.dynamicBullets&&(s.classList.add(`${e.modifierClass}${e.type}-dynamic`),r=0,e.dynamicMainBullets<1&&(e.dynamicMainBullets=1)),"progressbar"===e.type&&e.progressbarOpposite&&s.classList.add(e.progressbarOppositeClass),e.clickable&&s.addEventListener("click",c),a.enabled||s.classList.add(e.lockClass);})));}function g(){const e=a.params.pagination;if(o())return;let s=a.pagination.el;s&&(s=makeElementsArray(s),s.forEach((s=>{s.classList.remove(e.hiddenClass),s.classList.remove(e.modifierClass+e.type),s.classList.remove(a.isHorizontal()?e.horizontalClass:e.verticalClass),e.clickable&&(s.classList.remove(...(e.clickableClass||"").split(" ")),s.removeEventListener("click",c));}))),a.pagination.bullets&&a.pagination.bullets.forEach((a=>a.classList.remove(...e.bulletActiveClass.split(" "))));}l("changeDirection",(()=>{if(!a.pagination||!a.pagination.el)return;const e=a.params.pagination;let{el:s}=a.pagination;s=makeElementsArray(s),s.forEach((s=>{s.classList.remove(e.horizontalClass,e.verticalClass),s.classList.add(a.isHorizontal()?e.horizontalClass:e.verticalClass);}));})),l("init",(()=>{!1===a.params.pagination.enabled?b():(u(),m(),d());})),l("activeIndexChange",(()=>{void 0===a.snapIndex&&d();})),l("snapIndexChange",(()=>{d();})),l("snapGridLengthChange",(()=>{m(),d();})),l("destroy",(()=>{g();})),l("enable disable",(()=>{let{el:e}=a.pagination;e&&(e=makeElementsArray(e),e.forEach((e=>e.classList[a.enabled?"remove":"add"](a.params.pagination.lockClass))));})),l("lock unlock",(()=>{d();})),l("click",((e,s)=>{const l=s.target,i=makeElementsArray(a.pagination.el);if(a.params.pagination.el&&a.params.pagination.hideOnClick&&i&&i.length>0&&!l.classList.contains(a.params.pagination.bulletClass)){if(a.navigation&&(a.navigation.nextEl&&l===a.navigation.nextEl||a.navigation.prevEl&&l===a.navigation.prevEl))return;const e=i[0].classList.contains(a.params.pagination.hiddenClass);t(!0===e?"paginationShow":"paginationHide"),i.forEach((e=>e.classList.toggle(a.params.pagination.hiddenClass)));}}));const b=()=>{a.el.classList.add(a.params.pagination.paginationDisabledClass);let{el:e}=a.pagination;e&&(e=makeElementsArray(e),e.forEach((e=>e.classList.add(a.params.pagination.paginationDisabledClass)))),g();};Object.assign(a.pagination,{enable:()=>{a.el.classList.remove(a.params.pagination.paginationDisabledClass);let{el:e}=a.pagination;e&&(e=makeElementsArray(e),e.forEach((e=>e.classList.remove(a.params.pagination.paginationDisabledClass)))),u(),m(),d();},disable:b,render:m,update:d,init:u,destroy:g});}

  function Scrollbar(s){let{swiper:l,extendParams:e,on:a,emit:r}=s;const t=getDocument();let o,n,i,c,p=!1,m=null,d=null;function b(){if(!l.params.scrollbar.el||!l.scrollbar.el)return;const{scrollbar:s,rtlTranslate:e}=l,{dragEl:a,el:r}=s,t=l.params.scrollbar,o=l.params.loop?l.progressLoop:l.progress;let c=n,p=(i-n)*o;e?(p=-p,p>0?(c=n-p,p=0):-p+n>i&&(c=i+p)):p<0?(c=n+p,p=0):p+n>i&&(c=i-p),l.isHorizontal()?(a.style.transform=`translate3d(${p}px, 0, 0)`,a.style.width=`${c}px`):(a.style.transform=`translate3d(0px, ${p}px, 0)`,a.style.height=`${c}px`),t.hide&&(clearTimeout(m),r.style.opacity=1,m=setTimeout((()=>{r.style.opacity=0,r.style.transitionDuration="400ms";}),1e3));}function u(){if(!l.params.scrollbar.el||!l.scrollbar.el)return;const{scrollbar:s}=l,{dragEl:e,el:a}=s;e.style.width="",e.style.height="",i=l.isHorizontal()?a.offsetWidth:a.offsetHeight,c=l.size/(l.virtualSize+l.params.slidesOffsetBefore-(l.params.centeredSlides?l.snapGrid[0]:0)),n="auto"===l.params.scrollbar.dragSize?i*c:parseInt(l.params.scrollbar.dragSize,10),l.isHorizontal()?e.style.width=`${n}px`:e.style.height=`${n}px`,a.style.display=c>=1?"none":"",l.params.scrollbar.hide&&(a.style.opacity=0),l.params.watchOverflow&&l.enabled&&s.el.classList[l.isLocked?"add":"remove"](l.params.scrollbar.lockClass);}function f(s){return l.isHorizontal()?s.clientX:s.clientY}function g(s){const{scrollbar:e,rtlTranslate:a}=l,{el:r}=e;let t;t=(f(s)-elementOffset(r)[l.isHorizontal()?"left":"top"]-(null!==o?o:n/2))/(i-n),t=Math.max(Math.min(t,1),0),a&&(t=1-t);const c=l.minTranslate()+(l.maxTranslate()-l.minTranslate())*t;l.updateProgress(c),l.setTranslate(c),l.updateActiveIndex(),l.updateSlidesClasses();}function y(s){const e=l.params.scrollbar,{scrollbar:a,wrapperEl:t}=l,{el:n,dragEl:i}=a;p=!0,o=s.target===i?f(s)-s.target.getBoundingClientRect()[l.isHorizontal()?"left":"top"]:null,s.preventDefault(),s.stopPropagation(),t.style.transitionDuration="100ms",i.style.transitionDuration="100ms",g(s),clearTimeout(d),n.style.transitionDuration="0ms",e.hide&&(n.style.opacity=1),l.params.cssMode&&(l.wrapperEl.style["scroll-snap-type"]="none"),r("scrollbarDragStart",s);}function h(s){const{scrollbar:e,wrapperEl:a}=l,{el:t,dragEl:o}=e;p&&(s.preventDefault&&s.cancelable?s.preventDefault():s.returnValue=!1,g(s),a.style.transitionDuration="0ms",t.style.transitionDuration="0ms",o.style.transitionDuration="0ms",r("scrollbarDragMove",s));}function T(s){const e=l.params.scrollbar,{scrollbar:a,wrapperEl:t}=l,{el:o}=a;p&&(p=!1,l.params.cssMode&&(l.wrapperEl.style["scroll-snap-type"]="",t.style.transitionDuration=""),e.hide&&(clearTimeout(d),d=nextTick((()=>{o.style.opacity=0,o.style.transitionDuration="400ms";}),1e3)),r("scrollbarDragEnd",s),e.snapOnRelease&&l.slideToClosest());}function v(s){const{scrollbar:e,params:a}=l,r=e.el;if(!r)return;const o=r,n=!!a.passiveListeners&&{passive:!1,capture:!1},i=!!a.passiveListeners&&{passive:!0,capture:!1};if(!o)return;const c="on"===s?"addEventListener":"removeEventListener";o[c]("pointerdown",y,n),t[c]("pointermove",h,n),t[c]("pointerup",T,i);}function D(){const{scrollbar:s,el:e}=l;l.params.scrollbar=createElementIfNotDefined(l,l.originalParams.scrollbar,l.params.scrollbar,{el:"swiper-scrollbar"});const a=l.params.scrollbar;if(!a.el)return;let r,o;if("string"==typeof a.el&&l.isElement&&(r=l.el.querySelector(a.el)),r||"string"!=typeof a.el)r||(r=a.el);else if(r=t.querySelectorAll(a.el),!r.length)return;l.params.uniqueNavElements&&"string"==typeof a.el&&r.length>1&&1===e.querySelectorAll(a.el).length&&(r=e.querySelector(a.el)),r.length>0&&(r=r[0]),r.classList.add(l.isHorizontal()?a.horizontalClass:a.verticalClass),r&&(o=r.querySelector(classesToSelector(l.params.scrollbar.dragClass)),o||(o=createElement("div",l.params.scrollbar.dragClass),r.append(o))),Object.assign(s,{el:r,dragEl:o}),a.draggable&&l.params.scrollbar.el&&l.scrollbar.el&&v("on"),r&&r.classList[l.enabled?"remove":"add"](...classesToTokens(l.params.scrollbar.lockClass));}function C(){const s=l.params.scrollbar,e=l.scrollbar.el;e&&e.classList.remove(...classesToTokens(l.isHorizontal()?s.horizontalClass:s.verticalClass)),l.params.scrollbar.el&&l.scrollbar.el&&v("off");}e({scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollbar-lock",dragClass:"swiper-scrollbar-drag",scrollbarDisabledClass:"swiper-scrollbar-disabled",horizontalClass:"swiper-scrollbar-horizontal",verticalClass:"swiper-scrollbar-vertical"}}),l.scrollbar={el:null,dragEl:null},a("changeDirection",(()=>{if(!l.scrollbar||!l.scrollbar.el)return;const s=l.params.scrollbar;let{el:e}=l.scrollbar;e=makeElementsArray(e),e.forEach((e=>{e.classList.remove(s.horizontalClass,s.verticalClass),e.classList.add(l.isHorizontal()?s.horizontalClass:s.verticalClass);}));})),a("init",(()=>{!1===l.params.scrollbar.enabled?E():(D(),u(),b());})),a("update resize observerUpdate lock unlock changeDirection",(()=>{u();})),a("setTranslate",(()=>{b();})),a("setTransition",((s,e)=>{!function(s){l.params.scrollbar.el&&l.scrollbar.el&&(l.scrollbar.dragEl.style.transitionDuration=`${s}ms`);}(e);})),a("enable disable",(()=>{const{el:s}=l.scrollbar;s&&s.classList[l.enabled?"remove":"add"](...classesToTokens(l.params.scrollbar.lockClass));})),a("destroy",(()=>{C();}));const E=()=>{l.el.classList.add(...classesToTokens(l.params.scrollbar.scrollbarDisabledClass)),l.scrollbar.el&&l.scrollbar.el.classList.add(...classesToTokens(l.params.scrollbar.scrollbarDisabledClass)),C();};Object.assign(l.scrollbar,{enable:()=>{l.el.classList.remove(...classesToTokens(l.params.scrollbar.scrollbarDisabledClass)),l.scrollbar.el&&l.scrollbar.el.classList.remove(...classesToTokens(l.params.scrollbar.scrollbarDisabledClass)),D(),u(),b();},disable:E,updateSize:u,setTranslate:b,init:D,destroy:C});}

  function Parallax(a){let{swiper:e,extendParams:t,on:l}=a;t({parallax:{enabled:!1}});const r="[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]",s=(a,t)=>{const{rtl:l}=e,r=l?-1:1,s=a.getAttribute("data-swiper-parallax")||"0";let i=a.getAttribute("data-swiper-parallax-x"),p=a.getAttribute("data-swiper-parallax-y");const n=a.getAttribute("data-swiper-parallax-scale"),o=a.getAttribute("data-swiper-parallax-opacity"),d=a.getAttribute("data-swiper-parallax-rotate");if(i||p?(i=i||"0",p=p||"0"):e.isHorizontal()?(i=s,p="0"):(p=s,i="0"),i=i.indexOf("%")>=0?parseInt(i,10)*t*r+"%":i*t*r+"px",p=p.indexOf("%")>=0?parseInt(p,10)*t+"%":p*t+"px",null!=o){const e=o-(o-1)*(1-Math.abs(t));a.style.opacity=e;}let x=`translate3d(${i}, ${p}, 0px)`;if(null!=n){x+=` scale(${n-(n-1)*(1-Math.abs(t))})`;}if(d&&null!=d){x+=` rotate(${d*t*-1}deg)`;}a.style.transform=x;},i=()=>{const{el:a,slides:t,progress:l,snapGrid:i,isElement:p}=e,n=elementChildren(a,r);e.isElement&&n.push(...elementChildren(e.hostEl,r)),n.forEach((a=>{s(a,l);})),t.forEach(((a,t)=>{let p=a.progress;e.params.slidesPerGroup>1&&"auto"!==e.params.slidesPerView&&(p+=Math.ceil(t/2)-l*(i.length-1)),p=Math.min(Math.max(p,-1),1),a.querySelectorAll(`${r}, [data-swiper-parallax-rotate]`).forEach((a=>{s(a,p);}));}));};l("beforeInit",(()=>{e.params.parallax.enabled&&(e.params.watchSlidesProgress=!0,e.originalParams.watchSlidesProgress=!0);})),l("init",(()=>{e.params.parallax.enabled&&i();})),l("setTranslate",(()=>{e.params.parallax.enabled&&i();})),l("setTransition",((a,t)=>{e.params.parallax.enabled&&function(a){void 0===a&&(a=e.params.speed);const{el:t,hostEl:l}=e,s=[...t.querySelectorAll(r)];e.isElement&&s.push(...l.querySelectorAll(r)),s.forEach((e=>{let t=parseInt(e.getAttribute("data-swiper-parallax-duration"),10)||a;0===a&&(t=0),e.style.transitionDuration=`${t}ms`;}));}(t);}));}

  function Zoom(e){let{swiper:t,extendParams:i,on:a,emit:r}=e;const s=getWindow();i({zoom:{enabled:!1,limitToOriginalSize:!1,maxRatio:3,minRatio:1,toggle:!0,containerClass:"swiper-zoom-container",zoomedSlideClass:"swiper-slide-zoomed"}}),t.zoom={enabled:!1};let o,n,l=1,m=!1;const c=[],d={originX:0,originY:0,slideEl:void 0,slideWidth:void 0,slideHeight:void 0,imageEl:void 0,imageWrapEl:void 0,maxRatio:3},u={isTouched:void 0,isMoved:void 0,currentX:void 0,currentY:void 0,minX:void 0,minY:void 0,maxX:void 0,maxY:void 0,width:void 0,height:void 0,startX:void 0,startY:void 0,touchesStart:{},touchesCurrent:{}},p={x:void 0,y:void 0,prevPositionX:void 0,prevPositionY:void 0,prevTime:void 0};let g,h=1;function v(){if(c.length<2)return 1;const e=c[0].pageX,t=c[0].pageY,i=c[1].pageX,a=c[1].pageY;return Math.sqrt((i-e)**2+(a-t)**2)}function E(){const e=t.params.zoom,i=d.imageWrapEl.getAttribute("data-swiper-zoom")||e.maxRatio;if(e.limitToOriginalSize&&d.imageEl&&d.imageEl.naturalWidth){const e=d.imageEl.naturalWidth/d.imageEl.offsetWidth;return Math.min(e,i)}return i}function f(e){const i=t.isElement?"swiper-slide":`.${t.params.slideClass}`;return !!e.target.matches(i)||t.slides.filter((t=>t.contains(e.target))).length>0}function x(e){if("mouse"===e.pointerType&&c.splice(0,c.length),!f(e))return;const i=t.params.zoom;if(o=!1,n=!1,c.push(e),!(c.length<2)){if(o=!0,d.scaleStart=v(),!d.slideEl){d.slideEl=e.target.closest(`.${t.params.slideClass}, swiper-slide`),d.slideEl||(d.slideEl=t.slides[t.activeIndex]);let a=d.slideEl.querySelector(`.${i.containerClass}`);if(a&&(a=a.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),d.imageEl=a,d.imageWrapEl=a?elementParents(d.imageEl,`.${i.containerClass}`)[0]:void 0,!d.imageWrapEl)return void(d.imageEl=void 0);d.maxRatio=E();}if(d.imageEl){const[e,t]=function(){if(c.length<2)return {x:null,y:null};const e=d.imageEl.getBoundingClientRect();return [(c[0].pageX+(c[1].pageX-c[0].pageX)/2-e.x-s.scrollX)/l,(c[0].pageY+(c[1].pageY-c[0].pageY)/2-e.y-s.scrollY)/l]}();d.originX=e,d.originY=t,d.imageEl.style.transitionDuration="0ms";}m=!0;}}function y(e){if(!f(e))return;const i=t.params.zoom,a=t.zoom,r=c.findIndex((t=>t.pointerId===e.pointerId));r>=0&&(c[r]=e),c.length<2||(n=!0,d.scaleMove=v(),d.imageEl&&(a.scale=d.scaleMove/d.scaleStart*l,a.scale>d.maxRatio&&(a.scale=d.maxRatio-1+(a.scale-d.maxRatio+1)**.5),a.scale<i.minRatio&&(a.scale=i.minRatio+1-(i.minRatio-a.scale+1)**.5),d.imageEl.style.transform=`translate3d(0,0,0) scale(${a.scale})`));}function X(e){if(!f(e))return;if("mouse"===e.pointerType&&"pointerout"===e.type)return;const i=t.params.zoom,a=t.zoom,r=c.findIndex((t=>t.pointerId===e.pointerId));r>=0&&c.splice(r,1),o&&n&&(o=!1,n=!1,d.imageEl&&(a.scale=Math.max(Math.min(a.scale,d.maxRatio),i.minRatio),d.imageEl.style.transitionDuration=`${t.params.speed}ms`,d.imageEl.style.transform=`translate3d(0,0,0) scale(${a.scale})`,l=a.scale,m=!1,a.scale>1&&d.slideEl?d.slideEl.classList.add(`${i.zoomedSlideClass}`):a.scale<=1&&d.slideEl&&d.slideEl.classList.remove(`${i.zoomedSlideClass}`),1===a.scale&&(d.originX=0,d.originY=0,d.slideEl=void 0)));}function Y(){t.touchEventsData.preventTouchMoveFromPointerMove=!1;}function z(e){if(!f(e)||!function(e){const i=`.${t.params.zoom.containerClass}`;return !!e.target.matches(i)||[...t.hostEl.querySelectorAll(i)].filter((t=>t.contains(e.target))).length>0}(e))return;const i=t.zoom;if(!d.imageEl)return;if(!u.isTouched||!d.slideEl)return;u.isMoved||(u.width=d.imageEl.offsetWidth||d.imageEl.clientWidth,u.height=d.imageEl.offsetHeight||d.imageEl.clientHeight,u.startX=getTranslate(d.imageWrapEl,"x")||0,u.startY=getTranslate(d.imageWrapEl,"y")||0,d.slideWidth=d.slideEl.offsetWidth,d.slideHeight=d.slideEl.offsetHeight,d.imageWrapEl.style.transitionDuration="0ms");const a=u.width*i.scale,r=u.height*i.scale;u.minX=Math.min(d.slideWidth/2-a/2,0),u.maxX=-u.minX,u.minY=Math.min(d.slideHeight/2-r/2,0),u.maxY=-u.minY,u.touchesCurrent.x=c.length>0?c[0].pageX:e.pageX,u.touchesCurrent.y=c.length>0?c[0].pageY:e.pageY;if(Math.max(Math.abs(u.touchesCurrent.x-u.touchesStart.x),Math.abs(u.touchesCurrent.y-u.touchesStart.y))>5&&(t.allowClick=!1),!u.isMoved&&!m){if(t.isHorizontal()&&(Math.floor(u.minX)===Math.floor(u.startX)&&u.touchesCurrent.x<u.touchesStart.x||Math.floor(u.maxX)===Math.floor(u.startX)&&u.touchesCurrent.x>u.touchesStart.x))return u.isTouched=!1,void Y();if(!t.isHorizontal()&&(Math.floor(u.minY)===Math.floor(u.startY)&&u.touchesCurrent.y<u.touchesStart.y||Math.floor(u.maxY)===Math.floor(u.startY)&&u.touchesCurrent.y>u.touchesStart.y))return u.isTouched=!1,void Y()}e.cancelable&&e.preventDefault(),e.stopPropagation(),clearTimeout(g),t.touchEventsData.preventTouchMoveFromPointerMove=!0,g=setTimeout((()=>{t.destroyed||Y();})),u.isMoved=!0;const s=(i.scale-l)/(d.maxRatio-t.params.zoom.minRatio),{originX:o,originY:n}=d;u.currentX=u.touchesCurrent.x-u.touchesStart.x+u.startX+s*(u.width-2*o),u.currentY=u.touchesCurrent.y-u.touchesStart.y+u.startY+s*(u.height-2*n),u.currentX<u.minX&&(u.currentX=u.minX+1-(u.minX-u.currentX+1)**.8),u.currentX>u.maxX&&(u.currentX=u.maxX-1+(u.currentX-u.maxX+1)**.8),u.currentY<u.minY&&(u.currentY=u.minY+1-(u.minY-u.currentY+1)**.8),u.currentY>u.maxY&&(u.currentY=u.maxY-1+(u.currentY-u.maxY+1)**.8),p.prevPositionX||(p.prevPositionX=u.touchesCurrent.x),p.prevPositionY||(p.prevPositionY=u.touchesCurrent.y),p.prevTime||(p.prevTime=Date.now()),p.x=(u.touchesCurrent.x-p.prevPositionX)/(Date.now()-p.prevTime)/2,p.y=(u.touchesCurrent.y-p.prevPositionY)/(Date.now()-p.prevTime)/2,Math.abs(u.touchesCurrent.x-p.prevPositionX)<2&&(p.x=0),Math.abs(u.touchesCurrent.y-p.prevPositionY)<2&&(p.y=0),p.prevPositionX=u.touchesCurrent.x,p.prevPositionY=u.touchesCurrent.y,p.prevTime=Date.now(),d.imageWrapEl.style.transform=`translate3d(${u.currentX}px, ${u.currentY}px,0)`;}function C(){const e=t.zoom;d.slideEl&&t.activeIndex!==t.slides.indexOf(d.slideEl)&&(d.imageEl&&(d.imageEl.style.transform="translate3d(0,0,0) scale(1)"),d.imageWrapEl&&(d.imageWrapEl.style.transform="translate3d(0,0,0)"),d.slideEl.classList.remove(`${t.params.zoom.zoomedSlideClass}`),e.scale=1,l=1,d.slideEl=void 0,d.imageEl=void 0,d.imageWrapEl=void 0,d.originX=0,d.originY=0);}function M(e){const i=t.zoom,a=t.params.zoom;if(!d.slideEl){e&&e.target&&(d.slideEl=e.target.closest(`.${t.params.slideClass}, swiper-slide`)),d.slideEl||(t.params.virtual&&t.params.virtual.enabled&&t.virtual?d.slideEl=elementChildren(t.slidesEl,`.${t.params.slideActiveClass}`)[0]:d.slideEl=t.slides[t.activeIndex]);let i=d.slideEl.querySelector(`.${a.containerClass}`);i&&(i=i.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),d.imageEl=i,d.imageWrapEl=i?elementParents(d.imageEl,`.${a.containerClass}`)[0]:void 0;}if(!d.imageEl||!d.imageWrapEl)return;let r,o,n,m,c,p,g,h,v,f,x,y,X,Y,z,C,M,w;t.params.cssMode&&(t.wrapperEl.style.overflow="hidden",t.wrapperEl.style.touchAction="none"),d.slideEl.classList.add(`${a.zoomedSlideClass}`),void 0===u.touchesStart.x&&e?(r=e.pageX,o=e.pageY):(r=u.touchesStart.x,o=u.touchesStart.y);const W="number"==typeof e?e:null;1===l&&W&&(r=void 0,o=void 0,u.touchesStart.x=void 0,u.touchesStart.y=void 0);const S=E();i.scale=W||S,l=W||S,!e||1===l&&W?(g=0,h=0):(M=d.slideEl.offsetWidth,w=d.slideEl.offsetHeight,n=elementOffset(d.slideEl).left+s.scrollX,m=elementOffset(d.slideEl).top+s.scrollY,c=n+M/2-r,p=m+w/2-o,v=d.imageEl.offsetWidth||d.imageEl.clientWidth,f=d.imageEl.offsetHeight||d.imageEl.clientHeight,x=v*i.scale,y=f*i.scale,X=Math.min(M/2-x/2,0),Y=Math.min(w/2-y/2,0),z=-X,C=-Y,g=c*i.scale,h=p*i.scale,g<X&&(g=X),g>z&&(g=z),h<Y&&(h=Y),h>C&&(h=C)),W&&1===i.scale&&(d.originX=0,d.originY=0),d.imageWrapEl.style.transitionDuration="300ms",d.imageWrapEl.style.transform=`translate3d(${g}px, ${h}px,0)`,d.imageEl.style.transitionDuration="300ms",d.imageEl.style.transform=`translate3d(0,0,0) scale(${i.scale})`;}function w(){const e=t.zoom,i=t.params.zoom;if(!d.slideEl){t.params.virtual&&t.params.virtual.enabled&&t.virtual?d.slideEl=elementChildren(t.slidesEl,`.${t.params.slideActiveClass}`)[0]:d.slideEl=t.slides[t.activeIndex];let e=d.slideEl.querySelector(`.${i.containerClass}`);e&&(e=e.querySelectorAll("picture, img, svg, canvas, .swiper-zoom-target")[0]),d.imageEl=e,d.imageWrapEl=e?elementParents(d.imageEl,`.${i.containerClass}`)[0]:void 0;}d.imageEl&&d.imageWrapEl&&(t.params.cssMode&&(t.wrapperEl.style.overflow="",t.wrapperEl.style.touchAction=""),e.scale=1,l=1,u.touchesStart.x=void 0,u.touchesStart.y=void 0,d.imageWrapEl.style.transitionDuration="300ms",d.imageWrapEl.style.transform="translate3d(0,0,0)",d.imageEl.style.transitionDuration="300ms",d.imageEl.style.transform="translate3d(0,0,0) scale(1)",d.slideEl.classList.remove(`${i.zoomedSlideClass}`),d.slideEl=void 0,d.originX=0,d.originY=0);}function W(e){const i=t.zoom;i.scale&&1!==i.scale?w():M(e);}function S(){return {passiveListener:!!t.params.passiveListeners&&{passive:!0,capture:!1},activeListenerWithCapture:!t.params.passiveListeners||{passive:!1,capture:!0}}}function b(){const e=t.zoom;if(e.enabled)return;e.enabled=!0;const{passiveListener:i,activeListenerWithCapture:a}=S();t.wrapperEl.addEventListener("pointerdown",x,i),t.wrapperEl.addEventListener("pointermove",y,a),["pointerup","pointercancel","pointerout"].forEach((e=>{t.wrapperEl.addEventListener(e,X,i);})),t.wrapperEl.addEventListener("pointermove",z,a);}function $(){const e=t.zoom;if(!e.enabled)return;e.enabled=!1;const{passiveListener:i,activeListenerWithCapture:a}=S();t.wrapperEl.removeEventListener("pointerdown",x,i),t.wrapperEl.removeEventListener("pointermove",y,a),["pointerup","pointercancel","pointerout"].forEach((e=>{t.wrapperEl.removeEventListener(e,X,i);})),t.wrapperEl.removeEventListener("pointermove",z,a);}Object.defineProperty(t.zoom,"scale",{get:()=>h,set(e){if(h!==e){const t=d.imageEl,i=d.slideEl;r("zoomChange",e,t,i);}h=e;}}),a("init",(()=>{t.params.zoom.enabled&&b();})),a("destroy",(()=>{$();})),a("touchStart",((e,i)=>{t.zoom.enabled&&function(e){const i=t.device;if(!d.imageEl)return;if(u.isTouched)return;i.android&&e.cancelable&&e.preventDefault(),u.isTouched=!0;const a=c.length>0?c[0]:e;u.touchesStart.x=a.pageX,u.touchesStart.y=a.pageY;}(i);})),a("touchEnd",((e,i)=>{t.zoom.enabled&&function(){const e=t.zoom;if(!d.imageEl)return;if(!u.isTouched||!u.isMoved)return u.isTouched=!1,void(u.isMoved=!1);u.isTouched=!1,u.isMoved=!1;let i=300,a=300;const r=p.x*i,s=u.currentX+r,o=p.y*a,n=u.currentY+o;0!==p.x&&(i=Math.abs((s-u.currentX)/p.x)),0!==p.y&&(a=Math.abs((n-u.currentY)/p.y));const l=Math.max(i,a);u.currentX=s,u.currentY=n;const m=u.width*e.scale,c=u.height*e.scale;u.minX=Math.min(d.slideWidth/2-m/2,0),u.maxX=-u.minX,u.minY=Math.min(d.slideHeight/2-c/2,0),u.maxY=-u.minY,u.currentX=Math.max(Math.min(u.currentX,u.maxX),u.minX),u.currentY=Math.max(Math.min(u.currentY,u.maxY),u.minY),d.imageWrapEl.style.transitionDuration=`${l}ms`,d.imageWrapEl.style.transform=`translate3d(${u.currentX}px, ${u.currentY}px,0)`;}();})),a("doubleTap",((e,i)=>{!t.animating&&t.params.zoom.enabled&&t.zoom.enabled&&t.params.zoom.toggle&&W(i);})),a("transitionEnd",(()=>{t.zoom.enabled&&t.params.zoom.enabled&&C();})),a("slideChange",(()=>{t.zoom.enabled&&t.params.zoom.enabled&&t.params.cssMode&&C();})),Object.assign(t.zoom,{enable:b,disable:$,in:M,out:w,toggle:W});}

  function Controller(t){let{swiper:r,extendParams:e,on:n}=t;function o(t,r){const e=function(){let t,r,e;return (n,o)=>{for(r=-1,t=n.length;t-r>1;)e=t+r>>1,n[e]<=o?r=e:t=e;return t}}();let n,o;return this.x=t,this.y=r,this.lastIndex=t.length-1,this.interpolate=function(t){return t?(o=e(this.x,t),n=o-1,(t-this.x[n])*(this.y[o]-this.y[n])/(this.x[o]-this.x[n])+this.y[n]):0},this}function l(){r.controller.control&&r.controller.spline&&(r.controller.spline=void 0,delete r.controller.spline);}e({controller:{control:void 0,inverse:!1,by:"slide"}}),r.controller={control:void 0},n("beforeInit",(()=>{if("undefined"!=typeof window&&("string"==typeof r.params.controller.control||r.params.controller.control instanceof HTMLElement)){("string"==typeof r.params.controller.control?[...document.querySelectorAll(r.params.controller.control)]:[r.params.controller.control]).forEach((t=>{if(r.controller.control||(r.controller.control=[]),t&&t.swiper)r.controller.control.push(t.swiper);else if(t){const e=`${r.params.eventsPrefix}init`,n=o=>{r.controller.control.push(o.detail[0]),r.update(),t.removeEventListener(e,n);};t.addEventListener(e,n);}}));}else r.controller.control=r.params.controller.control;})),n("update",(()=>{l();})),n("resize",(()=>{l();})),n("observerUpdate",(()=>{l();})),n("setTranslate",((t,e,n)=>{r.controller.control&&!r.controller.control.destroyed&&r.controller.setTranslate(e,n);})),n("setTransition",((t,e,n)=>{r.controller.control&&!r.controller.control.destroyed&&r.controller.setTransition(e,n);})),Object.assign(r.controller,{setTranslate:function(t,e){const n=r.controller.control;let l,s;const i=r.constructor;function a(t){if(t.destroyed)return;const e=r.rtlTranslate?-r.translate:r.translate;"slide"===r.params.controller.by&&(!function(t){r.controller.spline=r.params.loop?new o(r.slidesGrid,t.slidesGrid):new o(r.snapGrid,t.snapGrid);}(t),s=-r.controller.spline.interpolate(-e)),s&&"container"!==r.params.controller.by||(l=(t.maxTranslate()-t.minTranslate())/(r.maxTranslate()-r.minTranslate()),!Number.isNaN(l)&&Number.isFinite(l)||(l=1),s=(e-r.minTranslate())*l+t.minTranslate()),r.params.controller.inverse&&(s=t.maxTranslate()-s),t.updateProgress(s),t.setTranslate(s,r),t.updateActiveIndex(),t.updateSlidesClasses();}if(Array.isArray(n))for(let t=0;t<n.length;t+=1)n[t]!==e&&n[t]instanceof i&&a(n[t]);else n instanceof i&&e!==n&&a(n);},setTransition:function(t,e){const n=r.constructor,o=r.controller.control;let l;function s(e){e.destroyed||(e.setTransition(t,r),0!==t&&(e.transitionStart(),e.params.autoHeight&&nextTick((()=>{e.updateAutoHeight();})),elementTransitionEnd(e.wrapperEl,(()=>{o&&e.transitionEnd();}))));}if(Array.isArray(o))for(l=0;l<o.length;l+=1)o[l]!==e&&o[l]instanceof n&&s(o[l]);else o instanceof n&&e!==o&&s(o);}});}

  function A11y(e){let{swiper:a,extendParams:t,on:n}=e;t({a11y:{enabled:!0,notificationClass:"swiper-notification",prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}",slideLabelMessage:"{{index}} / {{slidesLength}}",containerMessage:null,containerRoleDescriptionMessage:null,containerRole:null,itemRoleDescriptionMessage:null,slideRole:"group",id:null,scrollOnFocus:!0}}),a.a11y={clicked:!1};let i,s,r=null,l=(new Date).getTime();function o(e){const a=r;0!==a.length&&(a.innerHTML="",a.innerHTML=e);}function c(e){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("tabIndex","0");}));}function d(e){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("tabIndex","-1");}));}function m(e,a){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("role",a);}));}function p(e,a){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("aria-roledescription",a);}));}function g(e,a){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("aria-label",a);}));}function u(e){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("aria-disabled",!0);}));}function E(e){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("aria-disabled",!1);}));}function f(e){if(13!==e.keyCode&&32!==e.keyCode)return;const t=a.params.a11y,n=e.target;if(!a.pagination||!a.pagination.el||n!==a.pagination.el&&!a.pagination.el.contains(e.target)||e.target.matches(classesToSelector(a.params.pagination.bulletClass))){if(a.navigation&&a.navigation.prevEl&&a.navigation.nextEl){const e=makeElementsArray(a.navigation.prevEl);makeElementsArray(a.navigation.nextEl).includes(n)&&(a.isEnd&&!a.params.loop||a.slideNext(),a.isEnd?o(t.lastSlideMessage):o(t.nextSlideMessage)),e.includes(n)&&(a.isBeginning&&!a.params.loop||a.slidePrev(),a.isBeginning?o(t.firstSlideMessage):o(t.prevSlideMessage));}a.pagination&&n.matches(classesToSelector(a.params.pagination.bulletClass))&&n.click();}}function v(){return a.pagination&&a.pagination.bullets&&a.pagination.bullets.length}function y(){return v()&&a.params.pagination.clickable}const b=(e,a,t)=>{c(e),"BUTTON"!==e.tagName&&(m(e,"button"),e.addEventListener("keydown",f)),g(e,t),function(e,a){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("aria-controls",a);}));}(e,a);},h=e=>{s&&s!==e.target&&!s.contains(e.target)&&(i=!0),a.a11y.clicked=!0;},A=()=>{i=!1,requestAnimationFrame((()=>{requestAnimationFrame((()=>{a.destroyed||(a.a11y.clicked=!1);}));}));},k=e=>{l=(new Date).getTime();},M=e=>{if(a.a11y.clicked||!a.params.a11y.scrollOnFocus)return;if((new Date).getTime()-l<100)return;const t=e.target.closest(`.${a.params.slideClass}, swiper-slide`);if(!t||!a.slides.includes(t))return;s=t;const n=a.slides.indexOf(t)===a.activeIndex,r=a.params.watchSlidesProgress&&a.visibleSlides&&a.visibleSlides.includes(t);n||r||e.sourceCapabilities&&e.sourceCapabilities.firesTouchEvents||(a.isHorizontal()?a.el.scrollLeft=0:a.el.scrollTop=0,requestAnimationFrame((()=>{i||(a.params.loop?a.slideToLoop(parseInt(t.getAttribute("data-swiper-slide-index")),0):a.slideTo(a.slides.indexOf(t),0),i=!1);})));},x=()=>{const e=a.params.a11y;e.itemRoleDescriptionMessage&&p(a.slides,e.itemRoleDescriptionMessage),e.slideRole&&m(a.slides,e.slideRole);const t=a.slides.length;e.slideLabelMessage&&a.slides.forEach(((n,i)=>{const s=a.params.loop?parseInt(n.getAttribute("data-swiper-slide-index"),10):i;g(n,e.slideLabelMessage.replace(/\{\{index\}\}/,s+1).replace(/\{\{slidesLength\}\}/,t));}));},L=()=>{const e=a.params.a11y;a.el.append(r);const t=a.el;e.containerRoleDescriptionMessage&&p(t,e.containerRoleDescriptionMessage),e.containerMessage&&g(t,e.containerMessage),e.containerRole&&m(t,e.containerRole);const n=a.wrapperEl,i=e.id||n.getAttribute("id")||`swiper-wrapper-${s=16,void 0===s&&(s=16),"x".repeat(s).replace(/x/g,(()=>Math.round(16*Math.random()).toString(16)))}`;var s;const l=a.params.autoplay&&a.params.autoplay.enabled?"off":"polite";var o;o=i,makeElementsArray(n).forEach((e=>{e.setAttribute("id",o);})),function(e,a){(e=makeElementsArray(e)).forEach((e=>{e.setAttribute("aria-live",a);}));}(n,l),x();let{nextEl:c,prevEl:d}=a.navigation?a.navigation:{};if(c=makeElementsArray(c),d=makeElementsArray(d),c&&c.forEach((a=>b(a,i,e.nextSlideMessage))),d&&d.forEach((a=>b(a,i,e.prevSlideMessage))),y()){makeElementsArray(a.pagination.el).forEach((e=>{e.addEventListener("keydown",f);}));}getDocument().addEventListener("visibilitychange",k),a.el.addEventListener("focus",M,!0),a.el.addEventListener("focus",M,!0),a.el.addEventListener("pointerdown",h,!0),a.el.addEventListener("pointerup",A,!0);};n("beforeInit",(()=>{r=createElement("span",a.params.a11y.notificationClass),r.setAttribute("aria-live","assertive"),r.setAttribute("aria-atomic","true");})),n("afterInit",(()=>{a.params.a11y.enabled&&L();})),n("slidesLengthChange snapGridLengthChange slidesGridLengthChange",(()=>{a.params.a11y.enabled&&x();})),n("fromEdge toEdge afterInit lock unlock",(()=>{a.params.a11y.enabled&&function(){if(a.params.loop||a.params.rewind||!a.navigation)return;const{nextEl:e,prevEl:t}=a.navigation;t&&(a.isBeginning?(u(t),d(t)):(E(t),c(t))),e&&(a.isEnd?(u(e),d(e)):(E(e),c(e)));}();})),n("paginationUpdate",(()=>{a.params.a11y.enabled&&function(){const e=a.params.a11y;v()&&a.pagination.bullets.forEach((t=>{a.params.pagination.clickable&&(c(t),a.params.pagination.renderBullet||(m(t,"button"),g(t,e.paginationBulletMessage.replace(/\{\{index\}\}/,elementIndex(t)+1)))),t.matches(classesToSelector(a.params.pagination.bulletActiveClass))?t.setAttribute("aria-current","true"):t.removeAttribute("aria-current");}));}();})),n("destroy",(()=>{a.params.a11y.enabled&&function(){r&&r.remove();let{nextEl:e,prevEl:t}=a.navigation?a.navigation:{};e=makeElementsArray(e),t=makeElementsArray(t),e&&e.forEach((e=>e.removeEventListener("keydown",f))),t&&t.forEach((e=>e.removeEventListener("keydown",f))),y()&&makeElementsArray(a.pagination.el).forEach((e=>{e.removeEventListener("keydown",f);}));getDocument().removeEventListener("visibilitychange",k),a.el&&"string"!=typeof a.el&&(a.el.removeEventListener("focus",M,!0),a.el.removeEventListener("pointerdown",h,!0),a.el.removeEventListener("pointerup",A,!0));}();}));}

  function History(e){let{swiper:t,extendParams:a,on:s}=e;a({history:{enabled:!1,root:"",replaceState:!1,key:"slides",keepQuery:!1}});let r=!1,i={};const l=e=>e.toString().replace(/\s+/g,"-").replace(/[^\w-]+/g,"").replace(/--+/g,"-").replace(/^-+/,"").replace(/-+$/,""),o=e=>{const t=getWindow();let a;a=e?new URL(e):t.location;const s=a.pathname.slice(1).split("/").filter((e=>""!==e)),r=s.length;return {key:s[r-2],value:s[r-1]}},n=(e,a)=>{const s=getWindow();if(!r||!t.params.history.enabled)return;let i;i=t.params.url?new URL(t.params.url):s.location;const o=t.virtual&&t.params.virtual.enabled?t.slidesEl.querySelector(`[data-swiper-slide-index="${a}"]`):t.slides[a];let n=l(o.getAttribute("data-history"));if(t.params.history.root.length>0){let a=t.params.history.root;"/"===a[a.length-1]&&(a=a.slice(0,a.length-1)),n=`${a}/${e?`${e}/`:""}${n}`;}else i.pathname.includes(e)||(n=`${e?`${e}/`:""}${n}`);t.params.history.keepQuery&&(n+=i.search);const p=s.history.state;p&&p.value===n||(t.params.history.replaceState?s.history.replaceState({value:n},null,n):s.history.pushState({value:n},null,n));},p=(e,a,s)=>{if(a)for(let r=0,i=t.slides.length;r<i;r+=1){const i=t.slides[r];if(l(i.getAttribute("data-history"))===a){const a=t.getSlideIndex(i);t.slideTo(a,e,s);}}else t.slideTo(0,e,s);},d=()=>{i=o(t.params.url),p(t.params.speed,i.value,!1);};s("init",(()=>{t.params.history.enabled&&(()=>{const e=getWindow();if(t.params.history){if(!e.history||!e.history.pushState)return t.params.history.enabled=!1,void(t.params.hashNavigation.enabled=!0);r=!0,i=o(t.params.url),i.key||i.value?(p(0,i.value,t.params.runCallbacksOnInit),t.params.history.replaceState||e.addEventListener("popstate",d)):t.params.history.replaceState||e.addEventListener("popstate",d);}})();})),s("destroy",(()=>{t.params.history.enabled&&(()=>{const e=getWindow();t.params.history.replaceState||e.removeEventListener("popstate",d);})();})),s("transitionEnd _freeModeNoMomentumRelease",(()=>{r&&n(t.params.history.key,t.activeIndex);})),s("slideChange",(()=>{r&&t.params.cssMode&&n(t.params.history.key,t.activeIndex);}));}

  function HashNavigation(a){let{swiper:e,extendParams:t,emit:s,on:i}=a,n=!1;const r=getDocument(),h=getWindow();t({hashNavigation:{enabled:!1,replaceState:!1,watchState:!1,getSlideIndex(a,t){if(e.virtual&&e.params.virtual.enabled){const a=e.slides.filter((a=>a.getAttribute("data-hash")===t))[0];if(!a)return 0;return parseInt(a.getAttribute("data-swiper-slide-index"),10)}return e.getSlideIndex(elementChildren(e.slidesEl,`.${e.params.slideClass}[data-hash="${t}"], swiper-slide[data-hash="${t}"]`)[0])}}});const d=()=>{s("hashChange");const a=r.location.hash.replace("#",""),t=e.virtual&&e.params.virtual.enabled?e.slidesEl.querySelector(`[data-swiper-slide-index="${e.activeIndex}"]`):e.slides[e.activeIndex];if(a!==(t?t.getAttribute("data-hash"):"")){const t=e.params.hashNavigation.getSlideIndex(e,a);if(void 0===t||Number.isNaN(t))return;e.slideTo(t);}},l=()=>{if(!n||!e.params.hashNavigation.enabled)return;const a=e.virtual&&e.params.virtual.enabled?e.slidesEl.querySelector(`[data-swiper-slide-index="${e.activeIndex}"]`):e.slides[e.activeIndex],t=a?a.getAttribute("data-hash")||a.getAttribute("data-history"):"";e.params.hashNavigation.replaceState&&h.history&&h.history.replaceState?(h.history.replaceState(null,null,`#${t}`||""),s("hashSet")):(r.location.hash=t||"",s("hashSet"));};i("init",(()=>{e.params.hashNavigation.enabled&&(()=>{if(!e.params.hashNavigation.enabled||e.params.history&&e.params.history.enabled)return;n=!0;const a=r.location.hash.replace("#","");if(a){const t=0,s=e.params.hashNavigation.getSlideIndex(e,a);e.slideTo(s||0,t,e.params.runCallbacksOnInit,!0);}e.params.hashNavigation.watchState&&h.addEventListener("hashchange",d);})();})),i("destroy",(()=>{e.params.hashNavigation.enabled&&e.params.hashNavigation.watchState&&h.removeEventListener("hashchange",d);})),i("transitionEnd _freeModeNoMomentumRelease",(()=>{n&&l();})),i("slideChange",(()=>{n&&e.params.cssMode&&l();}));}

  function Autoplay(e){let a,t,{swiper:n,extendParams:i,on:r,emit:o,params:s}=e;n.autoplay={running:!1,paused:!1,timeLeft:0},i({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!1,stopOnLastSlide:!1,reverseDirection:!1,pauseOnMouseEnter:!1}});let l,p,u,d,y,m,c,g,v=s&&s.autoplay?s.autoplay.delay:3e3,T=s&&s.autoplay?s.autoplay.delay:3e3,f=(new Date).getTime();function w(e){n&&!n.destroyed&&n.wrapperEl&&e.target===n.wrapperEl&&(n.wrapperEl.removeEventListener("transitionend",w),g||e.detail&&e.detail.bySwiperTouchMove||S());}const b=()=>{if(n.destroyed||!n.autoplay.running)return;n.autoplay.paused?p=!0:p&&(T=l,p=!1);const e=n.autoplay.paused?l:f+T-(new Date).getTime();n.autoplay.timeLeft=e,o("autoplayTimeLeft",e,e/v),t=requestAnimationFrame((()=>{b();}));},E=e=>{if(n.destroyed||!n.autoplay.running)return;cancelAnimationFrame(t),b();let i=void 0===e?n.params.autoplay.delay:e;v=n.params.autoplay.delay,T=n.params.autoplay.delay;const r=(()=>{let e;if(e=n.virtual&&n.params.virtual.enabled?n.slides.filter((e=>e.classList.contains("swiper-slide-active")))[0]:n.slides[n.activeIndex],!e)return;return parseInt(e.getAttribute("data-swiper-autoplay"),10)})();!Number.isNaN(r)&&r>0&&void 0===e&&(i=r,v=r,T=r),l=i;const s=n.params.speed,p=()=>{n&&!n.destroyed&&(n.params.autoplay.reverseDirection?!n.isBeginning||n.params.loop||n.params.rewind?(n.slidePrev(s,!0,!0),o("autoplay")):n.params.autoplay.stopOnLastSlide||(n.slideTo(n.slides.length-1,s,!0,!0),o("autoplay")):!n.isEnd||n.params.loop||n.params.rewind?(n.slideNext(s,!0,!0),o("autoplay")):n.params.autoplay.stopOnLastSlide||(n.slideTo(0,s,!0,!0),o("autoplay")),n.params.cssMode&&(f=(new Date).getTime(),requestAnimationFrame((()=>{E();}))));};return i>0?(clearTimeout(a),a=setTimeout((()=>{p();}),i)):requestAnimationFrame((()=>{p();})),i},L=()=>{f=(new Date).getTime(),n.autoplay.running=!0,E(),o("autoplayStart");},D=()=>{n.autoplay.running=!1,clearTimeout(a),cancelAnimationFrame(t),o("autoplayStop");},O=(e,t)=>{if(n.destroyed||!n.autoplay.running)return;clearTimeout(a),e||(c=!0);const i=()=>{o("autoplayPause"),n.params.autoplay.waitForTransition?n.wrapperEl.addEventListener("transitionend",w):S();};if(n.autoplay.paused=!0,t)return m&&(l=n.params.autoplay.delay),m=!1,void i();const r=l||n.params.autoplay.delay;l=r-((new Date).getTime()-f),n.isEnd&&l<0&&!n.params.loop||(l<0&&(l=0),i());},S=()=>{n.isEnd&&l<0&&!n.params.loop||n.destroyed||!n.autoplay.running||(f=(new Date).getTime(),c?(c=!1,E(l)):E(),n.autoplay.paused=!1,o("autoplayResume"));},M=()=>{if(n.destroyed||!n.autoplay.running)return;const e=getDocument();"hidden"===e.visibilityState&&(c=!0,O(!0)),"visible"===e.visibilityState&&S();},h=e=>{"mouse"===e.pointerType&&(c=!0,g=!0,n.animating||n.autoplay.paused||O(!0));},A=e=>{"mouse"===e.pointerType&&(g=!1,n.autoplay.paused&&S());};r("init",(()=>{n.params.autoplay.enabled&&(n.params.autoplay.pauseOnMouseEnter&&(n.el.addEventListener("pointerenter",h),n.el.addEventListener("pointerleave",A)),getDocument().addEventListener("visibilitychange",M),L());})),r("destroy",(()=>{n.el&&"string"!=typeof n.el&&(n.el.removeEventListener("pointerenter",h),n.el.removeEventListener("pointerleave",A)),getDocument().removeEventListener("visibilitychange",M),n.autoplay.running&&D();})),r("_freeModeStaticRelease",(()=>{(d||c)&&S();})),r("_freeModeNoMomentumRelease",(()=>{n.params.autoplay.disableOnInteraction?D():O(!0,!0);})),r("beforeTransitionStart",((e,a,t)=>{!n.destroyed&&n.autoplay.running&&(t||!n.params.autoplay.disableOnInteraction?O(!0,!0):D());})),r("sliderFirstMove",(()=>{!n.destroyed&&n.autoplay.running&&(n.params.autoplay.disableOnInteraction?D():(u=!0,d=!1,c=!1,y=setTimeout((()=>{c=!0,d=!0,O(!0);}),200)));})),r("touchEnd",(()=>{if(!n.destroyed&&n.autoplay.running&&u){if(clearTimeout(y),clearTimeout(a),n.params.autoplay.disableOnInteraction)return d=!1,void(u=!1);d&&n.params.cssMode&&S(),d=!1,u=!1;}})),r("slideChange",(()=>{!n.destroyed&&n.autoplay.running&&(m=!0);})),Object.assign(n.autoplay,{start:L,stop:D,pause:O,resume:S});}

  function Thumb(e){let{swiper:s,extendParams:i,on:t}=e;i({thumbs:{swiper:null,multipleActiveThumbs:!0,autoScrollOffset:0,slideThumbActiveClass:"swiper-slide-thumb-active",thumbsContainerClass:"swiper-thumbs"}});let r=!1,a=!1;function l(){const e=s.thumbs.swiper;if(!e||e.destroyed)return;const i=e.clickedIndex,t=e.clickedSlide;if(t&&t.classList.contains(s.params.thumbs.slideThumbActiveClass))return;if(null==i)return;let r;r=e.params.loop?parseInt(e.clickedSlide.getAttribute("data-swiper-slide-index"),10):i,s.params.loop?s.slideToLoop(r):s.slideTo(r);}function n(){const{thumbs:e}=s.params;if(r)return !1;r=!0;const i=s.constructor;if(e.swiper instanceof i)s.thumbs.swiper=e.swiper,Object.assign(s.thumbs.swiper.originalParams,{watchSlidesProgress:!0,slideToClickedSlide:!1}),Object.assign(s.thumbs.swiper.params,{watchSlidesProgress:!0,slideToClickedSlide:!1}),s.thumbs.swiper.update();else if(isObject(e.swiper)){const t=Object.assign({},e.swiper);Object.assign(t,{watchSlidesProgress:!0,slideToClickedSlide:!1}),s.thumbs.swiper=new i(t),a=!0;}return s.thumbs.swiper.el.classList.add(s.params.thumbs.thumbsContainerClass),s.thumbs.swiper.on("tap",l),!0}function d(e){const i=s.thumbs.swiper;if(!i||i.destroyed)return;const t="auto"===i.params.slidesPerView?i.slidesPerViewDynamic():i.params.slidesPerView;let r=1;const a=s.params.thumbs.slideThumbActiveClass;if(s.params.slidesPerView>1&&!s.params.centeredSlides&&(r=s.params.slidesPerView),s.params.thumbs.multipleActiveThumbs||(r=1),r=Math.floor(r),i.slides.forEach((e=>e.classList.remove(a))),i.params.loop||i.params.virtual&&i.params.virtual.enabled)for(let e=0;e<r;e+=1)elementChildren(i.slidesEl,`[data-swiper-slide-index="${s.realIndex+e}"]`).forEach((e=>{e.classList.add(a);}));else for(let e=0;e<r;e+=1)i.slides[s.realIndex+e]&&i.slides[s.realIndex+e].classList.add(a);const l=s.params.thumbs.autoScrollOffset,n=l&&!i.params.loop;if(s.realIndex!==i.realIndex||n){const r=i.activeIndex;let a,d;if(i.params.loop){const e=i.slides.filter((e=>e.getAttribute("data-swiper-slide-index")===`${s.realIndex}`))[0];a=i.slides.indexOf(e),d=s.activeIndex>s.previousIndex?"next":"prev";}else a=s.realIndex,d=a>s.previousIndex?"next":"prev";n&&(a+="next"===d?l:-1*l),i.visibleSlidesIndexes&&i.visibleSlidesIndexes.indexOf(a)<0&&(i.params.centeredSlides?a=a>r?a-Math.floor(t/2)+1:a+Math.floor(t/2)-1:a>r&&i.params.slidesPerGroup,i.slideTo(a,e?0:void 0));}}s.thumbs={swiper:null},t("beforeInit",(()=>{const{thumbs:e}=s.params;if(e&&e.swiper)if("string"==typeof e.swiper||e.swiper instanceof HTMLElement){const i=getDocument(),t=()=>{const t="string"==typeof e.swiper?i.querySelector(e.swiper):e.swiper;if(t&&t.swiper)e.swiper=t.swiper,n(),d(!0);else if(t){const i=`${s.params.eventsPrefix}init`,r=a=>{e.swiper=a.detail[0],t.removeEventListener(i,r),n(),d(!0),e.swiper.update(),s.update();};t.addEventListener(i,r);}return t},r=()=>{if(s.destroyed)return;t()||requestAnimationFrame(r);};requestAnimationFrame(r);}else n(),d(!0);})),t("slideChange update resize observerUpdate",(()=>{d();})),t("setTransition",((e,i)=>{const t=s.thumbs.swiper;t&&!t.destroyed&&t.setTransition(i);})),t("beforeDestroy",(()=>{const e=s.thumbs.swiper;e&&!e.destroyed&&a&&e.destroy();})),Object.assign(s.thumbs,{init:n,update:d});}

  function freeMode(e){let{swiper:t,extendParams:o,emit:n,once:s}=e;o({freeMode:{enabled:!1,momentum:!0,momentumRatio:1,momentumBounce:!0,momentumBounceRatio:1,momentumVelocityRatio:1,sticky:!1,minimumVelocity:.02}}),Object.assign(t,{freeMode:{onTouchStart:function(){if(t.params.cssMode)return;const e=t.getTranslate();t.setTranslate(e),t.setTransition(0),t.touchEventsData.velocities.length=0,t.freeMode.onTouchEnd({currentPos:t.rtl?t.translate:-t.translate});},onTouchMove:function(){if(t.params.cssMode)return;const{touchEventsData:e,touches:o}=t;0===e.velocities.length&&e.velocities.push({position:o[t.isHorizontal()?"startX":"startY"],time:e.touchStartTime}),e.velocities.push({position:o[t.isHorizontal()?"currentX":"currentY"],time:now()});},onTouchEnd:function(e){let{currentPos:o}=e;if(t.params.cssMode)return;const{params:i,wrapperEl:a,rtlTranslate:r,snapGrid:l,touchEventsData:m}=t,c=now()-m.touchStartTime;if(o<-t.minTranslate())t.slideTo(t.activeIndex);else if(o>-t.maxTranslate())t.slides.length<l.length?t.slideTo(l.length-1):t.slideTo(t.slides.length-1);else {if(i.freeMode.momentum){if(m.velocities.length>1){const e=m.velocities.pop(),o=m.velocities.pop(),n=e.position-o.position,s=e.time-o.time;t.velocity=n/s,t.velocity/=2,Math.abs(t.velocity)<i.freeMode.minimumVelocity&&(t.velocity=0),(s>150||now()-e.time>300)&&(t.velocity=0);}else t.velocity=0;t.velocity*=i.freeMode.momentumVelocityRatio,m.velocities.length=0;let e=1e3*i.freeMode.momentumRatio;const o=t.velocity*e;let c=t.translate+o;r&&(c=-c);let d,u=!1;const f=20*Math.abs(t.velocity)*i.freeMode.momentumBounceRatio;let p;if(c<t.maxTranslate())i.freeMode.momentumBounce?(c+t.maxTranslate()<-f&&(c=t.maxTranslate()-f),d=t.maxTranslate(),u=!0,m.allowMomentumBounce=!0):c=t.maxTranslate(),i.loop&&i.centeredSlides&&(p=!0);else if(c>t.minTranslate())i.freeMode.momentumBounce?(c-t.minTranslate()>f&&(c=t.minTranslate()+f),d=t.minTranslate(),u=!0,m.allowMomentumBounce=!0):c=t.minTranslate(),i.loop&&i.centeredSlides&&(p=!0);else if(i.freeMode.sticky){let e;for(let t=0;t<l.length;t+=1)if(l[t]>-c){e=t;break}c=Math.abs(l[e]-c)<Math.abs(l[e-1]-c)||"next"===t.swipeDirection?l[e]:l[e-1],c=-c;}if(p&&s("transitionEnd",(()=>{t.loopFix();})),0!==t.velocity){if(e=r?Math.abs((-c-t.translate)/t.velocity):Math.abs((c-t.translate)/t.velocity),i.freeMode.sticky){const o=Math.abs((r?-c:c)-t.translate),n=t.slidesSizesGrid[t.activeIndex];e=o<n?i.speed:o<2*n?1.5*i.speed:2.5*i.speed;}}else if(i.freeMode.sticky)return void t.slideToClosest();i.freeMode.momentumBounce&&u?(t.updateProgress(d),t.setTransition(e),t.setTranslate(c),t.transitionStart(!0,t.swipeDirection),t.animating=!0,elementTransitionEnd(a,(()=>{t&&!t.destroyed&&m.allowMomentumBounce&&(n("momentumBounce"),t.setTransition(i.speed),setTimeout((()=>{t.setTranslate(d),elementTransitionEnd(a,(()=>{t&&!t.destroyed&&t.transitionEnd();}));}),0));}))):t.velocity?(n("_freeModeNoMomentumRelease"),t.updateProgress(c),t.setTransition(e),t.setTranslate(c),t.transitionStart(!0,t.swipeDirection),t.animating||(t.animating=!0,elementTransitionEnd(a,(()=>{t&&!t.destroyed&&t.transitionEnd();})))):t.updateProgress(c),t.updateActiveIndex(),t.updateSlidesClasses();}else {if(i.freeMode.sticky)return void t.slideToClosest();i.freeMode&&n("_freeModeNoMomentumRelease");}(!i.freeMode.momentum||c>=i.longSwipesMs)&&(n("_freeModeStaticRelease"),t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses());}}}});}

  function Grid(e){let i,r,a,t,{swiper:s,extendParams:l,on:o}=e;l({grid:{rows:1,fill:"column"}});const n=()=>{let e=s.params.spaceBetween;return "string"==typeof e&&e.indexOf("%")>=0?e=parseFloat(e.replace("%",""))/100*s.size:"string"==typeof e&&(e=parseFloat(e)),e};o("init",(()=>{t=s.params.grid&&s.params.grid.rows>1;})),o("update",(()=>{const{params:e,el:i}=s,r=e.grid&&e.grid.rows>1;t&&!r?(i.classList.remove(`${e.containerModifierClass}grid`,`${e.containerModifierClass}grid-column`),a=1,s.emitContainerClasses()):!t&&r&&(i.classList.add(`${e.containerModifierClass}grid`),"column"===e.grid.fill&&i.classList.add(`${e.containerModifierClass}grid-column`),s.emitContainerClasses()),t=r;})),s.grid={initSlides:e=>{const{slidesPerView:t}=s.params,{rows:l,fill:o}=s.params.grid,n=s.virtual&&s.params.virtual.enabled?s.virtual.slides.length:e.length;a=Math.floor(n/l),i=Math.floor(n/l)===n/l?n:Math.ceil(n/l)*l,"auto"!==t&&"row"===o&&(i=Math.max(i,t*l)),r=i/l;},unsetSlides:()=>{s.slides&&s.slides.forEach((e=>{e.swiperSlideGridSet&&(e.style.height="",e.style[s.getDirectionLabel("margin-top")]="");}));},updateSlide:(e,t,l)=>{const{slidesPerGroup:o}=s.params,d=n(),{rows:p,fill:c}=s.params.grid,g=s.virtual&&s.params.virtual.enabled?s.virtual.slides.length:l.length;let u,h,m;if("row"===c&&o>1){const r=Math.floor(e/(o*p)),a=e-p*o*r,s=0===r?o:Math.min(Math.ceil((g-r*p*o)/p),o);m=Math.floor(a/s),h=a-m*s+r*o,u=h+m*i/p,t.style.order=u;}else "column"===c?(h=Math.floor(e/p),m=e-h*p,(h>a||h===a&&m===p-1)&&(m+=1,m>=p&&(m=0,h+=1))):(m=Math.floor(e/r),h=e-m*r);t.row=m,t.column=h,t.style.height=`calc((100% - ${(p-1)*d}px) / ${p})`,t.style[s.getDirectionLabel("margin-top")]=0!==m?d&&`${d}px`:"",t.swiperSlideGridSet=!0;},updateWrapperSize:(e,r)=>{const{centeredSlides:a,roundLengths:t}=s.params,l=n(),{rows:o}=s.params.grid;if(s.virtualSize=(e+l)*i,s.virtualSize=Math.ceil(s.virtualSize/o)-l,s.params.cssMode||(s.wrapperEl.style[s.getDirectionLabel("width")]=`${s.virtualSize+l}px`),a){const e=[];for(let i=0;i<r.length;i+=1){let a=r[i];t&&(a=Math.floor(a)),r[i]<s.virtualSize+r[0]&&e.push(a);}r.splice(0,r.length),r.push(...e);}}};}

  function appendSlide(e){const l=this,{params:o,slidesEl:i}=l;o.loop&&l.loopDestroy();const t=e=>{if("string"==typeof e){const l=document.createElement("div");l.innerHTML=e,i.append(l.children[0]),l.innerHTML="";}else i.append(e);};if("object"==typeof e&&"length"in e)for(let l=0;l<e.length;l+=1)e[l]&&t(e[l]);else t(e);l.recalcSlides(),o.loop&&l.loopCreate(),o.observer&&!l.isElement||l.update();}function prependSlide(e){const l=this,{params:o,activeIndex:i,slidesEl:t}=l;o.loop&&l.loopDestroy();let n=i+1;const d=e=>{if("string"==typeof e){const l=document.createElement("div");l.innerHTML=e,t.prepend(l.children[0]),l.innerHTML="";}else t.prepend(e);};if("object"==typeof e&&"length"in e){for(let l=0;l<e.length;l+=1)e[l]&&d(e[l]);n=i+e.length;}else d(e);l.recalcSlides(),o.loop&&l.loopCreate(),o.observer&&!l.isElement||l.update(),l.slideTo(n,0,!1);}function addSlide(e,l){const o=this,{params:i,activeIndex:t,slidesEl:n}=o;let d=t;i.loop&&(d-=o.loopedSlides,o.loopDestroy(),o.recalcSlides());const s=o.slides.length;if(e<=0)return void o.prependSlide(l);if(e>=s)return void o.appendSlide(l);let p=d>e?d+1:d;const r=[];for(let l=s-1;l>=e;l-=1){const e=o.slides[l];e.remove(),r.unshift(e);}if("object"==typeof l&&"length"in l){for(let e=0;e<l.length;e+=1)l[e]&&n.append(l[e]);p=d>e?d+l.length:d;}else n.append(l);for(let e=0;e<r.length;e+=1)n.append(r[e]);o.recalcSlides(),i.loop&&o.loopCreate(),i.observer&&!o.isElement||o.update(),i.loop?o.slideTo(p+o.loopedSlides,0,!1):o.slideTo(p,0,!1);}function removeSlide(e){const l=this,{params:o,activeIndex:i}=l;let t=i;o.loop&&(t-=l.loopedSlides,l.loopDestroy());let n,d=t;if("object"==typeof e&&"length"in e){for(let o=0;o<e.length;o+=1)n=e[o],l.slides[n]&&l.slides[n].remove(),n<d&&(d-=1);d=Math.max(d,0);}else n=e,l.slides[n]&&l.slides[n].remove(),n<d&&(d-=1),d=Math.max(d,0);l.recalcSlides(),o.loop&&l.loopCreate(),o.observer&&!l.isElement||l.update(),o.loop?l.slideTo(d+l.loopedSlides,0,!1):l.slideTo(d,0,!1);}function removeAllSlides(){const e=this,l=[];for(let o=0;o<e.slides.length;o+=1)l.push(o);e.removeSlide(l);}function Manipulation(e){let{swiper:l}=e;Object.assign(l,{appendSlide:appendSlide.bind(l),prependSlide:prependSlide.bind(l),addSlide:addSlide.bind(l),removeSlide:removeSlide.bind(l),removeAllSlides:removeAllSlides.bind(l)});}

  function effectInit(e){const{effect:s,swiper:a,on:t,setTranslate:r,setTransition:i,overwriteParams:n,perspective:o,recreateShadows:f,getEffectParams:l}=e;let c;t("beforeInit",(()=>{if(a.params.effect!==s)return;a.classNames.push(`${a.params.containerModifierClass}${s}`),o&&o()&&a.classNames.push(`${a.params.containerModifierClass}3d`);const e=n?n():{};Object.assign(a.params,e),Object.assign(a.originalParams,e);})),t("setTranslate",(()=>{a.params.effect===s&&r();})),t("setTransition",((e,t)=>{a.params.effect===s&&i(t);})),t("transitionEnd",(()=>{if(a.params.effect===s&&f){if(!l||!l().slideShadows)return;a.slides.forEach((e=>{e.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((e=>e.remove()));})),f();}})),t("virtualUpdate",(()=>{a.params.effect===s&&(a.slides.length||(c=!0),requestAnimationFrame((()=>{c&&a.slides&&a.slides.length&&(r(),c=!1);})));}));}

  function effectTarget(e,i){const t=getSlideTransformEl(i);return t!==i&&(t.style.backfaceVisibility="hidden",t.style["-webkit-backface-visibility"]="hidden"),t}

  function effectVirtualTransitionEnd(e){let{swiper:t,duration:n,transformElements:r,allSlides:i}=e;const{activeIndex:a}=t;if(t.params.virtualTranslate&&0!==n){let e,n=!1;e=i?r:r.filter((e=>{const n=e.classList.contains("swiper-slide-transform")?(e=>{if(!e.parentElement)return t.slides.filter((t=>t.shadowRoot&&t.shadowRoot===e.parentNode))[0];return e.parentElement})(e):e;return t.getSlideIndex(n)===a})),e.forEach((e=>{elementTransitionEnd(e,(()=>{if(n)return;if(!t||t.destroyed)return;n=!0,t.animating=!1;const e=new window.CustomEvent("transitionend",{bubbles:!0,cancelable:!0});t.wrapperEl.dispatchEvent(e);}));}));}}

  function EffectFade(e){let{swiper:t,extendParams:s,on:a}=e;s({fadeEffect:{crossFade:!1}});effectInit({effect:"fade",swiper:t,on:a,setTranslate:()=>{const{slides:e}=t,s=t.params.fadeEffect;for(let a=0;a<e.length;a+=1){const e=t.slides[a];let r=-e.swiperSlideOffset;t.params.virtualTranslate||(r-=t.translate);let i=0;t.isHorizontal()||(i=r,r=0);const f=t.params.fadeEffect.crossFade?Math.max(1-Math.abs(e.progress),0):1+Math.min(Math.max(e.progress,-1),0),n=effectTarget(s,e);n.style.opacity=f,n.style.transform=`translate3d(${r}px, ${i}px, 0px)`;}},setTransition:e=>{const s=t.slides.map((e=>getSlideTransformEl(e)));s.forEach((t=>{t.style.transitionDuration=`${e}ms`;})),effectVirtualTransitionEnd({swiper:t,duration:e,transformElements:s,allSlides:!0});},overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!t.params.cssMode})});}

  function EffectCube(e){let{swiper:t,extendParams:s,on:a}=e;s({cubeEffect:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94}});const r=(e,t,s)=>{let a=s?e.querySelector(".swiper-slide-shadow-left"):e.querySelector(".swiper-slide-shadow-top"),r=s?e.querySelector(".swiper-slide-shadow-right"):e.querySelector(".swiper-slide-shadow-bottom");a||(a=createElement("div",("swiper-slide-shadow-cube swiper-slide-shadow-"+(s?"left":"top")).split(" ")),e.append(a)),r||(r=createElement("div",("swiper-slide-shadow-cube swiper-slide-shadow-"+(s?"right":"bottom")).split(" ")),e.append(r)),a&&(a.style.opacity=Math.max(-t,0)),r&&(r.style.opacity=Math.max(t,0));};effectInit({effect:"cube",swiper:t,on:a,setTranslate:()=>{const{el:e,wrapperEl:s,slides:a,width:o,height:i,rtlTranslate:l,size:d,browser:n}=t,p=getRotateFix(t),c=t.params.cubeEffect,w=t.isHorizontal(),h=t.virtual&&t.params.virtual.enabled;let f,m=0;c.shadow&&(w?(f=t.wrapperEl.querySelector(".swiper-cube-shadow"),f||(f=createElement("div","swiper-cube-shadow"),t.wrapperEl.append(f)),f.style.height=`${o}px`):(f=e.querySelector(".swiper-cube-shadow"),f||(f=createElement("div","swiper-cube-shadow"),e.append(f))));for(let e=0;e<a.length;e+=1){const t=a[e];let s=e;h&&(s=parseInt(t.getAttribute("data-swiper-slide-index"),10));let o=90*s,i=Math.floor(o/360);l&&(o=-o,i=Math.floor(-o/360));const n=Math.max(Math.min(t.progress,1),-1);let f=0,u=0,b=0;s%4==0?(f=4*-i*d,b=0):(s-1)%4==0?(f=0,b=4*-i*d):(s-2)%4==0?(f=d+4*i*d,b=d):(s-3)%4==0&&(f=-d,b=3*d+4*d*i),l&&(f=-f),w||(u=f,f=0);const x=`rotateX(${p(w?0:-o)}deg) rotateY(${p(w?o:0)}deg) translate3d(${f}px, ${u}px, ${b}px)`;n<=1&&n>-1&&(m=90*s+90*n,l&&(m=90*-s-90*n)),t.style.transform=x,c.slideShadows&&r(t,n,w);}if(s.style.transformOrigin=`50% 50% -${d/2}px`,s.style["-webkit-transform-origin"]=`50% 50% -${d/2}px`,c.shadow)if(w)f.style.transform=`translate3d(0px, ${o/2+c.shadowOffset}px, ${-o/2}px) rotateX(89.99deg) rotateZ(0deg) scale(${c.shadowScale})`;else {const e=Math.abs(m)-90*Math.floor(Math.abs(m)/90),t=1.5-(Math.sin(2*e*Math.PI/360)/2+Math.cos(2*e*Math.PI/360)/2),s=c.shadowScale,a=c.shadowScale/t,r=c.shadowOffset;f.style.transform=`scale3d(${s}, 1, ${a}) translate3d(0px, ${i/2+r}px, ${-i/2/a}px) rotateX(-89.99deg)`;}const u=(n.isSafari||n.isWebView)&&n.needPerspectiveFix?-d/2:0;s.style.transform=`translate3d(0px,0,${u}px) rotateX(${p(t.isHorizontal()?0:m)}deg) rotateY(${p(t.isHorizontal()?-m:0)}deg)`,s.style.setProperty("--swiper-cube-translate-z",`${u}px`);},setTransition:e=>{const{el:s,slides:a}=t;if(a.forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t=>{t.style.transitionDuration=`${e}ms`;}));})),t.params.cubeEffect.shadow&&!t.isHorizontal()){const t=s.querySelector(".swiper-cube-shadow");t&&(t.style.transitionDuration=`${e}ms`);}},recreateShadows:()=>{const e=t.isHorizontal();t.slides.forEach((t=>{const s=Math.max(Math.min(t.progress,1),-1);r(t,s,e);}));},getEffectParams:()=>t.params.cubeEffect,perspective:()=>!0,overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,resistanceRatio:0,spaceBetween:0,centeredSlides:!1,virtualTranslate:!0})});}

  function createShadow(e,t,r){const s=`swiper-slide-shadow${r?`-${r}`:""}${e?` swiper-slide-shadow-${e}`:""}`,a=getSlideTransformEl(t);let i=a.querySelector(`.${s.split(" ").join(".")}`);return i||(i=createElement("div",s.split(" ")),a.append(i)),i}

  function EffectFlip(e){let{swiper:t,extendParams:s,on:a}=e;s({flipEffect:{slideShadows:!0,limitRotation:!0}});const r=(e,s)=>{let a=t.isHorizontal()?e.querySelector(".swiper-slide-shadow-left"):e.querySelector(".swiper-slide-shadow-top"),r=t.isHorizontal()?e.querySelector(".swiper-slide-shadow-right"):e.querySelector(".swiper-slide-shadow-bottom");a||(a=createShadow("flip",e,t.isHorizontal()?"left":"top")),r||(r=createShadow("flip",e,t.isHorizontal()?"right":"bottom")),a&&(a.style.opacity=Math.max(-s,0)),r&&(r.style.opacity=Math.max(s,0));};effectInit({effect:"flip",swiper:t,on:a,setTranslate:()=>{const{slides:e,rtlTranslate:s}=t,a=t.params.flipEffect,i=getRotateFix(t);for(let o=0;o<e.length;o+=1){const l=e[o];let f=l.progress;t.params.flipEffect.limitRotation&&(f=Math.max(Math.min(l.progress,1),-1));const n=l.swiperSlideOffset;let p=-180*f,d=0,m=t.params.cssMode?-n-t.translate:-n,c=0;t.isHorizontal()?s&&(p=-p):(c=m,m=0,d=-p,p=0),l.style.zIndex=-Math.abs(Math.round(f))+e.length,a.slideShadows&&r(l,f);const h=`translate3d(${m}px, ${c}px, 0px) rotateX(${i(d)}deg) rotateY(${i(p)}deg)`;effectTarget(a,l).style.transform=h;}},setTransition:e=>{const s=t.slides.map((e=>getSlideTransformEl(e)));s.forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t=>{t.style.transitionDuration=`${e}ms`;}));})),effectVirtualTransitionEnd({swiper:t,duration:e,transformElements:s});},recreateShadows:()=>{t.params.flipEffect,t.slides.forEach((e=>{let s=e.progress;t.params.flipEffect.limitRotation&&(s=Math.max(Math.min(e.progress,1),-1)),r(e,s);}));},getEffectParams:()=>t.params.flipEffect,perspective:()=>!0,overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!t.params.cssMode})});}

  function EffectCoverflow(e){let{swiper:t,extendParams:s,on:r}=e;s({coverflowEffect:{rotate:50,stretch:0,depth:100,scale:1,modifier:1,slideShadows:!0}});effectInit({effect:"coverflow",swiper:t,on:r,setTranslate:()=>{const{width:e,height:s,slides:r,slidesSizesGrid:o}=t,a=t.params.coverflowEffect,i=t.isHorizontal(),l=t.translate,f=i?e/2-l:s/2-l,d=i?a.rotate:-a.rotate,c=a.depth,h=getRotateFix(t);for(let e=0,t=r.length;e<t;e+=1){const t=r[e],s=o[e],l=(f-t.swiperSlideOffset-s/2)/s,n="function"==typeof a.modifier?a.modifier(l):l*a.modifier;let w=i?d*n:0,p=i?0:d*n,m=-c*Math.abs(n),g=a.stretch;"string"==typeof g&&-1!==g.indexOf("%")&&(g=parseFloat(a.stretch)/100*s);let y=i?0:g*n,S=i?g*n:0,b=1-(1-a.scale)*Math.abs(n);Math.abs(S)<.001&&(S=0),Math.abs(y)<.001&&(y=0),Math.abs(m)<.001&&(m=0),Math.abs(w)<.001&&(w=0),Math.abs(p)<.001&&(p=0),Math.abs(b)<.001&&(b=0);const u=`translate3d(${S}px,${y}px,${m}px)  rotateX(${h(p)}deg) rotateY(${h(w)}deg) scale(${b})`;if(effectTarget(a,t).style.transform=u,t.style.zIndex=1-Math.abs(Math.round(n)),a.slideShadows){let e=i?t.querySelector(".swiper-slide-shadow-left"):t.querySelector(".swiper-slide-shadow-top"),s=i?t.querySelector(".swiper-slide-shadow-right"):t.querySelector(".swiper-slide-shadow-bottom");e||(e=createShadow("coverflow",t,i?"left":"top")),s||(s=createShadow("coverflow",t,i?"right":"bottom")),e&&(e.style.opacity=n>0?n:0),s&&(s.style.opacity=-n>0?-n:0);}}},setTransition:e=>{t.slides.map((e=>getSlideTransformEl(e))).forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").forEach((t=>{t.style.transitionDuration=`${e}ms`;}));}));},perspective:()=>!0,overwriteParams:()=>({watchSlidesProgress:!0})});}

  function EffectCreative(e){let{swiper:t,extendParams:s,on:r}=e;s({creativeEffect:{limitProgress:1,shadowPerProgress:!1,progressMultiplier:1,perspective:!0,prev:{translate:[0,0,0],rotate:[0,0,0],opacity:1,scale:1},next:{translate:[0,0,0],rotate:[0,0,0],opacity:1,scale:1}}});const a=e=>"string"==typeof e?e:`${e}px`;effectInit({effect:"creative",swiper:t,on:r,setTranslate:()=>{const{slides:e,wrapperEl:s,slidesSizesGrid:r}=t,i=t.params.creativeEffect,{progressMultiplier:o}=i,l=t.params.centeredSlides,n=getRotateFix(t);if(l){const e=r[0]/2-t.params.slidesOffsetBefore||0;s.style.transform=`translateX(calc(50% - ${e}px))`;}for(let s=0;s<e.length;s+=1){const r=e[s],c=r.progress,f=Math.min(Math.max(r.progress,-i.limitProgress),i.limitProgress);let m=f;l||(m=Math.min(Math.max(r.originalProgress,-i.limitProgress),i.limitProgress));const p=r.swiperSlideOffset,d=[t.params.cssMode?-p-t.translate:-p,0,0],g=[0,0,0];let h=!1;t.isHorizontal()||(d[1]=d[0],d[0]=0);let w={translate:[0,0,0],rotate:[0,0,0],scale:1,opacity:1};f<0?(w=i.next,h=!0):f>0&&(w=i.prev,h=!0),d.forEach(((e,t)=>{d[t]=`calc(${e}px + (${a(w.translate[t])} * ${Math.abs(f*o)}))`;})),g.forEach(((e,t)=>{let s=w.rotate[t]*Math.abs(f*o);g[t]=s;})),r.style.zIndex=-Math.abs(Math.round(c))+e.length;const y=d.join(", "),u=`rotateX(${n(g[0])}deg) rotateY(${n(g[1])}deg) rotateZ(${n(g[2])}deg)`,v=m<0?`scale(${1+(1-w.scale)*m*o})`:`scale(${1-(1-w.scale)*m*o})`,E=m<0?1+(1-w.opacity)*m*o:1-(1-w.opacity)*m*o,M=`translate3d(${y}) ${u} ${v}`;if(h&&w.shadow||!h){let e=r.querySelector(".swiper-slide-shadow");if(!e&&w.shadow&&(e=createShadow("creative",r)),e){const t=i.shadowPerProgress?f*(1/i.limitProgress):f;e.style.opacity=Math.min(Math.max(Math.abs(t),0),1);}}const $=effectTarget(i,r);$.style.transform=M,$.style.opacity=E,w.origin&&($.style.transformOrigin=w.origin);}},setTransition:e=>{const s=t.slides.map((e=>getSlideTransformEl(e)));s.forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow").forEach((t=>{t.style.transitionDuration=`${e}ms`;}));})),effectVirtualTransitionEnd({swiper:t,duration:e,transformElements:s,allSlides:!0});},perspective:()=>t.params.creativeEffect.perspective,overwriteParams:()=>({watchSlidesProgress:!0,virtualTranslate:!t.params.cssMode})});}

  function EffectCards(e){let{swiper:t,extendParams:a,on:s}=e;a({cardsEffect:{slideShadows:!0,rotate:!0,perSlideRotate:2,perSlideOffset:8}});effectInit({effect:"cards",swiper:t,on:s,setTranslate:()=>{const{slides:e,activeIndex:a,rtlTranslate:s}=t,r=t.params.cardsEffect,{startTranslate:i,isTouched:n}=t.touchEventsData,o=s?-t.translate:t.translate;for(let l=0;l<e.length;l+=1){const d=e[l],f=d.progress,c=Math.min(Math.max(f,-4),4);let m=d.swiperSlideOffset;t.params.centeredSlides&&!t.params.cssMode&&(t.wrapperEl.style.transform=`translateX(${t.minTranslate()}px)`),t.params.centeredSlides&&t.params.cssMode&&(m-=e[0].swiperSlideOffset);let p=t.params.cssMode?-m-t.translate:-m,h=0;const M=-100*Math.abs(c);let u=1,w=-r.perSlideRotate*c,S=r.perSlideOffset-.75*Math.abs(c);const $=t.virtual&&t.params.virtual.enabled?t.virtual.from+l:l,E=($===a||$===a-1)&&c>0&&c<1&&(n||t.params.cssMode)&&o<i,T=($===a||$===a+1)&&c<0&&c>-1&&(n||t.params.cssMode)&&o>i;if(E||T){const e=(1-Math.abs((Math.abs(c)-.5)/.5))**.5;w+=-28*c*e,u+=-.5*e,S+=96*e,h=-25*e*Math.abs(c)+"%";}if(p=c<0?`calc(${p}px ${s?"-":"+"} (${S*Math.abs(c)}%))`:c>0?`calc(${p}px ${s?"-":"+"} (-${S*Math.abs(c)}%))`:`${p}px`,!t.isHorizontal()){const e=h;h=p,p=e;}const g=c<0?""+(1+(1-u)*c):""+(1-(1-u)*c),x=`\n        translate3d(${p}, ${h}, ${M}px)\n        rotateZ(${r.rotate?s?-w:w:0}deg)\n        scale(${g})\n      `;if(r.slideShadows){let e=d.querySelector(".swiper-slide-shadow");e||(e=createShadow("cards",d)),e&&(e.style.opacity=Math.min(Math.max((Math.abs(c)-.5)/.5,0),1));}d.style.zIndex=-Math.abs(Math.round(f))+e.length;effectTarget(r,d).style.transform=x;}},setTransition:e=>{const a=t.slides.map((e=>getSlideTransformEl(e)));a.forEach((t=>{t.style.transitionDuration=`${e}ms`,t.querySelectorAll(".swiper-slide-shadow").forEach((t=>{t.style.transitionDuration=`${e}ms`;}));})),effectVirtualTransitionEnd({swiper:t,duration:e,transformElements:a});},perspective:()=>!0,overwriteParams:()=>({watchSlidesProgress:!0,virtualTranslate:!t.params.cssMode})});}

  /**
   * Swiper 11.1.14
   * Most modern mobile touch slider and framework with hardware accelerated transitions
   * https://swiperjs.com
   *
   * Copyright 2014-2024 Vladimir Kharlampidi
   *
   * Released under the MIT License
   *
   * Released on: September 12, 2024
   */

  const modules=[Virtual,Keyboard,Mousewheel,Navigation,Pagination,Scrollbar,Parallax,Zoom,Controller,A11y,History,HashNavigation,Autoplay,Thumb,freeMode,Grid,Manipulation,EffectFade,EffectCube,EffectFlip,EffectCoverflow,EffectCreative,EffectCards];Swiper.use(modules);

})();
//# sourceMappingURL=vendor.js.map
