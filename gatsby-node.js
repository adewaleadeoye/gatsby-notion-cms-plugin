const axios = require('axios').default;
const { URL } = require('url');

const getNotionArticles = async (
  baseUrl,
  notion_secret,
  notion_database_id
) => {
  try {
    const resp = await axios({
      url: `${baseUrl}/databases/${notion_database_id}/query`,
      method: 'POST',
      headers: {
        authorization: `Bearer ${notion_secret}`,
        'Notion-Version': '2022-02-22',
      },
    });

    return resp.data?.results.map((result) => {
      return {
        id: result.id,
        title: result.properties.Name.title[0].text.content,
        excerpt: result.properties.Description.rich_text[0].text.content,
        date: result.properties.Date.rich_text[0].text.content,
        image: result.properties.Image.files[0].file.url,
        url: new URL(result.url).pathname,
      };
    });
  } catch (err) {
    console.error(err);
  }
};

exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId },
  { baseUrl, notion_secret, notion_database_id, articleType }
) => {
  const ARTICLE_TYPE = articleType;
  const articles = await getNotionArticles(
    baseUrl,
    notion_secret,
    notion_database_id
  );
  for (const article of articles) {
    actions.createNode({
      ...article,
      id: createNodeId(`${ARTICLE_TYPE}-${article.id}`),
      parent: null,
      children: [],
      internal: {
        type: ARTICLE_TYPE,
        contentDigest: createContentDigest(article),
      },
    });
  }
};

exports.onPreInit = () => console.log('Loaded gatsby-starter-plugin');
