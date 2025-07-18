import * as React from 'react';

// This should line up with NoEventPriority from react-reconciler/src/ReactEventPriorities
// but we can't depend on the react-reconciler from this isomorphic code.
var NoEventPriority = 0;
function noop() {}
function requestFormReset$1(element) {
  throw new Error('Invalid form element. requestFormReset must be passed a form that was ' + 'rendered by React.');
}
var DefaultDispatcher = {
  f /* flushSyncWork */: noop,
  r /* requestFormReset */: requestFormReset$1,
  D /* prefetchDNS */: noop,
  C /* preconnect */: noop,
  L /* preload */: noop,
  m /* preloadModule */: noop,
  X /* preinitScript */: noop,
  S /* preinitStyle */: noop,
  M /* preinitModuleScript */: noop
};
var Internals = {
  d /* ReactDOMCurrentDispatcher */: DefaultDispatcher,
  p /* currentUpdatePriority */: NoEventPriority,
  findDOMNode: null
};

var ReactVersion = '19.1.0-experimental-bd8cd8af-20250717';

// -----------------------------------------------------------------------------
// Land or remove (zero effort)
//
// Flags that can likely be deleted or landed without consequences
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// Chopping Block
//
// Planned feature deprecations and breaking changes. Sorted roughly in order of
// when we plan to enable them.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// React DOM Chopping Block
//
// Similar to main Chopping Block but only flags related to React DOM. These are
// grouped because we will likely batch all of them into a single major release.
// -----------------------------------------------------------------------------

// Disable support for comment nodes as React DOM containers. Already disabled
// in open source, but www codebase still relies on it. Need to remove.
var disableCommentsAsDOMContainers = true;

/**
 * HTML nodeType values that represent the type of the node
 */

var ELEMENT_NODE = 1;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;

function isValidContainer(node) {
  return !!(node && (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE || !disableCommentsAsDOMContainers  ));
}

var REACT_PORTAL_TYPE = Symbol.for('react.portal');

/*
 * The `'' + value` pattern (used in perf-sensitive code) throws for Symbol
 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
 *
 * The functions in this module will throw an easier-to-understand,
 * easier-to-debug exception with a clear errors message message explaining the
 * problem. (Instead of a confusing exception thrown inside the implementation
 * of the `value` object).
 */

// $FlowFixMe[incompatible-return] only called in DEV, so void return is not possible.
function typeName(value) {
  {
    // toStringTag is needed for namespaced types like Temporal.Instant
    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
    // $FlowFixMe[incompatible-return]
    return type;
  }
}

// $FlowFixMe[incompatible-return] only called in DEV, so void return is not possible.
function willCoercionThrow(value) {
  {
    try {
      testStringCoercion(value);
      return false;
    } catch (e) {
      return true;
    }
  }
}

/** @noinline */
function testStringCoercion(value) {
  // If you ended up here by following an exception call stack, here's what's
  // happened: you supplied an object or symbol value to React (as a prop, key,
  // DOM attribute, CSS property, string ref, etc.) and when React tried to
  // coerce it to a string using `'' + value`, an exception was thrown.
  //
  // The most common types that will cause this exception are `Symbol` instances
  // and Temporal objects like `Temporal.Instant`. But any object that has a
  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
  // exception. (Library authors do this to prevent users from using built-in
  // numeric operators like `+` or comparison operators like `>=` because custom
  // methods are needed to perform accurate arithmetic or comparison.)
  //
  // To fix the problem, coerce this object or symbol value to a string before
  // passing it to React. The most reliable way is usually `String(value)`.
  //
  // To find which value is throwing, check the browser or debugger console.
  // Before this exception was thrown, there should be `console.error` output
  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
  // problem and how that type was used: key, atrribute, input value prop, etc.
  // In most cases, this console output also shows the component and its
  // ancestor components where the exception happened.
  //
  // eslint-disable-next-line react-internal/safe-string-coercion
  return '' + value;
}
function checkKeyStringCoercion(value) {
  {
    if (willCoercionThrow(value)) {
      console.error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before using it here.', typeName(value));
      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
    }
  }
}

function createPortal$1(children, containerInfo,
// TODO: figure out the API for cross-renderer implementation.
implementation) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  {
    checkKeyStringCoercion(key);
  }
  return {
    // This tag allow us to uniquely identify this as a React Portal
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children: children,
    containerInfo: containerInfo,
    implementation: implementation
  };
}

// TODO: Ideally these types would be opaque but that doesn't work well with
// our reconciler fork infra, since these leak into non-reconciler packages.

var SyncLane = /*                        */2;

var DiscreteEventPriority = SyncLane;

var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

function flushSyncImpl(fn) {
  var previousTransition = ReactSharedInternals.T;
  var previousUpdatePriority = Internals.p; /* ReactDOMCurrentUpdatePriority */

  try {
    ReactSharedInternals.T = null;
    Internals.p /* ReactDOMCurrentUpdatePriority */ = DiscreteEventPriority;
    if (fn) {
      return fn();
    } else {
      return undefined;
    }
  } finally {
    ReactSharedInternals.T = previousTransition;
    Internals.p /* ReactDOMCurrentUpdatePriority */ = previousUpdatePriority;
    var wasInRender = Internals.d /* ReactDOMCurrentDispatcher */.f(); /* flushSyncWork */
    {
      if (wasInRender) {
        console.error('flushSync was called from inside a lifecycle method. React cannot ' + 'flush when React is already rendering. Consider moving this call to ' + 'a scheduler task or micro task.');
      }
    }
  }
}
var flushSync = flushSyncImpl ;

function getCrossOriginString(input) {
  if (typeof input === 'string') {
    return input === 'use-credentials' ? input : '';
  }
  return undefined;
}
function getCrossOriginStringAs(as, input) {
  if (as === 'font') {
    return '';
  }
  if (typeof input === 'string') {
    return input === 'use-credentials' ? input : '';
  }
  return undefined;
}

function prefetchDNS(href) {
  {
    if (typeof href !== 'string' || !href) {
      console.error('ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.', getValueDescriptorExpectingObjectForWarning(href));
    } else if (arguments.length > 1) {
      var options = arguments[1];
      if (typeof options === 'object' && options.hasOwnProperty('crossOrigin')) {
        console.error('ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.', getValueDescriptorExpectingEnumForWarning(options));
      } else {
        console.error('ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.', getValueDescriptorExpectingEnumForWarning(options));
      }
    }
  }
  if (typeof href === 'string') {
    Internals.d /* ReactDOMCurrentDispatcher */.D( /* prefetchDNS */href);
  }
  // We don't error because preconnect needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.
}
function preconnect(href, options) {
  {
    if (typeof href !== 'string' || !href) {
      console.error('ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.', getValueDescriptorExpectingObjectForWarning(href));
    } else if (options != null && typeof options !== 'object') {
      console.error('ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.', getValueDescriptorExpectingEnumForWarning(options));
    } else if (options != null && typeof options.crossOrigin !== 'string') {
      console.error('ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.', getValueDescriptorExpectingObjectForWarning(options.crossOrigin));
    }
  }
  if (typeof href === 'string') {
    var crossOrigin = options ? getCrossOriginString(options.crossOrigin) : null;
    Internals.d /* ReactDOMCurrentDispatcher */.C( /* preconnect */href, crossOrigin);
  }
  // We don't error because preconnect needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.
}
function preload(href, options) {
  {
    var encountered = '';
    if (typeof href !== 'string' || !href) {
      encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".";
    }
    if (options == null || typeof options !== 'object') {
      encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + ".";
    } else if (typeof options.as !== 'string' || !options.as) {
      encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".";
    }
    if (encountered) {
      console.error('ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel="preload" as="..." />` tag.%s', encountered);
    }
  }
  if (typeof href === 'string' &&
  // We check existence because we cannot enforce this function is actually called with the stated type
  typeof options === 'object' && options !== null && typeof options.as === 'string') {
    var as = options.as;
    var crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
    Internals.d /* ReactDOMCurrentDispatcher */.L( /* preload */href, as, {
      crossOrigin: crossOrigin,
      integrity: typeof options.integrity === 'string' ? options.integrity : undefined,
      nonce: typeof options.nonce === 'string' ? options.nonce : undefined,
      type: typeof options.type === 'string' ? options.type : undefined,
      fetchPriority: typeof options.fetchPriority === 'string' ? options.fetchPriority : undefined,
      referrerPolicy: typeof options.referrerPolicy === 'string' ? options.referrerPolicy : undefined,
      imageSrcSet: typeof options.imageSrcSet === 'string' ? options.imageSrcSet : undefined,
      imageSizes: typeof options.imageSizes === 'string' ? options.imageSizes : undefined,
      media: typeof options.media === 'string' ? options.media : undefined
    });
  }
  // We don't error because preload needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.
}
function preloadModule(href, options) {
  {
    var encountered = '';
    if (typeof href !== 'string' || !href) {
      encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".";
    }
    if (options !== undefined && typeof options !== 'object') {
      encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + ".";
    } else if (options && 'as' in options && typeof options.as !== 'string') {
      encountered += " The `as` option encountered was " + getValueDescriptorExpectingObjectForWarning(options.as) + ".";
    }
    if (encountered) {
      console.error('ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel="modulepreload" as="..." />` tag.%s', encountered);
    }
  }
  if (typeof href === 'string') {
    if (options) {
      var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
      Internals.d /* ReactDOMCurrentDispatcher */.m( /* preloadModule */href, {
        as: typeof options.as === 'string' && options.as !== 'script' ? options.as : undefined,
        crossOrigin: crossOrigin,
        integrity: typeof options.integrity === 'string' ? options.integrity : undefined
      });
    } else {
      Internals.d /* ReactDOMCurrentDispatcher */.m( /* preloadModule */href);
    }
  }
  // We don't error because preload needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.
}
function preinit(href, options) {
  {
    if (typeof href !== 'string' || !href) {
      console.error('ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.', getValueDescriptorExpectingObjectForWarning(href));
    } else if (options == null || typeof options !== 'object') {
      console.error('ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.', getValueDescriptorExpectingEnumForWarning(options));
    } else if (options.as !== 'style' && options.as !== 'script') {
      console.error('ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are "style" and "script".', getValueDescriptorExpectingEnumForWarning(options.as));
    }
  }
  if (typeof href === 'string' && options && typeof options.as === 'string') {
    var as = options.as;
    var crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
    var integrity = typeof options.integrity === 'string' ? options.integrity : undefined;
    var fetchPriority = typeof options.fetchPriority === 'string' ? options.fetchPriority : undefined;
    if (as === 'style') {
      Internals.d /* ReactDOMCurrentDispatcher */.S( /* preinitStyle */
      href, typeof options.precedence === 'string' ? options.precedence : undefined, {
        crossOrigin: crossOrigin,
        integrity: integrity,
        fetchPriority: fetchPriority
      });
    } else if (as === 'script') {
      Internals.d /* ReactDOMCurrentDispatcher */.X( /* preinitScript */href, {
        crossOrigin: crossOrigin,
        integrity: integrity,
        fetchPriority: fetchPriority,
        nonce: typeof options.nonce === 'string' ? options.nonce : undefined
      });
    }
  }
  // We don't error because preinit needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.
}
function preinitModule(href, options) {
  {
    var encountered = '';
    if (typeof href !== 'string' || !href) {
      encountered += " The `href` argument encountered was " + getValueDescriptorExpectingObjectForWarning(href) + ".";
    }
    if (options !== undefined && typeof options !== 'object') {
      encountered += " The `options` argument encountered was " + getValueDescriptorExpectingObjectForWarning(options) + ".";
    } else if (options && 'as' in options && options.as !== 'script') {
      encountered += " The `as` option encountered was " + getValueDescriptorExpectingEnumForWarning(options.as) + ".";
    }
    if (encountered) {
      console.error('ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s', encountered);
    } else {
      var as = options && typeof options.as === 'string' ? options.as : 'script';
      switch (as) {
        case 'script':
          {
            break;
          }

        // We have an invalid as type and need to warn
        default:
          {
            var typeOfAs = getValueDescriptorExpectingEnumForWarning(as);
            console.error('ReactDOM.preinitModule(): Currently the only supported "as" type for this function is "script"' + ' but received "%s" instead. This warning was generated for `href` "%s". In the future other' + ' module types will be supported, aligning with the import-attributes proposal. Learn more here:' + ' (https://github.com/tc39/proposal-import-attributes)', typeOfAs, href);
          }
      }
    }
  }
  if (typeof href === 'string') {
    if (typeof options === 'object' && options !== null) {
      if (options.as == null || options.as === 'script') {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d /* ReactDOMCurrentDispatcher */.M( /* preinitModuleScript */href, {
          crossOrigin: crossOrigin,
          integrity: typeof options.integrity === 'string' ? options.integrity : undefined,
          nonce: typeof options.nonce === 'string' ? options.nonce : undefined
        });
      }
    } else if (options == null) {
      Internals.d /* ReactDOMCurrentDispatcher */.M( /* preinitModuleScript */href);
    }
  }
  // We don't error because preinit needs to be resilient to being called in a variety of scopes
  // and the runtime may not be capable of responding. The function is optimistic and not critical
  // so we favor silent bailout over warning or erroring.
}
function getValueDescriptorExpectingObjectForWarning(thing) {
  return thing === null ? '`null`' : thing === undefined ? '`undefined`' : thing === '' ? 'an empty string' : "something with type \"" + typeof thing + "\"";
}
function getValueDescriptorExpectingEnumForWarning(thing) {
  return thing === null ? '`null`' : thing === undefined ? '`undefined`' : thing === '' ? 'an empty string' : typeof thing === 'string' ? JSON.stringify(thing) : typeof thing === 'number' ? '`' + thing + '`' : "something with type \"" + typeof thing + "\"";
}

function resolveDispatcher() {
  // Copied from react/src/ReactHooks.js. It's the same thing but in a
  // different package.
  var dispatcher = ReactSharedInternals.H;
  {
    if (dispatcher === null) {
      console.error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.');
    }
  }
  // Will result in a null access error if accessed outside render phase. We
  // intentionally don't throw our own error because this is in a hot path.
  // Also helps ensure this is inlined.
  return dispatcher;
}
function useFormStatus() {
  var dispatcher = resolveDispatcher();
  return dispatcher.useHostTransitionStatus();
}
function useFormState(action, initialState, permalink) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useFormState(action, initialState, permalink);
}
function requestFormReset(form) {
  Internals.d /* ReactDOMCurrentDispatcher */.r( /* requestFormReset */form);
}

{
  if (typeof Map !== 'function' ||
  // $FlowFixMe[prop-missing] Flow incorrectly thinks Map has no prototype
  Map.prototype == null || typeof Map.prototype.forEach !== 'function' || typeof Set !== 'function' ||
  // $FlowFixMe[prop-missing] Flow incorrectly thinks Set has no prototype
  Set.prototype == null || typeof Set.prototype.clear !== 'function' || typeof Set.prototype.forEach !== 'function') {
    console.error('React depends on Map and Set built-in types. Make sure that you load a ' + 'polyfill in older browsers. https://reactjs.org/link/react-polyfills');
  }
}
function batchedUpdates(fn, a) {
  // batchedUpdates is now just a passthrough noop
  return fn(a);
}
function createPortal(children, container) {
  var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (!isValidContainer(container)) {
    throw new Error('Target container is not a DOM element.');
  }

  // TODO: pass ReactDOM portal implementation as third argument
  // $FlowFixMe[incompatible-return] The Flow type is opaque but there's no way to actually create it.
  return createPortal$1(children, container, null, key);
}

export { Internals as __DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, createPortal, flushSync, preconnect, prefetchDNS, preinit, preinitModule, preload, preloadModule, requestFormReset, batchedUpdates as unstable_batchedUpdates, useFormState, useFormStatus, ReactVersion as version };
//# sourceMappingURL=react-dom.development.js.map
