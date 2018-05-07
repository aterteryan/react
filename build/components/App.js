'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ArticleList = require('./ArticleList');

var _ArticleList2 = _interopRequireDefault(_ArticleList);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _SearchBar = require('./SearchBar');

var _SearchBar2 = _interopRequireDefault(_SearchBar);

var _lodash = require('lodash.pickby');

var _lodash2 = _interopRequireDefault(_lodash);

var _Timestamp = require('./Timestamp');

var _Timestamp2 = _interopRequireDefault(_Timestamp);

var _reactAddonsPerf = require('react-addons-perf');

var _reactAddonsPerf2 = _interopRequireDefault(_reactAddonsPerf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof window !== 'undefined') {
  window.Perf = _reactAddonsPerf2.default;
}

class App extends _react2.default.PureComponent {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.onStoreChange = () => {
      this.setState(this.props.store.getState());
    }, this.appState = () => {
      const { articles, searchTerm } = this.props.store.getState();
      return { articles, searchTerm };
    }, this.state = this.appState(), this.onStoreChange = () => {
      this.setState(this.appState); // ? this.appState()
    }, _temp;
  }

  getChildContext() {
    return {
      store: this.props.store
    };
  }

  componentDidMount() {
    this.subscriptionId = this.props.store.subscribe(this.onStoreChange);
    this.props.store.startClock();

    setImmediate(() => {
      _reactAddonsPerf2.default.start();
    });

    setTimeout(() => {
      _reactAddonsPerf2.default.stop();
      _reactAddonsPerf2.default.printWasted();
    }, 5000);
  }

  componentWillUnmount() {
    this.props.store.unsubscribe(this.subscriptionId);
  }

  render() {
    let { articles, searchTerm } = this.state;
    const searchRE = new RegExp(searchTerm, 'i');
    if (searchTerm) {
      articles = (0, _lodash2.default)(articles, value => {
        return value.title.match(searchRE) || value.body.match(searchRE);
      });
    }

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(_Timestamp2.default, null),
      _react2.default.createElement(_SearchBar2.default, null),
      _react2.default.createElement(_ArticleList2.default, {
        articles: articles,
        store: this.props.store
      })
    );
  }
}

App.childContextTypes = {
  store: _propTypes2.default.object
};
exports.default = App;