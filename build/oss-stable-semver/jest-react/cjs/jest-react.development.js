'use strict';

if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var assign = Object.assign;

var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element') ;
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');

var isArrayImpl = Array.isArray;
function isArray(a) {
  return isArrayImpl(a);
}

var _require = require('internal-test-utils/consoleMock'),
  assertConsoleLogsCleared = _require.assertConsoleLogsCleared;
function captureAssertion(fn) {
  // Trick to use a Jest matcher inside another Jest matcher. `fn` contains an
  // assertion; if it throws, we capture the error and return it, so the stack
  // trace presented to the user points to the original assertion in the
  // test file.
  try {
    fn();
  } catch (error) {
    return {
      pass: false,
      message: function () {
        return error.message;
      }
    };
  }
  return {
    pass: true
  };
}
function assertYieldsWereCleared(root) {
  var Scheduler = root._Scheduler;
  var actualYields = Scheduler.unstable_clearLog();
  if (actualYields.length !== 0) {
    var error = Error('Log of yielded values is not empty. ' + 'Call expect(ReactTestRenderer).unstable_toHaveYielded(...) first.');
    Error.captureStackTrace(error, assertYieldsWereCleared);
    throw error;
  }
  assertConsoleLogsCleared();
}
function createJSXElementForTestComparison(type, props) {
  {
    var element = {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: null,
      props: props,
      _owner: null,
      _store: {} 
    };
    Object.defineProperty(element, 'ref', {
      enumerable: false,
      value: null
    });
    return element;
  }
}
function unstable_toMatchRenderedOutput(root, expectedJSX) {
  assertYieldsWereCleared(root);
  var actualJSON = root.toJSON();
  var actualJSX;
  if (actualJSON === null || typeof actualJSON === 'string') {
    actualJSX = actualJSON;
  } else if (isArray(actualJSON)) {
    if (actualJSON.length === 0) {
      actualJSX = null;
    } else if (actualJSON.length === 1) {
      actualJSX = jsonChildToJSXChild(actualJSON[0]);
    } else {
      var actualJSXChildren = jsonChildrenToJSXChildren(actualJSON);
      if (actualJSXChildren === null || typeof actualJSXChildren === 'string') {
        actualJSX = actualJSXChildren;
      } else {
        actualJSX = createJSXElementForTestComparison(REACT_FRAGMENT_TYPE, {
          children: actualJSXChildren
        });
      }
    }
  } else {
    actualJSX = jsonChildToJSXChild(actualJSON);
  }
  return captureAssertion(function () {
    expect(actualJSX).toEqual(expectedJSX);
  });
}
function jsonChildToJSXChild(jsonChild) {
  if (jsonChild === null || typeof jsonChild === 'string') {
    return jsonChild;
  } else {
    var jsxChildren = jsonChildrenToJSXChildren(jsonChild.children);
    return createJSXElementForTestComparison(jsonChild.type, jsxChildren === null ? jsonChild.props : assign({}, jsonChild.props, {
      children: jsxChildren
    }));
  }
}
function jsonChildrenToJSXChildren(jsonChildren) {
  if (jsonChildren !== null) {
    if (jsonChildren.length === 1) {
      return jsonChildToJSXChild(jsonChildren[0]);
    } else if (jsonChildren.length > 1) {
      var jsxChildren = [];
      var allJSXChildrenAreStrings = true;
      var jsxChildrenString = '';
      for (var i = 0; i < jsonChildren.length; i++) {
        var jsxChild = jsonChildToJSXChild(jsonChildren[i]);
        jsxChildren.push(jsxChild);
        if (allJSXChildrenAreStrings) {
          if (typeof jsxChild === 'string') {
            jsxChildrenString += jsxChild;
          } else if (jsxChild !== null) {
            allJSXChildrenAreStrings = false;
          }
        }
      }
      return allJSXChildrenAreStrings ? jsxChildrenString : jsxChildren;
    }
  }
  return null;
}

exports.unstable_toMatchRenderedOutput = unstable_toMatchRenderedOutput;
  })();
}
//# sourceMappingURL=jest-react.development.js.map
