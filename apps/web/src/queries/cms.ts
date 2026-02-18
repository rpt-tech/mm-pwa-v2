/**
 * CMS GraphQL Queries
 * Queries for CMS pages and blocks
 */

export const GET_CMS_PAGE = `
  query getCmsPage($identifier: String!) {
    cmsPage(identifier: $identifier) {
      identifier
      url_key
      title
      content
      content_heading
      page_layout
      meta_title
      meta_description
      meta_keywords
    }
  }
`;

export const GET_CMS_BLOCKS = `
  query getCmsBlocks($identifiers: [String]!) {
    cmsBlocks(identifiers: $identifiers) {
      items {
        identifier
        title
        content
      }
    }
  }
`;

export const GET_URL_RESOLVER = `
  query getUrlResolver($url: String!) {
    urlResolver(url: $url) {
      id
      type
      relative_url
      redirectCode
      ... on CmsPage {
        identifier
        url_key
        title
        content
        content_heading
        page_layout
        meta_title
        meta_description
      }
      ... on CategoryTree {
        uid
        name
        url_path
        url_key
      }
      ... on ProductInterface {
        uid
        sku
        name
        url_key
      }
    }
  }
`;
