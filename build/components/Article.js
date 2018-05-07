'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _storeProvider = require('./storeProvider');

var _storeProvider2 = _interopRequireDefault(_storeProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const style = {
  article: {
    paddingBottom: 5,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    marginBottom: 10
  },
  title: {
    fontWeight: 'bold'
  },
  date: {
    fontSize: '0.85em',
    color: '#888'
  },
  author: {
    paddingTop: 10,
    paddingBottom: 10
  },
  body: {
    paddingLeft: 20
  }
};

const dateDisplay = dateString => new Date(dateString).toDateString();

class Article extends _react2.default.PureComponent {
  render() {
    const { article, author } = this.props;
    return _react2.default.createElement(
      'div',
      { style: style.article },
      _react2.default.createElement(
        'div',
        { style: style.title },
        article.title
      ),
      _react2.default.createElement(
        'div',
        { style: style.date },
        dateDisplay(article.date)
      ),
      _react2.default.createElement(
        'div',
        { style: style.author },
        _react2.default.createElement(
          'a',
          { href: author.website },
          author.firsName,
          ' ',
          author.lastName
        )
      ),
      _react2.default.createElement(
        'div',
        { style: style.body },
        article.body
      )
    );
  }

}

Article.propTypes = {
  article: _propTypes2.default.shape({
    title: _propTypes2.default.string.isRequired,
    body: _propTypes2.default.string.isRequired,
    date: _propTypes2.default.string.isRequired
  })
};

function extraProps(store, originalProps) {
  return {
    author: store.lookupAuthor(originalProps.article.authorId)
  };
}

exports.default = (0, _storeProvider2.default)(extraProps)(Article);