import { gql } from '@/lib/gql';
import { PRODUCT_FRAGMENT } from './fragments';

export const GET_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetProducts($filters: ProductAttributeFilterInput, $pageSize: Int, $currentPage: Int) {
    products(filter: $filters, pageSize: $pageSize, currentPage: $currentPage) {
      items {
        ...ProductFragment
      }
      page_info {
        current_page
        page_size
        total_pages
      }
      total_count
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddProductToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        id
        items {
          uid
          product {
            uid
            name
            sku
          }
          quantity
        }
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const UPDATE_CART_ITEMS = gql`
  mutation UpdateCartItems($cartId: String!, $cartItems: [CartItemUpdateInput!]!) {
    updateCartItems(input: { cart_id: $cartId, cart_items: $cartItems }) {
      cart {
        id
        items {
          uid
          product {
            uid
            name
            sku
          }
          quantity
        }
      }
    }
  }
`;

export const CREATE_CART = gql`
  mutation CreateCart {
    cartId: createEmptyCart
  }
`;

export const GET_CART = gql`
  query GetCart($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      items {
        uid
        product {
          uid
          name
          sku
        }
        quantity
      }
      prices {
        grand_total {
          value
          currency
        }
      }
    }
  }
`;
