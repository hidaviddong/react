'use strict';

const assign = Object.assign;

const REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element') ;
const REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');

const isArrayImpl = Array.isArray;
function isArray(a) {
  return isArrayImpl(a);
}

const _require = require('internal-test-utils/consoleMock'),
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
      message: () => error.message
    };
  }
  return {
    pass: true
  };
}
function assertYieldsWereCleared(root) {
  const Scheduler = root._Scheduler;
  const actualYields = Scheduler.unstable_clearLog();
  if (actualYields.length !== 0) {
    const error = Error('Log of yielded values is not empty. ' + 'Call expect(ReactTestRenderer).unstable_toHaveYielded(...) first.');
    Error.captureStackTrace(error, assertYieldsWereCleared);
    throw error;
  }
  assertConsoleLogsCleared();
}
function createJSXElementForTestComparison(type, props) {
  {
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: null,
      ref: null,
      props: props
    };
  }
}
function unstable_toMatchRenderedOutput(root, expectedJSX) {
  assertYieldsWereCleared(root);
  const actualJSON = root.toJSON();
  let actualJSX;
  if (actualJSON === null || typeof actualJSON === 'string') {
    actualJSX = actualJSON;
  } else if (isArray(actualJSON)) {
    if (actualJSON.length === 0) {
      actualJSX = null;
    } else if (actualJSON.length === 1) {
      actualJSX = jsonChildToJSXChild(actualJSON[0]);
    } else {
      const actualJSXChildren = jsonChildrenToJSXChildren(actualJSON);
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
  return captureAssertion(() => {
    expect(actualJSX).toEqual(expectedJSX);
  });
}
function jsonChildToJSXChild(jsonChild) {
  if (jsonChild === null || typeof jsonChild === 'string') {
    return jsonChild;
  } else {
    const jsxChildren = jsonChildrenToJSXChildren(jsonChild.children);
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
      const jsxChildren = [];
      let allJSXChildrenAreStrings = true;
      let jsxChildrenString = '';
      for (let i = 0; i < jsonChildren.length; i++) {
        const jsxChild = jsonChildToJSXChild(jsonChildren[i]);
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
//# sourceMappingURL=jest-react.production.js.map
