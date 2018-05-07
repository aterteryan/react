// ***** 7.1 *****
// --- components/SearchBar.js ---
// * Добавим 2 метода жизненного цикла (ж/ц)
shouldComponentUpdate(nextProps, nextState) {
    return true;
}

componentWillUpdate(nextProps, nextState) {
    console.log('Updating SearchBar');
}
// * В консоли браузера можно увидеть, что
// компонент обновляется каждую секуну.
// * Можем заменить наследование этого компонента
// на React.PureComponent, в этом случае, если
// в компоненте старые и новые значения
// props и state совпадают, то SearchBar не будет
// обновляться без необходимости
// * Удалим метод shouldComponentUpdate
// * Проверим консоль


// --- Timestamp.js ---
// * Поменяем отображение времени так, чтобы
// показывались только часы и минуты
timeDisplay = timestamp =>
    timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

render() {
    return <div>
        {this.timeDisplay(this.props.timestamp)}
    </div>;
}
// * Если мы добавим, 
componentWillUpdate(nextProps, nextState) {
    console.log('Updating Timestamp');
}

// * Явно укажим в shouldComponentUpdate
// * в каких случаях нужно перерендеривать 
// компонент при изменении времени

shouldComponentUpdate(nextProps, nextState) {
    return (
        this.timeDisplay(this.props.timestamp) !==
        this.timeDisplay(nextProps.timestamp)
    );
}


// ***** 7.2 *****
// В chrome на вкладке Performance можно посмотреть
// много полезных метрик, если добавить в строку поиска
?react_perf
// В секции User Timing можно увидить за сколько
// отрендерились, обновились и были удалены из DOM
// наши компоненты


// ***** 7.3 *****
// React предоставляет еще больше возможностей для 
// мониторинга состояния приложения через библиотеку
// react-addons-perf -> yarn add -D react-addons-perf

// --- App.js ---
// * Добавим
import Perf from 'react-addons-perf';

if (typeof window !== 'undefined') {
    window.Perf = Perf;
}

componentDidMount() {
    this.subscriptionId = this.props.store.subscribe(this.onStoreChange);
    this.props.store.startClock();

    setImmediate(() => {
        Perf.start();
    });

    setTimeout(() => {
        Perf.stop();
        Perf.printWasted();
    }, 5000);
}
// Мы увидим большое количество избыточных рендеров
// В идеале их вообще не должно быть.
// Постараемся все поправить

// --- ArticleList.js ---
// Т.к. этот компонент написан в виде функции, он
// не оптимизирован, а значит будет перерендериваться
// всякий раз при изменении состояния.
// Есть две стратегии избегания ненужных перерендеров
// в этом случае:
// 1 - вызвать ArticleList в качестве функции в App
// {ArticleList({ articles })}, но во вкладке react
// мы больше не увидем название этого компонента,
// что может помешать при отладке
// 2 - Использовать PureComponent
import React from 'react';
import Article from './Article';

class ArticleList extends React.PureComponent {
    render() {
        return <div>
            {Object.values(this.props.articles).map((article) =>
                <Article
                    key={article.id}
                    article={article}
                />
            )}
        </div>;
    }

}

export default ArticleList;

// --- Article.js ---
// * Перепишем на PureComponent
import React from 'react';
import PropTypes from 'prop-types';
import storeProvider from './storeProvider';

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

const dateDisplay = (dateString) =>
    new Date(dateString).toDateString();

class Article extends React.PureComponent {
    render() {
        const { article, author } = this.props;
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
    }

}

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

// --- App.js ---
// * Унаследуем этот компонент так же от PureComponent
// Данные в сторе, с которыми действительно работает
// App - это articles и searchTerm, тем не менее, этот
// компонент подписан на все обновления из стора. Из-за
// этого происходят ненужные перерендеры.
// Есть 2 способа решения задачи на этом уровне:
// 1 - использовать shouldComponentUpdate
shouldComponentUpdate(nextProps, nextState) {
    return (
        nextState.articles !== this.state.articles
        || nextState.searchTerm !== this.state.searchTerm
    );
}
// Этот способ не очень масштабируем, т.к. в дальнейшем
// компонент App может начать использовать что-то еще из
// стора
// 2 - подписаться только на ту часть стора, которая
// действительно нужна компоненту App
appState = () => {
    const {articles, searchTerm} = this.props.store.getState();
    return {articles, searchTerm};
};
// * Заменим подписку на нужные нам участки стора
state = this.appState();

onStoreChange = () => {
    this.setState(this.appState); // ? this.appState()
};

// Если посмотреть на компоненты то достаточно очевидно
// почему перерендериваются компоненты-контейнеры. Мы
// сами указали им делать форсапдэйт если состояние
// стора изменилось.
// --- storeProvider.js ---
usedState = () => {
    return extraProps(this.context.store, this.props);
};

state = this.usedState();

onStoreChange = () => {
    if (this.subscriptionId) {
        this.setState(this.usedState());
    }
};

render() {
    return <Component 
        {...this.props}
        {...this.usedState()}
        store={this.context.store}
    />;
}

// --- Timestamp.js ---
// * Удалим shouldComponentUpdate
// * Поменяем render
render() {
    return <div>
        {this.props.timestampDisplay}
    </div>;
}
// * Сделаем метод timeDisplay статичным методом
// компонента -> static timeDisplay = timestamp => ...
// * Поменяем extraProps
function extraProps(store) {
    return {
        timestampDisplay: Timestamp.timeDisplay(store.getState().timestamp)
    }; 
}

// * После того как мы избавились от всех ненужных
// перерендеров можно удалить Perf из App, т.к. этот
// код нужен был только для отладки.
// Можно так же использовать пакет why-did-you-update
// для этих целей.


// ***** 7.4 *****
// Даже не смотря на то, что мы используем PureComponent
// есть еще одна проблема которую не сможет отловить
// shouldCompoenentUpdate - это иммутабельные струкруры
// данных такие как массивы и объекты. Рассмотрим
// проблему на примере
// --- state-api/lib/index.js ---
// * Напишим код, который будет добавлять новую статью
// через 1 сек в объек articles (в constructor)
setTimeout(() => {
    const fakeArticle = {
        ...rawData.articles[0],
        id: 'fakeArticleId'
    };
    this.data.articles[fakeArticle.id] = fakeArticle;
    this.notifySubscribers();
}, 1000);
// Ничего не произойдет, т.к. PureComponent увидет ту же
// ссылку в памяти на объект, который был ранее и не вызовит
// перерендер. Для того, чтобы добавить новую статью по
// предыдущему сценарию, надо копировать объект
setTimeout(() => {
    const fakeArticle = {
        ...rawData.articles[0],
        id: 'fakeArticleId'
    };
    this.data = {
        ...this.data,
        articles: {
            ...this.data.articles,
            [fakeArticle.id]: fakeArticle
        }
    };
    this.notifySubscribers();
}, 1000);
// Таким образом новые данные не равны предыдущим данным, 
// это две разные ссылки в памяти.
// Для упрощения работы с подобными данными, имеет
// смысл использовать такую библиотеку как immutable



/////////////////////////////////
////////// Components ///////////
/////////////////////////////////

// state-api/lib/index.js
class StateApi {
    constructor(rawData) {
      this.data = {
        articles: this.mapIntoObject(rawData.articles),
        authors: this.mapIntoObject(rawData.authors),
        searchTerm: '',
        timestamp: new Date()
      };
      this.subscriptions = {};
      this.lastSubscriptionId = 0;
  
      setTimeout(() => {
        const fakeArticle = {
          ...rawData.articles[0],
          id: 'fakeArticleId'
        };
        this.data = {
          ...this.data,
          articles: {
            ...this.data.articles,
            [fakeArticle.id]: fakeArticle
          }
        };
        this.notifySubscribers();
      }, 1000);
    }
  
    startClock = () => {
      setInterval(() => {
        this.mergeWithState({
          timestamp: new Date()
        });
      }, 1000);
    };
  
    subscribe = (cb) => {
      this.lastSubscriptionId++;
      this.subscriptions[this.lastSubscriptionId] = cb;
      return this.lastSubscriptionId;
    };
  
    unsubscribe = (subscriptionId) => {
      delete this.subscriptions[subscriptionId];
    };
  
    notifySubscribers = () => {
      Object.values(this.subscriptions).forEach((cb) => cb());
    };
  
    mergeWithState = (stateChange) => {
      this.data = {
        ...this.data,
        ...stateChange
      };
      this.notifySubscribers();
    };
  
    setSearchTerm = (searchTerm) => {
      this.mergeWithState({
        searchTerm
      });
    };
  
    getState = () => this.data;
  
    lookupAuthor = (authorId) => this.data.authors[authorId];
  
    mapIntoObject = (arr) => {
      return arr.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {});
    };
  }
  
  export default StateApi;


// storeProvider.js
import React from 'react';
import PropTypes from 'prop-types';

const storeProvider = (extraProps = () => ({})) => (Component) =>
  class extends React.PureComponent {
    static displayName = `${Component.name}Container`;
    static contextTypes = { store: PropTypes.object };

    usedState = () => {
      return extraProps(this.context.store, this.props);
    };

    state = this.usedState();

    onStoreChange = () => {
      if (this.subscriptionId) {
        this.setState(this.usedState());
      }
    };

    componentDidMount() {
      this.subscriptionId = this.context.store.subscribe(this.onStoreChange);
    }

    componentWillUnmount() {
      this.context.store.unsubscribe(this.subscriptionId);
      this.subscriptionId = null;
    }

    render() {
      return <Component
        {...this.props}
        {...this.usedState()}
        store={this.context.store}
      />;
    }
  };

export default storeProvider;

// Timestamp.js
import React from 'react';
import storeProvider from './storeProvider';

class Timestamp extends React.Component {
  static timeDisplay = (timestamp) =>
    timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  render() {
    return <div>
      {this.props.timestampDisplay}
    </div>;
  }
}

function extraProps(store) {
  return {
    timestampDisplay: Timestamp.timeDisplay(store.getState().timestamp)
  };
}

export default storeProvider(extraProps)(Timestamp);

// SearchBar.js
import React from 'react';
import debounce from 'lodash.debounce';
import storeProvider from './storeProvider';

class SearchBar extends React.PureComponent {
  state = {
    searchTerm: ''
  };

  doSearch = debounce(() => {
    this.props.store.setSearchTerm(this.state.searchTerm);
  });

  handleSearch = (event) => {
    this.setState(
      { searchTerm: event.target.value },
      this.doSearch
    );
  };

  render() {
    return (
      <input
        value={this.state.searchTerm}
        type="search"
        placeholder="Enter search term"
        onChange={this.handleSearch}
      />
    );
  }
}

export default storeProvider()(SearchBar);

// ArticleList.js
import React from 'react';
import Article from './Article';

class ArticleList extends React.PureComponent {
  render() {
    return <div>
      {Object.values(this.props.articles).map((article) =>
        <Article
          key={article.id}
          article={article}
        />
      )}
    </div>;
  }

}

export default ArticleList;

// App.js
import React from 'react';
import ArticleList from './ArticleList';
import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import pickBy from 'lodash.pickby';
import Timestamp from './Timestamp';

class App extends React.PureComponent {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return {
      store: this.props.store
    };
  }

  onStoreChange = () => {
    this.setState(this.props.store.getState());
  };

  componentDidMount() {
    this.subscriptionId = this.props.store.subscribe(this.onStoreChange);
    this.props.store.startClock();
  }

  componentWillUnmount() {
    this.props.store.unsubscribe(this.subscriptionId);
  }

  appState = () => {
    const { articles, searchTerm } = this.props.store.getState();
    return { articles, searchTerm };
  };

  state = this.appState();

  onStoreChange = () => {
    this.setState(this.appState); // ? this.appState()
  };

  render() {
    let { articles, searchTerm } = this.state;
    const searchRE = new RegExp(searchTerm, 'i');
    if (searchTerm) {
      articles = pickBy(articles, (value) => {
        return value.title.match(searchRE)
          || value.body.match(searchRE);
      });
    }

    return <div>
      <Timestamp />
      <SearchBar />
      <ArticleList
        articles={articles}
        store={this.props.store}
      />
    </div>;
  }
}

export default App;

// Article.js
import React from 'react';
import PropTypes from 'prop-types';
import storeProvider from './storeProvider';

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

const dateDisplay = (dateString) =>
  new Date(dateString).toDateString();

class Article extends React.PureComponent {
  render() {
    const { article, author } = this.props;
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
  }

}

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
