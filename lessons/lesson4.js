// ***** 4.1 *****
// 01. Сохраним разметку пришедшую с сервера. Уберем на клиенте запрос данных
// --- App.js ---
// * Удалим метод ComponentDidMount
// * Удалим импорт axios и DataApi


// 02. На клиенте избавимся от отправки пустого начального состояния
// --- dom.js ---
// * Удалим пустое состояние передаваемое в initialData


// 03. На сервере необходимо вернуть не только разметку, но и начальное состояние
// --- server.js ---
// * Серверный рендер возвращает:
return {
    initialMarkup: ReactDOMServer.renderToString(
        <App initialData={initialData} />
    ),
    initialData
};


// 04. Дэв-сервер должен вернуть объект
// --- lib/server.js ---
// * Через спрэд операток возвращаем все, что возвратиться при рендере на сервере
app.get('/', async (req, res) => {
    const initialContent = await serverRender();
    res.render('index', { ...initialContent });
});


// 05. В темплэйте добавим объекты данных и разметки
// --- index.ejs ---
// * данные
<script type="text/javascript">
    window.initialData = <%- JSON.stringify(initialData) -%>
</script>
    // * разметка
    <div id="root"><%- initialMarkup -%></div>


// 06. Теперь на клиенте можно использовать данные из window.initialData
// --- dom.js ---
ReactDOM.render(
    <App initialData={window.initialData} />,
    document.getElementById('root')
);


// ***** 4.2 *****
// 01. DataApi - это сущьность, которая должна трансформироваться 
// в сторону локальной работы со всеми данными, которая будет называться store
// --- server.js ---
// * Переименуем DataApi в StateApi и добавим store
import StateApi from 'state-api';
// ...
const store = new StateApi(resp.data);
// ...
return {
    initialMarkup: ReactDOMServer.renderToString(
        <App store={store} />
    ),
    initialData: resp.data
};


// 02. На клиенте инициализируем store
// --- dom.js ---
// * Добавим:
import StateApi from 'state-api';
// ...
const store = new StateApi(window.initialData);
// ...
ReactDOM.render(
    <App store={store} />,
    document.getElementById('root')
);


// 03. App теперь может оперировать начальным состоянием полученным через
// props store
// --- App.js ---
// * Изменим state компонента. 
// * Допустим что инициализация будет определяться методом getState
state = this.props.store.getState()


// 04. Внесем изменения в state-api
// --- state-api/lib/index.js ---
// * Добавим начальные данные в конструктор
constructor(rawData) {
    this.data = {
        articles: this.mapIntoObject(rawData.articles),
        authors: this.mapIntoObject(rawData.authors)
    };
}
// * Добавим метод getState
getState = () => this.data;

// * Удалим методы getArticles и getAuthors
// * Поменяем название DataApi на StateApi
// * Поменяем название в экспорте


// 05. Теперь у нас есть объект стэйт-менеджера (StateApi)
// Мы можем выносить туда все то, что будет работать с данными
// --- state-api/lib/index.js ---
// * Добавим метод lookupAuthor
lookupAuthor = authorId => this.data.authors[authorId];
// --- App.js ---
// * Поменям работу с методом lookupAuthor из StateApi
// * Удалим articleActions
// * Поменяем props articleActions, передаваемый в ArticleList на -
store={ this.props.store }
// --- ArticleList.js ---
// * Поменяем props actions, передаваемый в Article на -
store={ props.store }
// --- Article.js ---
// * Внесем соответствующие изменения
const { article, store } = props;
const author = store.lookupAuthor(article.authorId);


// 06. Поправим тесты
// --- ArticleListTest.js ---
// * поменяем articleList на store
// --- DataApi.js ---
// * Поменяем названия DataApi на StateApi
const store = new StateApi(data);
// * Поменяем state.getArticles на store.getState().articles
// * Поменяем state.getAuthors на store.getState().authors


// ***** 4.3 *****
// 01. Проверка данных через PropTypes
// --- Article.js ---
import PropTypes from 'prop-types';
// ...
const Article = (props, context) => {};
// ...
const author = context.store.lookupAuthor(article.authorId);
// ...
Article.propTypes = {
    article: PropTypes.shape({
        title: PropTypes.string.isRequired
        body: PropTypes.string.isRequired
        date: PropTypes.string.isRequired
    })
};
// ...
Article.contextTypes = {
    store: PropTypes.object
};


// 02. Использование Context API
// --- ArticleList.js ---
// * Удалим actions={props.articleActions}
// --- App.js ---
// * Добавим в компонени class App extends React.Component { // здесь }
import PropTypes from 'prop-types';
// * childContextTypes
static childContextTypes = {
    store: PropTypes.object
};
// * getChildContext
getChildContext() {
    return {
        store: this.props.store
    };
}


// 03. Поправим тест ArticleListTest.js. Сейчас в тесте рендерится целое дерево
// компонентов со всеми потомками. Мы можем использовать shalowrendering для
// рендера только компонента ArticleList
// --- ArticleListTest.js ---
yarn add -D enzyme
// * Удалим import renderer from 'react-test-renderer';
// * Удалим store из testProps
// * Добавим
import { shallow } from 'enzyme';
import Article from '../Article';
// ...
Article.propTypes = {};
// ...
const wrapper = shallow(
    <ArticleList 
        {...testProps}
    />
);
// ...
expect(wrapper.find('Article').length).toBe(2);
expect(wrapper).toMatchSnapshot();
// * Обновим снэпшот флагом -u