import React from 'react';

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
  const { article, actions } = props;
  const author = actions.lookupAuthor(article.authorId);

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

export default Article;