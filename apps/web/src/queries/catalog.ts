import { gql } from '@/lib/gql';

// Product fragment with all custom MM fields
export const PRODUCT_FRAGMENT = gql`
  fragment ProductFragment on ProductInterface {
    id
    uid
    name
    ecom_name
    is_alcohol
    allow_pickup
    categories {
      uid
      breadcrumbs {
        category_uid
      }
      name
    }
    mm_product_type
    unit_ecom
    url_suffix
    dnr_price_search_page {
      event_id
      event_name
    }
    art_no
    price {
      regularPrice {
        amount {
          value
          currency
        }
      }
    }
    price_range {
      maximum_price {
        final_price {
          currency
          value
        }
        regular_price {
          currency
          value
        }
        discount {
          amount_off
        }
      }
    }
    sku
    small_image {
      url
    }
    rating_summary
    stock_status
    __typename
    url_key
    canonical_url
    product_label {
      label_id
      label_description
      label_name
      label_status
      label_from_date
      label_to_date
      label_priority
      label_type
      stores
      customer_groups
      product_image {
        type
        url
        position
        display
        text
        text_color
        text_font
        text_size
        shape_type
        shape_color
        label_size
        label_size_mobile
        custom_css
        use_default
      }
      category_image {
        type
        url
        position
        display
        text
        text_color
        text_font
        text_size
        shape_type
        shape_color
        label_size
        label_size_mobile
        custom_css
      }
    }
  }
`;

// Get products with filters, sort, and pagination
export const GET_PRODUCTS = gql`
  query getProducts(
    $currentPage: Int
    $filters: ProductAttributeFilterInput!
    $pageSize: Int
    $sort: ProductAttributeSortInput
  ) {
    products(
      currentPage: $currentPage
      filter: $filters
      pageSize: $pageSize
      sort: $sort
    ) {
      items {
        ...ProductFragment
      }
      page_info {
        current_page
        page_size
        total_pages
      }
      total_count
      aggregations {
        label
        count
        attribute_code
        options {
          label
          value
          count
        }
        position
      }
      sort_fields {
        options {
          label
          value
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Get category data
export const GET_CATEGORY_DATA = gql`
  query getCategoryData($id: String!) {
    categories(filters: { category_uid: { in: [$id] } }) {
      items {
        uid
        id
        name
        image
        category_menu_background
        description
        url_key
        url_path
        meta_title
        meta_keywords
        meta_description
      }
    }
  }
`;

export const GET_CATEGORY_BY_URL_PATH = gql`
  query getCategoryByUrlPath($urlPath: String!) {
    categories(filters: { url_path: { eq: $urlPath } }) {
      items {
        uid
        id
        name
        image
        category_menu_background
        description
        url_key
        url_path
        meta_title
        meta_keywords
        meta_description
      }
    }
  }
`;

// Get product filters by category
export const GET_PRODUCT_FILTERS_BY_CATEGORY = gql`
  query getProductFiltersByCategory($categoryIdFilter: FilterEqualTypeInput!) {
    products(filter: { category_uid: $categoryIdFilter }) {
      aggregations {
        label
        count
        attribute_code
        options {
          label
          value
          count
        }
        position
      }
    }
  }
`;

// Get available sort methods
export const GET_CATEGORY_AVAILABLE_SORT_METHODS = gql`
  query getCategoryAvailableSortMethods($categoryIdFilter: FilterEqualTypeInput!) {
    products(filter: { category_uid: $categoryIdFilter }) {
      sort_fields {
        options {
          label
          value
        }
      }
    }
  }
`;

// Get filter inputs (introspection query)
export const GET_FILTER_INPUTS = gql`
  query GetFilterInputs {
    __type(name: "ProductAttributeFilterInput") {
      inputFields {
        name
        type {
          name
        }
      }
    }
  }
`;

// Search products with filters, sort, and pagination
export const PRODUCT_SEARCH = gql`
  query ProductSearch(
    $currentPage: Int = 1
    $inputText: String!
    $pageSize: Int = 24
    $filters: ProductAttributeFilterInput!
    $sort: ProductAttributeSortInput
    $asmUid: String
    $phoneNumber: String
  ) {
    products(
      currentPage: $currentPage
      pageSize: $pageSize
      search: $inputText
      filter: $filters
      sort: $sort
      asm_uid: $asmUid
      phone_number: $phoneNumber
    ) {
      items {
        ...ProductFragment
        tracking_url
      }
      is_use_smart_search
      cdp_filter {
        label
        count
        attribute_code
        options {
          label
          value
        }
        position
      }
      aggregations {
        label
        count
        attribute_code
        options {
          label
          value
        }
        position
      }
      page_info {
        total_pages
      }
      total_count
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Get autocomplete results for search
export const GET_AUTOCOMPLETE_RESULTS = gql`
  query getAutocompleteResults($inputText: String!, $asmUid: String, $pageSize: Int!) {
    products(search: $inputText, asm_uid: $asmUid, currentPage: 1, pageSize: $pageSize) {
      is_sku_redirect
      aggregations {
        label
        count
        attribute_code
        options {
          label
          value
        }
        position
      }
      items {
        art_no
        id
        uid
        sku
        name
        ecom_name
        categories {
          uid
          breadcrumbs {
            category_uid
          }
          name
        }
        unit_ecom
        is_alcohol
        mm_product_type
        stock_status
        small_image {
          url
        }
        canonical_url
        url_key
        url_suffix
        price {
          regularPrice {
            amount {
              value
              currency
            }
          }
        }
        price_range {
          maximum_price {
            final_price {
              currency
              value
            }
            regular_price {
              currency
              value
            }
            discount {
              amount_off
            }
          }
        }
      }
      page_info {
        total_pages
      }
      total_count
    }
  }
`;

// Get search suggestions
export const GET_SEARCH_SUGGESTIONS = gql`
  query getSearchSuggestions($q: String!, $asmUid: String) {
    getSearchSuggestions(q: $q, asm_uid: $asmUid) {
      suggestions {
        type
        title
      }
    }
  }
`;

// Get search term data (redirect, popularity)
export const GET_SEARCH_TERM_DATA = gql`
  query getSearchTermData($search: String) {
    searchTerm(Search: $search) {
      query_text
      redirect
      popularity
    }
  }
`;

// Get search available sort methods
export const GET_SEARCH_AVAILABLE_SORT_METHODS = gql`
  query getSearchAvailableSortMethods($search: String!) {
    products(search: $search) {
      sort_fields {
        options {
          label
          value
        }
      }
    }
  }
`;

// Get page size from store config
export const GET_PAGE_SIZE = gql`
  query getPageSize {
    storeConfig {
      store_code
      grid_per_page
    }
  }
`;

// Get flashsale products
export const GET_FLASHSALE_PRODUCTS = gql`
  query getFlashSaleProducts($pageSize: Int!) {
    getFlashSaleProducts(pageSize: $pageSize) {
      end_time
      items {
        ...ProductFragment
      }
      total_count
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Get search page meta
export const GET_SEARCH_PAGE_META = gql`
  query getSearchPageMeta {
    storeConfig {
      store_code
      search_page_meta_title
      search_page_meta_keywords
      search_page_meta_description
      search_page_description
    }
  }
`;

// Get search query description
export const SEARCH_QUERY_DESCRIPTION = gql`
  query searchQueryDescription($keyword: String!) {
    searchQueryDescription(keyword: $keyword) {
      description
    }
  }
`;
