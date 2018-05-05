// ***** 5.1 *****
// 01. Сейчас мы не сможем сделать снэпшот-тестирование в компоненте Article.js,
// т.к. он привязан к глобальной сущности context api, но мы можем отделить логику
// привязки к нашему стору через context от разметки. Для этого выделим компонент-
// контейнер с логикой и компонент разметки
// --- Article.js ---
// * Добавим ArticleContainer.js
const ArticleContainer = (props, { store }) => {
    return <Article {...props} store={store} />;
};
// * Удалим из Article context, теперь store попадает туда через props
// store={store} из ArticleContainer
// * Удалим Article.contextTypes, т.к. компонент разметки больше не работает
// с context напрямую
// * Добавим работу с context в ArticleContainer
ArticleContainer.contextTypes = {
    store: PropTypes.object
};
// * Поменяем экспорт
export default ArticleContainer;


// ***** 5.2 *****
// 01. Сейчас мы имеем вполне рабочее решение разделения Article на
// на презентационный компонент с разметкой и компонент-контейнер 
// с вынесенной логикой работы со стором, который передается через
// context api.
// Мы можем пойти дальше и сделать более универсальный синтетический 
// компонент, который бы предоставлял функционал подключения к стору 
// не только компоненту разметки Article, но потенциально любому
// компоненту, которому нужно подключиться к стору.
// Такой компонент представляет собой функцию, которая возвращает
// компонент-контейнер, который отвечает за то чтобы достать стор из
// context api. Такой синтетический компонент обычно называют -
// higher order component (hoc)
// --- Article.js ---
// * добавим
import storeProvider from './storeProvider';
// * уберем ArticleContainer и добавим
export default storeProvider(Article);


// 02. Теперь добавим hoc storeProvider
// --- components/storeProvider ---
import React from 'react';
import PropTypes from 'prop-types';

const storeProvider = (Component) => {
    // Создает компонент-контейнер
    const WithStore = (props, { store }) =>
        <Component {...props} store={store} />;

    WithStore.contextTypes = {
        store: PropTypes.object
    };

    WithStore.displayName = `${Component.name}Container`;

    return WithStore;
};

export default storeProvider;


// 03. Т.к. возвращаемый hoc-ом компонент как правило управляет
// своим внутренним состоянием, будет не лишним переписать его
// на класс, т.к. классу доступны методы жизненного цикла
// --- components/storeProvider ---
const storeProvider = (Component) =>
    class extends React.Component {
        static displayName = `${Component.name}Container`;
        static contextTypes = { store: PropTypes.object };

        render() {
            return <Component
                {...this.props}
                store={this.context.store}
            />;
        }
    };


// 04. Поправим ArticleListTest, т.к. мы пытаемся искать в нем Article,
// но его там нет, т.к. его нам возвращает обертка из hoc
// --- ArticleListTest.js ---
expect(wrapper.find('ArticleContainer').length).toBe(2);
// * Удалим Article.propType = {};
// * Удалим import Article from './Article';
// * Проверим тест и обновим снепшот


// ***** 5.3 *****
// 01. В компоненте Article по-прежнему есть завязка на store,
// через метод store.lookupAuthor. Было бы хорошо избавить презентационный 
// компонент от непосредственного взаимодействия со стором
// --- Article.js ---
// * Удалим const author = context.store.lookupAuthor(article.authorId);
// * Удалим store из деструктуризации props
// * Добавим в деструктуризацию author, так словно этот prop приходит
// в компонент
// * Добавим дополнительные props, которые будет возвращать в Article
// storeProvider через функцию extraProps
function extraProps(store, originalProps) {
    return {
        author: store.lookupAuthor(originalProps.article.authorId)
    };
}
// * Удалим const author = context.store.lookupAuthor(article.authorId);
// * Т.к. у storeProvider есть доступ к store и originalProps, мы можем
// вызвать extraProps и результат этой функции передать в props, которые
// передаст компонент обертка, оборачивающая оригинальный компонент
// ArticleList
export default storeProvider(extraProps)(Article);
// --- storeProvider.js ---
const storeProvider = (extraProps) => (Component) => // ...
// ...
render() {
    return <Component 
        {...this.props}
        {...extraProps(this.context.store, this.props)}
        store={this.context.store}
    />;
}



/////////////////////////////////
////////// Components ///////////
/////////////////////////////////

// Article.js
import React from 'react';
import PropTypes from 'prop-types';
import storeProvider from './storeProvider';

const style = {
  article: {
    paddingBottom: 5,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    marginBottom: '10'
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

const dateDisplay = (dateString) =>
  new Date(dateString).toDateString();

const Article = (props) => {
  const { article, author } = props;

  return <div style={style.article}>
    <div style={style.title}>
      {article.title}
    </div>
    <div style={style.date}>
      {dateDisplay(article.date)}
    </div>
    <div style={style.author}>
      <a href={author.website}>
        {author.firsName} {author.lastName}
      </a>
    </div>
    <div style={style.body}>
      {article.body}
    </div>
  </div>;
};

Article.propTypes = {
  article: PropTypes.shape({
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired
  })
};

function extraProps(store, originalProps) {
  return {
    author: store.lookupAuthor(originalProps.article.authorId)
  };
}

export default storeProvider(extraProps)(Article);

// storeProvider.js
import React from 'react';
import PropTypes from 'prop-types';

const storeProvider = (extraProps) => (Component) =>
  class extends React.Component {
        static displayName = `${Component.name}Container`;
        static contextTypes = { store: PropTypes.object };

        render() {
          return <Component
            {...this.props}
            {...extraProps(this.context.store, this.props)}
            store={this.context.store}
          />;
        }
  };

export default storeProvider;

// ArticleListTest.js
import React from 'react';
import ArticleList from '../ArticleList';
import { shallow } from 'enzyme';

describe('ArticleList', () => {
  const testProps = {
    articles: {
      a: { id: 'a' },
      b: { id: 'b' }
    }
  };

  it('renders correctly', () => {
    const wrapper = shallow(
      <ArticleList
        {...testProps}
      />
    );

    expect(wrapper.find('ArticleContainer').length).toBe(2);
    expect(wrapper).toMatchSnapshot();
  });
});

