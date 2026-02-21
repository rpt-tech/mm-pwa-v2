import { gql } from '@/lib/gql';

const BLOG_ITEM_FIELDS = `
  id
  title
  url_key
  content
  short_content
  image
  image_thumb
  source_edition
  tags
  meta_title
  meta_keywords
  meta_description
  publish_date
  is_active
  views
`;

export const GET_BLOG_LIST = gql`
  query GetBlogList($sort: SortBlogInput, $currentPage: Int!, $pageSize: Int!) {
    blogList(sort: $sort, currentPage: $currentPage, pageSize: $pageSize) {
      items {
        ${BLOG_ITEM_FIELDS}
      }
      page_info {
        current_page
        page_size
        total_pages
      }
    }
  }
`;

export const GET_BLOG_DETAIL = gql`
  query GetBlogDetail($urlKey: String!) {
    blogList(urlKey: $urlKey) {
      items {
        ${BLOG_ITEM_FIELDS}
      }
    }
  }
`;

export const INCREASE_BLOG_VIEW = gql`
  mutation IncreaseBlogView($urlKey: String!) {
    increaseBlogView(input: { urlKey: $urlKey }) {
      has_increase
    }
  }
`;

export const GET_SEARCH_NEWS = gql`
  query SearchNews($search: String, $date: String, $categoryId: String, $currentPage: Int!, $pageSize: Int!) {
    searchNews(
      search: $search
      date: $date
      categoryId: $categoryId
      currentPage: $currentPage
      pageSize: $pageSize
    ) {
      items {
        ${BLOG_ITEM_FIELDS}
      }
      page_info {
        current_page
        page_size
        total_pages
      }
    }
  }
`;

export const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategory {
      categories {
        id
        name
        url_key
        blog_count
      }
    }
  }
`;

export const GET_ARCHIVED_BLOG = gql`
  query GetArchivedBlog {
    archivedBlog {
      archived_blogs {
        name
        date
        blog_count
      }
    }
  }
`;
