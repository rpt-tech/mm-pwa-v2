import { gql } from 'graphql-request';

export const GET_POPULAR_KEYWORDS = gql`
  query getPopularKeywords {
    getPopularKeywords {
      items {
        name
        url
        url_pwa
      }
      total_count
      version
      history_max
    }
  }
`;
