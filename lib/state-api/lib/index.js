class StateApi {
  constructor(rawData) {
    this.data = {
      articles: this.mapIntoObject(rawData.articles),
      authors: this.mapIntoObject(rawData.authors)
    };
  }

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