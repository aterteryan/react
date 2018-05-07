// ***** 8.1 *****
// Сейчас наш бандл весит неприлично много. Это частично
// связано с дев-режимом, в котором разрабатывалось
// приложение. Об этом среди прочего свидетельствует
// иконка реакта в браузере.

// 01. Первое, что необходимо сделать перед деплоем - 
// проверить тесты. Проверку тестов можно автоматизировать
// через git hooks, либо (что более предпочтительно)
// привязать проверку тестов к CI (например Travis CI).
// Так же имеет смысл проверять coverage report по тестам
// * Добавим в секцию скриптов
"coverage": "jest --coverage",
    "build": "webpack -p"

// 02. Стоит разделить бандл на 2 части: библиотеки вендеров,
// наш код. С этим нам поможет webpack
// --- webpack.config.js ---
const webpack = require('webpack');

entry: {
    vendor: [
        'babel-polyfill',
        'react',
        'react-dom',
        'prop-types',
        'axios',
        'lodash.debounce',
        'lodash.pickby'
    ],
        app: ['./lib/renderers/dom.js']
},
output: {
    path: path.resolve(__dirname, 'public'),
        filename: '[name].js'
}
// ...
plugins: [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor'
    })
]

    // --- index.ejs ---
    <script src = "/vendor.js" charset = "utf-8" ></script>
    <script src="/app.js" charset="utf-8"></script>

// 03. Перед деплоем необходимо минифицировать бандл
// для этого воспользуемся командой в скриптах
// "build": "webpack -p" При этом размер наших бандлов
// существенно измениться.

// 04. Нам так же понадобиться скомпелировать код для
// node js, т.к. мы использовали некоторые особенности
// языка, которые не поддерживаются в этом окружении
// Создадим новый скрипт "build-node": "babel lib -d build --copy-files"
// Но надо понимать, что для окружения node js нам не
// понадобисть все то же самое, что и для браузера, т.к.
// в этом окружении уже есть много из того, что пока
// не используется во всех браузерах, это значит,
// что нам нужен отдельный babel конфиг для node js
// * В package.json поменяем секцию для babel
"babel": {
    "presets": [
        "react",
        ["env", { "targets": { "node": "current" } }]
    ],
        "plugins": [
            "transform-class-properties",
            "transform-object-rest-spread"
        ]
}
// *  Поменяем конфигурацию сборки для браузера
// ---webpack.config.js ---
module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: ['babel-loader', 'eslint-loader'],
                options: {
                    presets: ['react', 'env', 'stage-2']
                }
            }
        }
    ]
}

// Последний шаг оптимизации - это использование всех ядер cpu
// при деплое на прод сервер. В ноде есть модуль, который
// называется cluster, pm2 который мы используем - это обертка
// над этим модулем, при этом он может сам выступать
// балансировщиком распределения нагрузки на процессы
// создадим новый скрипт для работы приложения в проде
"start-prod": "NODE_ENV=production NODE_PATH=./build pm2 start build/server.js -i max --name appProd"
// Далее запускаем скрипт