var ReactVersion = '19.1.0-experimental-bd8cd8af-20250717';

// -----------------------------------------------------------------------------
// Land or remove (zero effort)
//
// Flags that can likely be deleted or landed without consequences
// -----------------------------------------------------------------------------


// Disables legacy mode
// This allows us to land breaking changes to remove legacy mode APIs in experimental builds
// before removing them in stable in the next Major
var disableLegacyMode = true;
var ownerStackLimit = 1e4;

var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element') ;
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_PROVIDER_TYPE = Symbol.for('react.provider'); // TODO: Delete with enableRenderableContext
var REACT_CONSUMER_TYPE = Symbol.for('react.consumer');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_ACTIVITY_TYPE = Symbol.for('react.activity');
var REACT_POSTPONE_TYPE = Symbol.for('react.postpone');
var REACT_VIEW_TRANSITION_TYPE = Symbol.for('react.view_transition');
var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }
  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }
  return null;
}

var didWarnStateUpdateForUnmountedComponent = {};
function warnNoop(publicInstance, callerName) {
  {
    var _constructor = publicInstance.constructor;
    var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
    var warningKey = componentName + "." + callerName;
    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
      return;
    }
    console.error("Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);
    didWarnStateUpdateForUnmountedComponent[warningKey] = true;
  }
}

/**
 * This is the abstract API for an update queue.
 */
var ReactNoopUpdateQueue = {
  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function (publicInstance) {
    return false;
  },
  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueForceUpdate: function (publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate');
  },
  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
    warnNoop(publicInstance, 'replaceState');
  },
  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} Name of the calling function in the public API.
   * @internal
   */
  enqueueSetState: function (publicInstance, partialState, callback, callerName) {
    warnNoop(publicInstance, 'setState');
  }
};

var assign = Object.assign;

var emptyObject = {};
{
  Object.freeze(emptyObject);
}

/**
 * Base class helpers for the updating state of a component.
 */
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}
Component.prototype.isReactComponent = {};

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 *
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
Component.prototype.setState = function (partialState, callback) {
  if (typeof partialState !== 'object' && typeof partialState !== 'function' && partialState != null) {
    throw new Error('takes an object of state variables to update or a ' + 'function which returns an object of state variables.');
  }
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
{
  var deprecatedAPIs = {
    isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
    replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
  };
  var defineDeprecationWarning = function (methodName, info) {
    Object.defineProperty(Component.prototype, methodName, {
      get: function () {
        console.warn('%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);
        return undefined;
      }
    });
  };
  for (var fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    }
  }
}
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

/**
 * Convenience component with default shallow equality check for sCU.
 */
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

// an immutable object with a single mutable value
function createRef() {
  var refObject = {
    current: null
  };
  {
    Object.seal(refObject);
  }
  return refObject;
}

var isArrayImpl = Array.isArray;
function isArray(a) {
  return isArrayImpl(a);
}

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

// Keep in sync with react-reconciler/getComponentNameFromFiber
function getWrappedName(outerType, innerType, wrapperName) {
  var displayName = outerType.displayName;
  if (displayName) {
    return displayName;
  }
  var functionName = innerType.displayName || innerType.name || '';
  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
}

// Keep in sync with react-reconciler/getComponentNameFromFiber
function getContextName(type) {
  return type.displayName || 'Context';
}
var REACT_CLIENT_REFERENCE = Symbol.for('react.client.reference');

// Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.
function getComponentNameFromType(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }
  if (typeof type === 'function') {
    if (type.$$typeof === REACT_CLIENT_REFERENCE) {
      // TODO: Create a convention for naming client references with debug info.
      return null;
    }
    return type.displayName || type.name || null;
  }
  if (typeof type === 'string') {
    return type;
  }
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';
    case REACT_PROFILER_TYPE:
      return 'Profiler';
    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';
    case REACT_SUSPENSE_TYPE:
      return 'Suspense';
    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';
    case REACT_ACTIVITY_TYPE:
      return 'Activity';
    case REACT_VIEW_TRANSITION_TYPE:
      {
        return 'ViewTransition';
      }
  }
  if (typeof type === 'object') {
    {
      if (typeof type.tag === 'number') {
        console.error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
      }
    }
    switch (type.$$typeof) {
      case REACT_PORTAL_TYPE:
        return 'Portal';
      case REACT_PROVIDER_TYPE:
        {
          return null;
        }
      case REACT_CONTEXT_TYPE:
        var context = type;
        {
          return getContextName(context) + '.Provider';
        }
      case REACT_CONSUMER_TYPE:
        {
          var consumer = type;
          return getContextName(consumer._context) + '.Consumer';
        }
      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');
      case REACT_MEMO_TYPE:
        var outerName = type.displayName || null;
        if (outerName !== null) {
          return outerName;
        }
        return getComponentNameFromType(type.type) || 'Memo';
      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;
          try {
            return getComponentNameFromType(init(payload));
          } catch (x) {
            return null;
          }
        }
    }
  }
  return null;
}

var ReactSharedInternals = {
  H: null,
  A: null,
  T: null,
  S: null,
  V: null
};
{
  ReactSharedInternals.actQueue = null;
  ReactSharedInternals.isBatchingLegacy = false;
  ReactSharedInternals.didScheduleLegacyUpdate = false;
  ReactSharedInternals.didUsePromise = false;
  ReactSharedInternals.thrownErrors = [];
  // Stack implementation injected by the current renderer.
  ReactSharedInternals.getCurrentStack = null;
  ReactSharedInternals.recentlyCreatedOwnerStacks = 0;
}

// $FlowFixMe[method-unbinding]
var hasOwnProperty = Object.prototype.hasOwnProperty;

var createTask =
// eslint-disable-next-line react-internal/no-production-logging
console.createTask ?
// eslint-disable-next-line react-internal/no-production-logging
console.createTask : function () {
  return null;
};
function getTaskName(type) {
  if (type === REACT_FRAGMENT_TYPE) {
    return '<>';
  }
  if (typeof type === 'object' && type !== null && type.$$typeof === REACT_LAZY_TYPE) {
    // We don't want to eagerly initialize the initializer in DEV mode so we can't
    // call it to extract the type so we don't know the type of this component.
    return '<...>';
  }
  try {
    var name = getComponentNameFromType(type);
    return name ? '<' + name + '>' : '<...>';
  } catch (x) {
    return '<...>';
  }
}
function getOwner() {
  {
    var dispatcher = ReactSharedInternals.A;
    if (dispatcher === null) {
      return null;
    }
    return dispatcher.getOwner();
  }
}

/** @noinline */
function UnknownOwner() {
  /** @noinline */
  return function () {
    return Error('react-stack-top-frame');
  }();
}
var createFakeCallStack = {
  'react-stack-bottom-frame': function (callStackForError) {
    return callStackForError();
  }
};
var specialPropKeyWarningShown;
var didWarnAboutElementRef;
var didWarnAboutOldJSXRuntime;
var unknownOwnerDebugStack;
var unknownOwnerDebugTask;
{
  didWarnAboutElementRef = {};

  // We use this technique to trick minifiers to preserve the function name.
  unknownOwnerDebugStack = createFakeCallStack['react-stack-bottom-frame'].bind(createFakeCallStack, UnknownOwner)();
  unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
}
function hasValidRef(config) {
  {
    if (hasOwnProperty.call(config, 'ref')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.ref !== undefined;
}
function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.key !== undefined;
}
function defineKeyPropWarningGetter(props, displayName) {
  {
    var warnAboutAccessingKey = function () {
      if (!specialPropKeyWarningShown) {
        specialPropKeyWarningShown = true;
        console.error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://react.dev/link/special-props)', displayName);
      }
    };
    warnAboutAccessingKey.isReactWarning = true;
    Object.defineProperty(props, 'key', {
      get: warnAboutAccessingKey,
      configurable: true
    });
  }
}
function elementRefGetterWithDeprecationWarning() {
  {
    var componentName = getComponentNameFromType(this.type);
    if (!didWarnAboutElementRef[componentName]) {
      didWarnAboutElementRef[componentName] = true;
      console.error('Accessing element.ref was removed in React 19. ref is now a ' + 'regular prop. It will be removed from the JSX Element ' + 'type in a future release.');
    }

    // An undefined `element.ref` is coerced to `null` for
    // backwards compatibility.
    var refProp = this.props.ref;
    return refProp !== undefined ? refProp : null;
  }
}

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.transitional.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} props
 * @param {*} key
 * @param {string|object} ref
 * @param {*} owner
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @internal
 */
function ReactElement(type, key, self, source, owner, props, debugStack, debugTask) {
  // Ignore whatever was passed as the ref argument and treat `props.ref` as
  // the source of truth. The only thing we use this for is `element.ref`,
  // which will log a deprecation warning on access. In the next release, we
  // can remove `element.ref` as well as the `ref` argument.
  var refProp = props.ref;

  // An undefined `element.ref` is coerced to `null` for
  // backwards compatibility.
  var ref = refProp !== undefined ? refProp : null;
  var element;
  {
    // In dev, make `ref` a non-enumerable property with a warning. It's non-
    // enumerable so that test matchers and serializers don't access it and
    // trigger the warning.
    //
    // `ref` will be removed from the element completely in a future release.
    element = {
      // This tag allows us to uniquely identify this as a React Element
      $$typeof: REACT_ELEMENT_TYPE,
      // Built-in properties that belong on the element
      type: type,
      key: key,
      props: props,
      // Record the component responsible for creating this element.
      _owner: owner
    };
    if (ref !== null) {
      Object.defineProperty(element, 'ref', {
        enumerable: false,
        get: elementRefGetterWithDeprecationWarning
      });
    } else {
      // Don't warn on access if a ref is not given. This reduces false
      // positives in cases where a test serializer uses
      // getOwnPropertyDescriptors to compare objects, like Jest does, which is
      // a problem because it bypasses non-enumerability.
      //
      // So unfortunately this will trigger a false positive warning in Jest
      // when the diff is printed:
      //
      //   expect(<div ref={ref} />).toEqual(<span ref={ref} />);
      //
      // A bit sketchy, but this is what we've done for the `props.key` and
      // `props.ref` accessors for years, which implies it will be good enough
      // for `element.ref`, too. Let's see if anyone complains.
      Object.defineProperty(element, 'ref', {
        enumerable: false,
        value: null
      });
    }
  }
  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: 0
    });
    // debugInfo contains Server Component debug information.
    Object.defineProperty(element, '_debugInfo', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: null
    });
    Object.defineProperty(element, '_debugStack', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: debugStack
    });
    Object.defineProperty(element, '_debugTask', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: debugTask
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }
  return element;
}

/**
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */
function createElement(type, config, children) {
  {
    // We don't warn for invalid element type here because with owner stacks,
    // we error in the renderer. The renderer is the only one that knows what
    // types are valid for this particular renderer so we let it error there.

    // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing
    // errors. We don't want exception behavior to differ between dev and
    // prod. (Rendering will throw with a helpful message and as soon as the
    // type is fixed, the key warnings will appear.)
    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i]);
    }

    // Unlike the jsx() runtime, createElement() doesn't warn about key spread.
  }
  var propName;

  // Reserved names are extracted
  var props = {};
  var key = null;
  if (config != null) {
    {
      if (!didWarnAboutOldJSXRuntime && '__self' in config &&
      // Do not assume this is the result of an oudated JSX transform if key
      // is present, because the modern JSX transform sometimes outputs
      // createElement to preserve precedence between a static key and a
      // spread key. To avoid false positive warnings, we never warn if
      // there's a key.
      !('key' in config)) {
        didWarnAboutOldJSXRuntime = true;
        console.warn('Your app (or one of its dependencies) is using an outdated JSX ' + 'transform. Update to the modern JSX transform for ' + 'faster performance: https://react.dev/link/new-jsx-transform');
      }
    }
    if (hasValidKey(config)) {
      {
        checkKeyStringCoercion(config.key);
      }
      key = '' + config.key;
    }

    // Remaining properties are added to a new props object
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) &&
      // Skip over reserved prop names
      propName !== 'key' &&
      // Even though we don't use these anymore in the runtime, we don't want
      // them to appear as props, so in createElement we filter them out.
      // We don't have to do this in the jsx() runtime because the jsx()
      // transform never passed these as props; it used separate arguments.
      propName !== '__self' && propName !== '__source') {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var _i = 0; _i < childrenLength; _i++) {
      childArray[_i] = arguments[_i + 2];
    }
    {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  {
    if (key) {
      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
      defineKeyPropWarningGetter(props, displayName);
    }
  }
  var trackActualOwner = ReactSharedInternals.recentlyCreatedOwnerStacks++ < ownerStackLimit;
  return ReactElement(type, key, undefined, undefined, getOwner(), props, (trackActualOwner ? Error('react-stack-top-frame') : unknownOwnerDebugStack), (trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask));
}
function cloneAndReplaceKey(oldElement, newKey) {
  var clonedElement = ReactElement(oldElement.type, newKey, undefined, undefined, oldElement._owner, oldElement.props, oldElement._debugStack, oldElement._debugTask);
  {
    // The cloned element should inherit the original element's key validation.
    if (oldElement._store) {
      clonedElement._store.validated = oldElement._store.validated;
    }
  }
  return clonedElement;
}

/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://reactjs.org/docs/react-api.html#cloneelement
 */
function cloneElement(element, config, children) {
  if (element === null || element === undefined) {
    throw new Error("The argument must be a React element, but you passed " + element + ".");
  }
  var propName;

  // Original props are copied
  var props = assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;

  // Owner will be preserved, unless ref is overridden
  var owner = element._owner;
  if (config != null) {
    if (hasValidRef(config)) {
      owner = getOwner() ;
    }
    if (hasValidKey(config)) {
      {
        checkKeyStringCoercion(config.key);
      }
      key = '' + config.key;
    }
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) &&
      // Skip over reserved prop names
      propName !== 'key' &&
      // ...and maybe these, too, though we currently rely on them for
      // warnings and debug information in dev. Need to decide if we're OK
      // with dropping them. In the jsx() runtime it's not an issue because
      // the data gets passed as separate arguments instead of props, but
      // it would be nice to stop relying on them entirely so we can drop
      // them from the internal Fiber field.
      propName !== '__self' && propName !== '__source' &&
      // Undefined `ref` is ignored by cloneElement. We treat it the same as
      // if the property were missing. This is mostly for
      // backwards compatibility.
      !(propName === 'ref' && config.ref === undefined)) {
        {
          props[propName] = config[propName];
        }
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }
  var clonedElement = ReactElement(element.type, key, undefined, undefined, owner, props, element._debugStack, element._debugTask);
  for (var _i2 = 2; _i2 < arguments.length; _i2++) {
    validateChildKeys(arguments[_i2]);
  }
  return clonedElement;
}

/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */
function validateChildKeys(node, parentType) {
  {
    // With owner stacks is, no warnings happens. All we do is
    // mark elements as being in a valid static child position so they
    // don't need keys.
    if (isValidElement(node)) {
      if (node._store) {
        node._store.validated = 1;
      }
    }
  }
}

/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */
function isValidElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}

var SEPARATOR = '.';
var SUBSEPARATOR = ':';

/**
 * Escape and wrap key so it is safe to use as a reactid
 *
 * @param {string} key to be escaped.
 * @return {string} the escaped key.
 */
function escape(key) {
  var escapeRegex = /[=:]/g;
  var escaperLookup = {
    '=': '=0',
    ':': '=2'
  };
  var escapedString = key.replace(escapeRegex, function (match) {
    // $FlowFixMe[invalid-computed-prop]
    return escaperLookup[match];
  });
  return '$' + escapedString;
}

/**
 * TODO: Test that a single child and an array with one item have the same key
 * pattern.
 */

var didWarnAboutMaps = false;
var userProvidedKeyEscapeRegex = /\/+/g;
function escapeUserProvidedKey(text) {
  return text.replace(userProvidedKeyEscapeRegex, '$&/');
}

/**
 * Generate a key string that identifies a element within a set.
 *
 * @param {*} element A element that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getElementKey(element, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
  if (typeof element === 'object' && element !== null && element.key != null) {
    // Explicit key
    {
      checkKeyStringCoercion(element.key);
    }
    return escape('' + element.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}
function noop$1() {}
function resolveThenable(thenable) {
  switch (thenable.status) {
    case 'fulfilled':
      {
        var fulfilledValue = thenable.value;
        return fulfilledValue;
      }
    case 'rejected':
      {
        var rejectedError = thenable.reason;
        throw rejectedError;
      }
    default:
      {
        if (typeof thenable.status === 'string') {
          // Only instrument the thenable if the status if not defined. If
          // it's defined, but an unknown value, assume it's been instrumented by
          // some custom userspace implementation. We treat it as "pending".
          // Attach a dummy listener, to ensure that any lazy initialization can
          // happen. Flight lazily parses JSON when the value is actually awaited.
          thenable.then(noop$1, noop$1);
        } else {
          // This is an uncached thenable that we haven't seen before.

          // TODO: Detect infinite ping loops caused by uncached promises.

          var pendingThenable = thenable;
          pendingThenable.status = 'pending';
          pendingThenable.then(function (fulfilledValue) {
            if (thenable.status === 'pending') {
              var fulfilledThenable = thenable;
              fulfilledThenable.status = 'fulfilled';
              fulfilledThenable.value = fulfilledValue;
            }
          }, function (error) {
            if (thenable.status === 'pending') {
              var rejectedThenable = thenable;
              rejectedThenable.status = 'rejected';
              rejectedThenable.reason = error;
            }
          });
        }

        // Check one more time in case the thenable resolved synchronously.
        switch (thenable.status) {
          case 'fulfilled':
            {
              var fulfilledThenable = thenable;
              return fulfilledThenable.value;
            }
          case 'rejected':
            {
              var rejectedThenable = thenable;
              var _rejectedError = rejectedThenable.reason;
              throw _rejectedError;
            }
        }
      }
  }
  throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
  var type = typeof children;
  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }
  var invokeCallback = false;
  if (children === null) {
    invokeCallback = true;
  } else {
    switch (type) {
      case 'bigint':
      case 'string':
      case 'number':
        invokeCallback = true;
        break;
      case 'object':
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
            break;
          case REACT_LAZY_TYPE:
            var payload = children._payload;
            var init = children._init;
            return mapIntoArray(init(payload), array, escapedPrefix, nameSoFar, callback);
        }
    }
  }
  if (invokeCallback) {
    var _child = children;
    var mappedChild = callback(_child);
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows:
    var childKey = nameSoFar === '' ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
    if (isArray(mappedChild)) {
      var escapedChildKey = '';
      if (childKey != null) {
        escapedChildKey = escapeUserProvidedKey(childKey) + '/';
      }
      mapIntoArray(mappedChild, array, escapedChildKey, '', function (c) {
        return c;
      });
    } else if (mappedChild != null) {
      if (isValidElement(mappedChild)) {
        {
          // The `if` statement here prevents auto-disabling of the safe
          // coercion ESLint rule, so we must manually disable it below.
          // $FlowFixMe[incompatible-type] Flow incorrectly thinks React.Portal doesn't have a key
          if (mappedChild.key != null) {
            if (!_child || _child.key !== mappedChild.key) {
              checkKeyStringCoercion(mappedChild.key);
            }
          }
        }
        var newChild = cloneAndReplaceKey(mappedChild,
        // Keep both the (mapped) and old keys if they differ, just as
        // traverseAllChildren used to do for objects as children
        escapedPrefix + (
        // $FlowFixMe[incompatible-type] Flow incorrectly thinks React.Portal doesn't have a key
        mappedChild.key != null && (!_child || _child.key !== mappedChild.key) ? escapeUserProvidedKey(
        // $FlowFixMe[unsafe-addition]
        '' + mappedChild.key // eslint-disable-line react-internal/safe-string-coercion
        ) + '/' : '') + childKey);
        {
          // If `child` was an element without a `key`, we need to validate if
          // it should have had a `key`, before assigning one to `mappedChild`.
          // $FlowFixMe[incompatible-type] Flow incorrectly thinks React.Portal doesn't have a key
          if (nameSoFar !== '' && _child != null && isValidElement(_child) && _child.key == null) {
            // We check truthiness of `child._store.validated` instead of being
            // inequal to `1` to provide a bit of backward compatibility for any
            // libraries (like `fbt`) which may be hacking this property.
            if (_child._store && !_child._store.validated) {
              // Mark this child as having failed validation, but let the actual
              // renderer print the warning later.
              newChild._store.validated = 2;
            }
          }
        }
        mappedChild = newChild;
      }
      array.push(mappedChild);
    }
    return 1;
  }
  var child;
  var nextName;
  var subtreeCount = 0; // Count of children found in the current subtree.
  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
  if (isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getElementKey(child, i);
      subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
    }
  } else {
    var iteratorFn = getIteratorFn(children);
    if (typeof iteratorFn === 'function') {
      var iterableChildren = children;
      {
        // Warn about using Maps as children
        if (iteratorFn === iterableChildren.entries) {
          if (!didWarnAboutMaps) {
            console.warn('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
          }
          didWarnAboutMaps = true;
        }
      }
      var iterator = iteratorFn.call(iterableChildren);
      var step;
      var ii = 0;
      // $FlowFixMe[incompatible-use] `iteratorFn` might return null according to typing.
      while (!(step = iterator.next()).done) {
        child = step.value;
        nextName = nextNamePrefix + getElementKey(child, ii++);
        subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
      }
    } else if (type === 'object') {
      if (typeof children.then === 'function') {
        return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
      }

      // eslint-disable-next-line react-internal/safe-string-coercion
      var childrenString = String(children);
      throw new Error("Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
    }
  }
  return subtreeCount;
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenmap
 *
 * The provided mapFunction(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} func The map function.
 * @param {*} context Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    // $FlowFixMe limitation refining abstract types in Flow
    return children;
  }
  var result = [];
  var count = 0;
  mapIntoArray(children, result, '', '', function (child) {
    return func.call(context, child, count++);
  });
  return result;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrencount
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children) {
  var n = 0;
  mapChildren(children, function () {
    n++;
    // Don't return anything
  });
  return n;
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  mapChildren(children,
  // $FlowFixMe[missing-this-annot]
  function () {
    forEachFunc.apply(this, arguments);
    // Don't return anything.
  }, forEachContext);
}

/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
 */
function toArray(children) {
  return mapChildren(children, function (child) {
    return child;
  }) || [];
}

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenonly
 *
 * The current implementation of this function assumes that a single child gets
 * passed without a wrapper, but the purpose of this helper function is to
 * abstract away the particular structure of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactElement} The first and only `ReactElement` contained in the
 * structure.
 */
function onlyChild(children) {
  if (!isValidElement(children)) {
    throw new Error('React.Children.only expected to receive a single React element child.');
  }
  return children;
}

function createContext(defaultValue) {
  // TODO: Second argument used to be an optional `calculateChangedBits`
  // function. Warn to reserve for future use?

  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    // As a workaround to support multiple concurrent renderers, we categorize
    // some renderers as primary and others as secondary. We only expect
    // there to be two concurrent renderers at most: React Native (primary) and
    // Fabric (secondary); React DOM (primary) and React ART (secondary).
    // Secondary renderers store their context values on separate fields.
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    // Used to track how many concurrent renderers this context currently
    // supports within in a single renderer. Such as parallel server rendering.
    _threadCount: 0,
    // These are circular
    Provider: null,
    Consumer: null
  };
  {
    context.Provider = context;
    context.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: context
    };
  }
  {
    context._currentRenderer = null;
    context._currentRenderer2 = null;
  }
  return context;
}

var Uninitialized = -1;
var Pending = 0;
var Resolved = 1;
var Rejected = 2;
function lazyInitializer(payload) {
  if (payload._status === Uninitialized) {
    var ctor = payload._result;
    var thenable = ctor();
    // Transition to the next state.
    // This might throw either because it's missing or throws. If so, we treat it
    // as still uninitialized and try again next time. Which is the same as what
    // happens if the ctor or any wrappers processing the ctor throws. This might
    // end up fixing it if the resolution was a concurrency bug.
    thenable.then(function (moduleObject) {
      if (payload._status === Pending || payload._status === Uninitialized) {
        // Transition to the next state.
        var resolved = payload;
        resolved._status = Resolved;
        resolved._result = moduleObject;
      }
    }, function (error) {
      if (payload._status === Pending || payload._status === Uninitialized) {
        // Transition to the next state.
        var rejected = payload;
        rejected._status = Rejected;
        rejected._result = error;
      }
    });
    if (payload._status === Uninitialized) {
      // In case, we're still uninitialized, then we're waiting for the thenable
      // to resolve. Set it as pending in the meantime.
      var pending = payload;
      pending._status = Pending;
      pending._result = thenable;
    }
  }
  if (payload._status === Resolved) {
    var moduleObject = payload._result;
    {
      if (moduleObject === undefined) {
        console.error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' +
        // Break up imports to avoid accidentally parsing them as dependencies.
        'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))\n\n" + 'Did you accidentally put curly braces around the import?', moduleObject);
      }
    }
    {
      if (!('default' in moduleObject)) {
        console.error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' +
        // Break up imports to avoid accidentally parsing them as dependencies.
        'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))", moduleObject);
      }
    }
    return moduleObject.default;
  } else {
    throw payload._result;
  }
}
function lazy(ctor) {
  var payload = {
    // We use these fields to store the result.
    _status: Uninitialized,
    _result: ctor
  };
  var lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: payload,
    _init: lazyInitializer
  };
  return lazyType;
}

function forwardRef(render) {
  {
    if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
      console.error('forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
    } else if (typeof render !== 'function') {
      console.error('forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
    } else {
      if (render.length !== 0 && render.length !== 2) {
        console.error('forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.');
      }
    }
    if (render != null) {
      if (render.defaultProps != null) {
        console.error('forwardRef render functions do not support defaultProps. ' + 'Did you accidentally pass a React component?');
      }
    }
  }
  var elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render
  };
  {
    var ownName;
    Object.defineProperty(elementType, 'displayName', {
      enumerable: false,
      configurable: true,
      get: function () {
        return ownName;
      },
      set: function (name) {
        ownName = name;

        // The inner component shouldn't inherit this display name in most cases,
        // because the component may be used elsewhere.
        // But it's nice for anonymous functions to inherit the name,
        // so that our component-stack generation logic will display their frames.
        // An anonymous function generally suggests a pattern like:
        //   React.forwardRef((props, ref) => {...});
        // This kind of inner function is not used elsewhere so the side effect is okay.
        if (!render.name && !render.displayName) {
          Object.defineProperty(render, 'name', {
            value: name
          });
          render.displayName = name;
        }
      }
    });
  }
  return elementType;
}

function memo(type, compare) {
  {
    if (type == null) {
      console.error('memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
    }
  }
  var elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type: type,
    compare: compare === undefined ? null : compare
  };
  {
    var ownName;
    Object.defineProperty(elementType, 'displayName', {
      enumerable: false,
      configurable: true,
      get: function () {
        return ownName;
      },
      set: function (name) {
        ownName = name;

        // The inner component shouldn't inherit this display name in most cases,
        // because the component may be used elsewhere.
        // But it's nice for anonymous functions to inherit the name,
        // so that our component-stack generation logic will display their frames.
        // An anonymous function generally suggests a pattern like:
        //   React.memo((props) => {...});
        // This kind of inner function is not used elsewhere so the side effect is okay.
        if (!type.name && !type.displayName) {
          Object.defineProperty(type, 'name', {
            value: name
          });
          type.displayName = name;
        }
      }
    });
  }
  return elementType;
}

function noopCache(fn) {
  // On the client (i.e. not a Server Components environment) `cache` has
  // no caching behavior. We just return the function as-is.
  //
  // We intend to implement client caching in a future major release. In the
  // meantime, it's only exposed as an API so that Shared Components can use
  // per-request caching on the server without breaking on the client. But it
  // does mean they need to be aware of the behavioral difference.
  //
  // The rest of the behavior is the same as the server implementation — it
  // returns a new reference, extra properties like `displayName` are not
  // preserved, the length of the new function is 0, etc. That way apps can't
  // accidentally depend on those details.
  return function () {
    // $FlowFixMe[incompatible-call]: We don't want to use rest arguments since we transpile the code.
    return fn.apply(null, arguments);
  };
}
var cache = noopCache ;

function postpone(reason) {
  // eslint-disable-next-line react-internal/prod-error-codes
  var postponeInstance = new Error(reason);
  postponeInstance.$$typeof = REACT_POSTPONE_TYPE;
  throw postponeInstance;
}

function resolveDispatcher() {
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
function getCacheForType(resourceType) {
  var dispatcher = ReactSharedInternals.A;
  if (!dispatcher) {
    // If there is no dispatcher, then we treat this as not being cached.
    return resourceType();
  }
  return dispatcher.getCacheForType(resourceType);
}
function useContext(Context) {
  var dispatcher = resolveDispatcher();
  {
    if (Context.$$typeof === REACT_CONSUMER_TYPE) {
      console.error('Calling useContext(Context.Consumer) is not supported and will cause bugs. ' + 'Did you mean to call useContext(Context) instead?');
    }
  }
  return dispatcher.useContext(Context);
}
function useState(initialState) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
function useReducer(reducer, initialArg, init) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}
function useRef(initialValue) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
}
function useEffect(create, createDeps, update, updateDeps, destroy) {
  {
    if (create == null) {
      console.warn('React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?');
    }
  }
  var dispatcher = resolveDispatcher();
  if (typeof update === 'function') {
    throw new Error('useEffect CRUD overload is not enabled in this build of React.');
  }
  return dispatcher.useEffect(create, createDeps);
}
function useInsertionEffect(create, deps) {
  {
    if (create == null) {
      console.warn('React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?');
    }
  }
  var dispatcher = resolveDispatcher();
  return dispatcher.useInsertionEffect(create, deps);
}
function useLayoutEffect(create, deps) {
  {
    if (create == null) {
      console.warn('React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?');
    }
  }
  var dispatcher = resolveDispatcher();
  return dispatcher.useLayoutEffect(create, deps);
}
function useCallback(callback, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useCallback(callback, deps);
}
function useMemo(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useMemo(create, deps);
}
function useImperativeHandle(ref, create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useImperativeHandle(ref, create, deps);
}
function useDebugValue(value, formatterFn) {
  {
    var dispatcher = resolveDispatcher();
    return dispatcher.useDebugValue(value, formatterFn);
  }
}
function useTransition() {
  var dispatcher = resolveDispatcher();
  return dispatcher.useTransition();
}
function useDeferredValue(value, initialValue) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useDeferredValue(value, initialValue);
}
function useId() {
  var dispatcher = resolveDispatcher();
  return dispatcher.useId();
}
function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
function useCacheRefresh() {
  var dispatcher = resolveDispatcher();
  // $FlowFixMe[not-a-function] This is unstable, thus optional
  return dispatcher.useCacheRefresh();
}
function use(usable) {
  var dispatcher = resolveDispatcher();
  return dispatcher.use(usable);
}
function useMemoCache(size) {
  var dispatcher = resolveDispatcher();
  // $FlowFixMe[not-a-function] This is unstable, thus optional
  return dispatcher.useMemoCache(size);
}
function useEffectEvent(callback) {
  var dispatcher = resolveDispatcher();
  // $FlowFixMe[not-a-function] This is unstable, thus optional
  return dispatcher.useEffectEvent(callback);
}
function useOptimistic(passthrough, reducer) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useOptimistic(passthrough, reducer);
}
function useActionState(action, initialState, permalink) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useActionState(action, initialState, permalink);
}
function useSwipeTransition(previous, current, next) {
  var dispatcher = resolveDispatcher();
  // $FlowFixMe[not-a-function] This is unstable, thus optional
  return dispatcher.useSwipeTransition(previous, current, next);
}

var reportGlobalError = typeof reportError === 'function' ?
// In modern browsers, reportError will dispatch an error event,
// emulating an uncaught JavaScript error.
reportError : function (error) {
  if (typeof window === 'object' && typeof window.ErrorEvent === 'function') {
    // Browser Polyfill
    var message = typeof error === 'object' && error !== null && typeof error.message === 'string' ?
    // eslint-disable-next-line react-internal/safe-string-coercion
    String(error.message) :
    // eslint-disable-next-line react-internal/safe-string-coercion
    String(error);
    var event = new window.ErrorEvent('error', {
      bubbles: true,
      cancelable: true,
      message: message,
      error: error
    });
    var shouldLog = window.dispatchEvent(event);
    if (!shouldLog) {
      return;
    }
  } else if (typeof process === 'object' &&
  // $FlowFixMe[method-unbinding]
  typeof process.emit === 'function') {
    // Node Polyfill
    process.emit('uncaughtException', error);
    return;
  }
  console['error'](error);
};

function startTransition(scope, options) {
  var prevTransition = ReactSharedInternals.T;
  var currentTransition = {};
  ReactSharedInternals.T = currentTransition;
  {
    currentTransition._updatedFibers = new Set();
  }
  try {
    var returnValue = scope();
    var onStartTransitionFinish = ReactSharedInternals.S;
    if (onStartTransitionFinish !== null) {
      onStartTransitionFinish(currentTransition, returnValue);
    }
    if (typeof returnValue === 'object' && returnValue !== null && typeof returnValue.then === 'function') {
      returnValue.then(noop, reportGlobalError);
    }
  } catch (error) {
    reportGlobalError(error);
  } finally {
    warnAboutTransitionSubscriptions(prevTransition, currentTransition);
    ReactSharedInternals.T = prevTransition;
  }
}
function warnAboutTransitionSubscriptions(prevTransition, currentTransition) {
  {
    if (prevTransition === null && currentTransition._updatedFibers) {
      var updatedFibersCount = currentTransition._updatedFibers.size;
      currentTransition._updatedFibers.clear();
      if (updatedFibersCount > 10) {
        console.warn('Detected a large number of updates inside startTransition. ' + 'If this is due to a subscription please re-write it to use React provided hooks. ' + 'Otherwise concurrent mode guarantees are off the table.');
      }
    }
  }
}
function noop() {}

function addTransitionType(type) {
  var pendingTransitionTypes = ReactSharedInternals.V;
  if (pendingTransitionTypes === null) {
    ReactSharedInternals.V = [type];
  } else if (pendingTransitionTypes.indexOf(type) === -1) {
    pendingTransitionTypes.push(type);
  }
}

var didWarnAboutMessageChannel = false;
var enqueueTaskImpl = null;
function enqueueTask(task) {
  if (enqueueTaskImpl === null) {
    try {
      // read require off the module object to get around the bundlers.
      // we don't want them to detect a require and bundle a Node polyfill.
      var requireString = ('require' + Math.random()).slice(0, 7);
      // $FlowFixMe[invalid-computed-prop]
      var nodeRequire = module && module[requireString];
      // assuming we're in node, let's try to get node's
      // version of setImmediate, bypassing fake timers if any.
      enqueueTaskImpl = nodeRequire.call(module, 'timers').setImmediate;
    } catch (_err) {
      // we're in a browser
      // we can't use regular timers because they may still be faked
      // so we try MessageChannel+postMessage instead
      enqueueTaskImpl = function (callback) {
        {
          if (didWarnAboutMessageChannel === false) {
            didWarnAboutMessageChannel = true;
            if (typeof MessageChannel === 'undefined') {
              console.error('This browser does not have a MessageChannel implementation, ' + 'so enqueuing tasks via await act(async () => ...) will fail. ' + 'Please file an issue at https://github.com/facebook/react/issues ' + 'if you encounter this warning.');
            }
          }
        }
        var channel = new MessageChannel();
        channel.port1.onmessage = callback;
        channel.port2.postMessage(undefined);
      };
    }
  }
  return enqueueTaskImpl(task);
}

// `act` calls can be nested, so we track the depth. This represents the
// number of `act` scopes on the stack.
var actScopeDepth = 0;

// We only warn the first time you neglect to await an async `act` scope.
var didWarnNoAwaitAct = false;
function aggregateErrors(errors) {
  if (errors.length > 1 && typeof AggregateError === 'function') {
    // eslint-disable-next-line no-undef
    return new AggregateError(errors);
  }
  return errors[0];
}
function act(callback) {
  {
    // When ReactSharedInternals.actQueue is not null, it signals to React that
    // we're currently inside an `act` scope. React will push all its tasks to
    // this queue instead of scheduling them with platform APIs.
    //
    // We set this to an empty array when we first enter an `act` scope, and
    // only unset it once we've left the outermost `act` scope — remember that
    // `act` calls can be nested.
    //
    // If we're already inside an `act` scope, reuse the existing queue.
    var prevIsBatchingLegacy = false;
    var prevActQueue = ReactSharedInternals.actQueue;
    var prevActScopeDepth = actScopeDepth;
    actScopeDepth++;
    var queue = ReactSharedInternals.actQueue = prevActQueue !== null ? prevActQueue : [];
    var result;
    // This tracks whether the `act` call is awaited. In certain cases, not
    // awaiting it is a mistake, so we will detect that and warn.
    var didAwaitActCall = false;
    try {
      // Reset this to `false` right before entering the React work loop. The
      // only place we ever read this fields is just below, right after running
      // the callback. So we don't need to reset after the callback runs.
      if (!disableLegacyMode) ;
      result = callback();
      var didScheduleLegacyUpdate = !disableLegacyMode ? ReactSharedInternals.didScheduleLegacyUpdate : false;

      // Replicate behavior of original `act` implementation in legacy mode,
      // which flushed updates immediately after the scope function exits, even
      // if it's an async function.
      if (!prevIsBatchingLegacy && didScheduleLegacyUpdate) {
        flushActQueue(queue);
      }
      // `isBatchingLegacy` gets reset using the regular stack, not the async
      // one used to track `act` scopes. Why, you may be wondering? Because
      // that's how it worked before version 18. Yes, it's confusing! We should
      // delete legacy mode!!
      if (!disableLegacyMode) ;
    } catch (error) {
      // `isBatchingLegacy` gets reset using the regular stack, not the async
      // one used to track `act` scopes. Why, you may be wondering? Because
      // that's how it worked before version 18. Yes, it's confusing! We should
      // delete legacy mode!!
      ReactSharedInternals.thrownErrors.push(error);
    }
    if (ReactSharedInternals.thrownErrors.length > 0) {
      popActScope(prevActQueue, prevActScopeDepth);
      var thrownError = aggregateErrors(ReactSharedInternals.thrownErrors);
      ReactSharedInternals.thrownErrors.length = 0;
      throw thrownError;
    }
    if (result !== null && typeof result === 'object' &&
    // $FlowFixMe[method-unbinding]
    typeof result.then === 'function') {
      // A promise/thenable was returned from the callback. Wait for it to
      // resolve before flushing the queue.
      //
      // If `act` were implemented as an async function, this whole block could
      // be a single `await` call. That's really the only difference between
      // this branch and the next one.
      var thenable = result;

      // Warn if the an `act` call with an async scope is not awaited. In a
      // future release, consider making this an error.
      queueSeveralMicrotasks(function () {
        if (!didAwaitActCall && !didWarnNoAwaitAct) {
          didWarnNoAwaitAct = true;
          console.error('You called act(async () => ...) without await. ' + 'This could lead to unexpected testing behaviour, ' + 'interleaving multiple act calls and mixing their ' + 'scopes. ' + 'You should - await act(async () => ...);');
        }
      });
      return {
        then: function (resolve, reject) {
          didAwaitActCall = true;
          thenable.then(function (returnValue) {
            popActScope(prevActQueue, prevActScopeDepth);
            if (prevActScopeDepth === 0) {
              // We're exiting the outermost `act` scope. Flush the queue.
              try {
                flushActQueue(queue);
                enqueueTask(function () {
                  return (
                    // Recursively flush tasks scheduled by a microtask.
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject)
                  );
                });
              } catch (error) {
                // `thenable` might not be a real promise, and `flushActQueue`
                // might throw, so we need to wrap `flushActQueue` in a
                // try/catch.
                ReactSharedInternals.thrownErrors.push(error);
              }
              if (ReactSharedInternals.thrownErrors.length > 0) {
                var _thrownError = aggregateErrors(ReactSharedInternals.thrownErrors);
                ReactSharedInternals.thrownErrors.length = 0;
                reject(_thrownError);
              }
            } else {
              resolve(returnValue);
            }
          }, function (error) {
            popActScope(prevActQueue, prevActScopeDepth);
            if (ReactSharedInternals.thrownErrors.length > 0) {
              var _thrownError2 = aggregateErrors(ReactSharedInternals.thrownErrors);
              ReactSharedInternals.thrownErrors.length = 0;
              reject(_thrownError2);
            } else {
              reject(error);
            }
          });
        }
      };
    } else {
      var returnValue = result;
      // The callback is not an async function. Exit the current
      // scope immediately.
      popActScope(prevActQueue, prevActScopeDepth);
      if (prevActScopeDepth === 0) {
        // We're exiting the outermost `act` scope. Flush the queue.
        flushActQueue(queue);

        // If the queue is not empty, it implies that we intentionally yielded
        // to the main thread, because something suspended. We will continue
        // in an asynchronous task.
        //
        // Warn if something suspends but the `act` call is not awaited.
        // In a future release, consider making this an error.
        if (queue.length !== 0) {
          queueSeveralMicrotasks(function () {
            if (!didAwaitActCall && !didWarnNoAwaitAct) {
              didWarnNoAwaitAct = true;
              console.error('A component suspended inside an `act` scope, but the ' + '`act` call was not awaited. When testing React ' + 'components that depend on asynchronous data, you must ' + 'await the result:\n\n' + 'await act(() => ...)');
            }
          });
        }

        // Like many things in this module, this is next part is confusing.
        //
        // We do not currently require every `act` call that is passed a
        // callback to be awaited, through arguably we should. Since this
        // callback was synchronous, we need to exit the current scope before
        // returning.
        //
        // However, if thenable we're about to return *is* awaited, we'll
        // immediately restore the current scope. So it shouldn't observable.
        //
        // This doesn't affect the case where the scope callback is async,
        // because we always require those calls to be awaited.
        //
        // TODO: In a future version, consider always requiring all `act` calls
        // to be awaited, regardless of whether the callback is sync or async.
        ReactSharedInternals.actQueue = null;
      }
      if (ReactSharedInternals.thrownErrors.length > 0) {
        var _thrownError3 = aggregateErrors(ReactSharedInternals.thrownErrors);
        ReactSharedInternals.thrownErrors.length = 0;
        throw _thrownError3;
      }
      return {
        then: function (resolve, reject) {
          didAwaitActCall = true;
          if (prevActScopeDepth === 0) {
            // If the `act` call is awaited, restore the queue we were
            // using before (see long comment above) so we can flush it.
            ReactSharedInternals.actQueue = queue;
            enqueueTask(function () {
              return (
                // Recursively flush tasks scheduled by a microtask.
                recursivelyFlushAsyncActWork(returnValue, resolve, reject)
              );
            });
          } else {
            resolve(returnValue);
          }
        }
      };
    }
  }
}
function popActScope(prevActQueue, prevActScopeDepth) {
  {
    if (prevActScopeDepth !== actScopeDepth - 1) {
      console.error('You seem to have overlapping act() calls, this is not supported. ' + 'Be sure to await previous act() calls before making a new one. ');
    }
    actScopeDepth = prevActScopeDepth;
  }
}
function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
  {
    // Check if any tasks were scheduled asynchronously.
    var queue = ReactSharedInternals.actQueue;
    if (queue !== null) {
      if (queue.length !== 0) {
        // Async tasks were scheduled, mostly likely in a microtask.
        // Keep flushing until there are no more.
        try {
          flushActQueue(queue);
          // The work we just performed may have schedule additional async
          // tasks. Wait a macrotask and check again.
          enqueueTask(function () {
            return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
          });
          return;
        } catch (error) {
          // Leave remaining tasks on the queue if something throws.
          ReactSharedInternals.thrownErrors.push(error);
        }
      } else {
        // The queue is empty. We can finish.
        ReactSharedInternals.actQueue = null;
      }
    }
    if (ReactSharedInternals.thrownErrors.length > 0) {
      var thrownError = aggregateErrors(ReactSharedInternals.thrownErrors);
      ReactSharedInternals.thrownErrors.length = 0;
      reject(thrownError);
    } else {
      resolve(returnValue);
    }
  }
}
var isFlushing = false;
function flushActQueue(queue) {
  {
    if (!isFlushing) {
      // Prevent re-entrance.
      isFlushing = true;
      var i = 0;
      try {
        for (; i < queue.length; i++) {
          var callback = queue[i];
          do {
            ReactSharedInternals.didUsePromise = false;
            var continuation = callback(false);
            if (continuation !== null) {
              if (ReactSharedInternals.didUsePromise) {
                // The component just suspended. Yield to the main thread in
                // case the promise is already resolved. If so, it will ping in
                // a microtask and we can resume without unwinding the stack.
                queue[i] = callback;
                queue.splice(0, i);
                return;
              }
              callback = continuation;
            } else {
              break;
            }
          } while (true);
        }
        // We flushed the entire queue.
        queue.length = 0;
      } catch (error) {
        // If something throws, leave the remaining callbacks on the queue.
        queue.splice(0, i + 1);
        ReactSharedInternals.thrownErrors.push(error);
      } finally {
        isFlushing = false;
      }
    }
  }
}

// Some of our warnings attempt to detect if the `act` call is awaited by
// checking in an asynchronous task. Wait a few microtasks before checking. The
// only reason one isn't sufficient is we want to accommodate the case where an
// `act` call is returned from an async function without first being awaited,
// since that's a somewhat common pattern. If you do this too many times in a
// nested sequence, you might get a warning, but you can always fix by awaiting
// the call.
//
// A macrotask would also work (and is the fallback) but depending on the test
// environment it may cause the warning to fire too late.
var queueSeveralMicrotasks = typeof queueMicrotask === 'function' ? function (callback) {
  queueMicrotask(function () {
    return queueMicrotask(callback);
  });
} : enqueueTask;

function captureOwnerStack() {
  {
    var getCurrentStack = ReactSharedInternals.getCurrentStack;
    if (getCurrentStack === null) {
      return null;
    }
    // The current stack will be the owner stack which it is always here.
    return getCurrentStack();
  }
}

var ReactCompilerRuntime = /*#__PURE__*/Object.freeze({
  __proto__: null,
  c: useMemoCache
});

var Children = {
  map: mapChildren,
  forEach: forEachChildren,
  count: countChildren,
  toArray: toArray,
  only: onlyChild
};

function experimental_useOptimistic(passthrough, reducer) {
  {
    console.error('useOptimistic is now in canary. Remove the experimental_ prefix. ' + 'The prefixed alias will be removed in an upcoming release.');
  }
  return useOptimistic(passthrough, reducer);
}

export { Children, Component, REACT_FRAGMENT_TYPE as Fragment, REACT_PROFILER_TYPE as Profiler, PureComponent, REACT_STRICT_MODE_TYPE as StrictMode, REACT_SUSPENSE_TYPE as Suspense, ReactSharedInternals as __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactCompilerRuntime as __COMPILER_RUNTIME, act, cache, captureOwnerStack, cloneElement, createContext, createElement, createRef, useEffectEvent as experimental_useEffectEvent, experimental_useOptimistic, forwardRef, isValidElement, lazy, memo, startTransition, REACT_ACTIVITY_TYPE as unstable_Activity, REACT_SUSPENSE_LIST_TYPE as unstable_SuspenseList, REACT_VIEW_TRANSITION_TYPE as unstable_ViewTransition, addTransitionType as unstable_addTransitionType, getCacheForType as unstable_getCacheForType, postpone as unstable_postpone, useCacheRefresh as unstable_useCacheRefresh, useSwipeTransition as unstable_useSwipeTransition, use, useActionState, useCallback, useContext, useDebugValue, useDeferredValue, useEffect, useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo, useOptimistic, useReducer, useRef, useState, useSyncExternalStore, useTransition, ReactVersion as version };
//# sourceMappingURL=react.development.js.map
