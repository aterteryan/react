// ***** 6.1 *****
// 01. Добавим компонент SearchBar
// --- components/SearchBar.js ---
import React from 'react';
import debounce from 'lodash.debounce';

class SearchBar extends React.Component {
    state = {
        searchTerm: ''
    };

    doSearch = debounce(() => {
        this.props.doSearch(this.state.searchTerm)
    }, 300);

    handleSearch = (event) => {
        this.setState(
            { searchTerm: event.target.value },
            this.doSearch
        )
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

export default SearchBar;


// 02. Добавим SearchBar в App.js
// --- App.js ---
import SearchBar from './SearchBar';
import pickBy from 'lodash.pickby';
//...
setSearchTerm = (searchTerm) => {
    this.setState({ searchTerm });
};

render() {
    let { articles, searchTerm } = this.state;
    if (searchTerm) {
        articles = pickBy(articles, (value) => {
            return value.title.match(searchTerm)
                || value.body.match(searchTerm);
        });
    }

    return <div>
        <SearchBar doSearch={this.setSearchTerm} />
        <ArticleList
            articles={articles}
            store={this.props.store}
        />
    </div>;
}

// 03. Добавим в StateApi searchTerm
// --- state-api/lib/index.js ---
this.data = {
    articles: this.mapIntoObject(rawData.articles),
    authors: this.mapIntoObject(rawData.authors),
    searchTerm: ''
};


// ***** 6.2 *****
// 01. Сейчас мы подписываемся на стор, но изменения применяем
// в локальном стэйте компонента. Наша задача - избавиться от
// локальных состояний и подписываться на изменения в общем
// сторе (в нашем случае это StateApi)
// --- App.js ---
// * Удалим
setSearchTerm = (searchTerm) => {
    this.setState({ searchTerm });
};
// * Добавим
<SearchBar doSearch={this.props.store.setSearchTerm} />
// ...
onStoreChange = () => {
    this.setState(this.props.store.getState());
};

componentDidMount() {
    this.subscriptionId = this.props.store.subscribe(this.onStoreChange);
}

componentWillUnmount() {
    this.props.store.unsubscribe(this.subscriptionId);
}
// --- state-api/lib/index.js ---
// * Добавим
setSearchTerm = (searchTerm) => {
    this.data.searchTerm = searchTerm;
};
// ...
this.subscriptions = {};
this.lastSubscriptionId = 0;

subscribe = (cb) => {
    this.lastSubscriptionId++;
    this.subscriptions[this.lastSubscriptionId] = cb;
    return this.lastSubscriptionId;
};

unsubscribe = (subscriptionId) => {
    delete this.subscriptions[subscriptionId]
};

notifySubscribers = () => {
    Object.values(this.subscriptions).forEach((cb) => cb());
};

mergeWithState = (stateChange) => {
    this.data = {
        ...this.data,
        ...stateChange
    }
    this.notifySubscribers();
};

setSearchTerm = (searchTerm) => {
    this.mergeWithState({
        searchTerm
    });
};


// ***** 6.3 *****
// 01. Добавим Timestamp.js
// --- components/Timestamp.js ---
import React from 'react';

class Timestamp extends React.Component {
    render() {
        return <div>
            {this.props.timestamp.toString()}
        </div>;
    }
}

export default Timestamp;


// 02. Добавим Timestamp в App.js
// --- App.js ---
import Timestamp from './Timestamp';
// ...
render() {
    let { articles, searchTerm } = this.state;
    if (searchTerm) {
        articles = pickBy(articles, (value) => {
            return value.title.match(searchTerm)
                || value.body.match(searchTerm);
        });
    }

    return <div>
        <Timestamp timestamp={this.state.timestamp} />
        <SearchBar doSearch={this.setSearchTerm} />
        <ArticleList
            articles={articles}
            store={this.props.store}
        />
    </div>;
}


// 03. Добавим timestamp в стор
// --- state-api/lib/index.js ---
this.data = {
    articles: this.mapIntoObject(rawData.articles),
    authors: this.mapIntoObject(rawData.authors),
    searchTerm: '',
    timestamp: new Date()
};

// * Добавим метод startClock
startClock = () => {
    setInterval(() => {
        this.mergeWithState({
            timestamp: new Date()
        });
    }, 1000)
};
// --- App.js ---
// * Добавим старт таймера в componentDidMount
componentDidMount() {
    this.subscriptionId = this.props.store.subscribe(this.onStoreChange);
    this.props.store.startClock();
}


// ***** 6.4 *****
// 01. Сейчас TimeStamp компонент получает обновленное состояние из через props
// из компонента App, в целом этот компонент может оставаться презентационным,
// но допустим, что мы хотим воспользоваться им еще где-то в приложении и нам
// надо обращаться к его состоянию. Для этого мы можем обернуть компонент в
// storeProvider, чтобы TimeStamp подписывался на данные из стора сам
// --- components/Timestamp.js ---
// * Добавим
import storeProvider from './storeProvider';
// ...
render() {
    return <div>
        {this.props.timestamp.toString()}
    </div>;
}
// ...
function extraProps(store) {
    return {
        timestamp: store.getState().timestamp
    };
}
// ...
export default storeProvider(extraProps)(Timestamp)
// --- App.js ---
// * Уберем из TimeStamp prop timestamp из render() {}, т.к. он будет доступен нам через
// extraProps в самом компоненте


// 02. Сейчас App перерендеривает все дочерние компоненты даже если внутни них не
// обновляются props на новые значения. Это происходит потому, что App подписан на
// глобальный стор, если в нем происходят изменения то все внутри render() App должно
// реагировать на эти изменения. Это можно поправить в storeProvider возвратив из него
// компонент-обертку, унаследованную от PureComponent
// --- storeProvider.js ---
// * Изменим
const storeProvider = (extraProps) => (Component) => {
    return class extends React.PureComponent{}
} 
// * Теперь необходимо добавить возможность в storeProvider подписываться на изменения
// в store
onStoreChange = () => {
    this.forceUpdate();
};

componentDidMount() {
    this.subscriptionId = this.context.store.subscribe(this.onStoreChange);
}

componentWillUnmount() {
    this.context.store.unsubscribe(this.subscriptionId)
}

// 03. Рефакторинг
// Поправим компонент SearchBar. Этот компонент может так же смотреть на данные
// из нашего общего стора
// --- App.js ---
// * Уберем из render() у SearchBar prop doSearch
// * Сделаем поиск по строкам не зависящим от регистра набота
render() {
    let {articles, searchTerm} = this.state;
    const searchRE = new RegExp(searchTerm, 'i');
    if (searchTerm) {
        articles = pickBy(articles, (value) => {
            return value.title.match(searchRE)
            || value.body.match(searchRE)
        });
    }
    // ...
}

// --- SearchBar.js ---
// * Добавим
import storeProvider from './storeProvider';
// ...
doSearch = debounce(() => {
    this.props.store.setSearchTerm(this.state.searchTerm);
});
// ...
export default storeProvider()(SearchBar);
// --- storeProvider.js ---
// * Сделаем extraProps опциональной функцией
const storeProvider = (extraProps = () => ({})) => //...
// ...
onStoreChange = () => {
    if (this.subscriptionId) {
        this.forceUpdate();
    }
}
// ...
componentWillUnmount() {
    this.context.store.unsubscribe(this.subscriptionId);
    this.subscriptionId = null;
}


/////////////////////////////////
////////// Components ///////////
/////////////////////////////////

// SearchBar.js
import React from 'react';
import debounce from 'lodash.debounce';
import storeProvider from './storeProvider';

class SearchBar extends React.Component {
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

// App.js
import React from 'react';
import ArticleList from './ArticleList';
import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import pickBy from 'lodash.pickby';
import Timestamp from './Timestamp';

class App extends React.Component {
  static childContextTypes = {
    store: PropTypes.object
  };

  getChildContext() {
    return {
      store: this.props.store
    };
  }

  state = this.props.store.getState();

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
      />
    </div>;
  }
}

export default App;

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

// Timestamp.js
import React from 'react';
import storeProvider from './storeProvider';

class Timestamp extends React.Component {
  render() {
    return <div>
      {this.props.timestamp.toString()}
    </div>;
  }
}

function extraProps(store) {
  return {
    timestamp: store.getState().timestamp
  };
}

export default storeProvider(extraProps)(Timestamp);

// storeProvider.js
import React from 'react';
import PropTypes from 'prop-types';

const storeProvider = (extraProps = () => ({})) => (Component) =>
  class extends React.PureComponent {
    static displayName = `${Component.name}Container`;
    static contextTypes = { store: PropTypes.object };

    onStoreChange = () => {
      if (this.subscriptionId) {
        this.forceUpdate();
      }
    }

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
        {...extraProps(this.context.store, this.props)}
        store={this.context.store}
      />;
    }
  };

export default storeProvider;

