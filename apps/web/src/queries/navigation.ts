import { gql } from '@/lib/gql';

export const GET_MEGA_MENU = gql`
  query getMegaMenu {
    categoryList {
      uid
      name
      children {
        uid
        include_in_menu
        name
        position
        image
        url_path
        children {
          uid
          include_in_menu
          name
          position
          url_path
          children {
            uid
            include_in_menu
            name
            position
            url_path
          }
        }
      }
    }
  }
`;

export const GET_STORE_CONFIG = gql`
  query GetStoreConfigForMegaMenu {
    storeConfig {
      store_code
      category_url_suffix
    }
  }
`;

export const GET_ROOT_CATEGORY_ID = gql`
  query getRootCategoryId {
    storeConfig {
      store_code
      root_category_uid
    }
  }
`;
