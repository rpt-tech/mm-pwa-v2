import { gql } from '@apollo/client';

export const GET_CART_ITEMS_COUNT = gql`
  query getCartItemsCount {
    cart {
      id
      total_quantity
    }
  }
`;
