'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _App = require('components/App');

var _App2 = _interopRequireDefault(_App);

var _stateApi = require('state-api');

var _stateApi2 = _interopRequireDefault(_stateApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const store = new _stateApi2.default(window.initialData);

_reactDom2.default.render(_react2.default.createElement(_App2.default, { store: store }), document.getElementById('root'));