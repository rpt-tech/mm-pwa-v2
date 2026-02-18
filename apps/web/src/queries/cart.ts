import { gql } from 'graphql-request';

// Cart item fragment for MiniCart
export const MINI_CART_ITEM_FRAGMENT = gql`
  fragment MiniCartItemFragment on CartItemInterface {
    uid
    quantity
    prices {
      price {
        currency
        value
      }
      row_total {
        currency
        value
      }
      total_item_discount {
        value
      }
    }
    product {
      id
      uid
      name
      ecom_name
      is_alcohol
      mm_product_type
      sku
      url_key
      art_no
      canonical_url
      thumbnail {
        url
      }
      dnr_price {
        qty
        promo_label
        promo_type
        promo_amount
        promo_value
        event_id
        event_name
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
      price {
        regularPrice {
          amount {
            value
          }
        }
      }
      stock_status
      ... on ConfigurableProduct {
        variants {
          attributes {
            uid
          }
          product {
            uid
            thumbnail {
              url
            }
          }
        }
      }
    }
    ... on ConfigurableCartItem {
      configurable_options {
        configurable_product_option_uid
        option_label
        configurable_product_option_value_uid
        value_label
      }
    }
  }
`;

// Cart item fragment for CartPage
export const CART_PAGE_ITEM_FRAGMENT = gql`
  fragment CartPageItemFragment on CartItemInterface {
    comment
    uid
    id
    have_same_promotion
    have_great_deal
    quantity
    prices {
      price {
        currency
        value
      }
      row_total {
        value
      }
      total_item_discount {
        value
      }
    }
    product {
      id
      uid
      art_no
      name
      ecom_name
      is_alcohol
      mm_product_type
      sku
      url_key
      canonical_url
      thumbnail {
        url
      }
      small_image {
        url
      }
      dnr_price {
        qty
        promo_label
        promo_type
        promo_amount
        promo_value
        event_id
        event_name
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
      price {
        regularPrice {
          amount {
            value
          }
        }
      }
      stock_status
      ... on ConfigurableProduct {
        variants {
          attributes {
            uid
            code
            value_index
          }
          product {
            uid
            stock_status
            small_image {
              url
            }
          }
        }
      }
    }
    errors {
      code
      message
    }
    ... on ConfigurableCartItem {
      configurable_options {
        id
        configurable_product_option_uid
        option_label
        configurable_product_option_value_uid
        value_label
        value_id
      }
    }
  }
`;

// MiniCart fragment
export const MINI_CART_FRAGMENT = gql`
  fragment MiniCartFragment on Cart {
    id
    total_quantity
    prices {
      discounts {
        amount {
          currency
          value
        }
        label
      }
      grand_total {
        currency
        value
      }
      subtotal_excluding_tax {
        currency
        value
      }
      subtotal_including_tax {
        currency
        value
      }
      subtotal_with_discount_excluding_tax {
        currency
        value
      }
    }
    items {
      ...MiniCartItemFragment
    }
  }
  ${MINI_CART_ITEM_FRAGMENT}
`;

// Cart page fragment
export const CART_PAGE_FRAGMENT = gql`
  fragment CartPageFragment on Cart {
    id
    email
    total_quantity
    is_virtual
    applied_coupons {
      code
    }
    prices {
      discounts {
        amount {
          currency
          value
        }
        label
      }
      grand_total {
        currency
        value
      }
      subtotal_excluding_tax {
        currency
        value
      }
      subtotal_including_tax {
        currency
        value
      }
      subtotal_with_discount_excluding_tax {
        currency
        value
      }
      applied_taxes {
        amount {
          currency
          value
        }
        label
      }
    }
    items {
      ...CartPageItemFragment
    }
    available_payment_methods {
      code
      title
    }
    selected_payment_method {
      code
      title
    }
    shipping_addresses {
      firstname
      lastname
      street
      city
      region {
        code
        label
      }
      postcode
      telephone
      country {
        code
        label
      }
      available_shipping_methods {
        amount {
          currency
          value
        }
        available
        carrier_code
        carrier_title
        error_message
        method_code
        method_title
        price_excl_tax {
          value
          currency
        }
        price_incl_tax {
          value
          currency
        }
      }
      selected_shipping_method {
        amount {
          value
          currency
        }
        carrier_code
        carrier_title
        method_code
        method_title
      }
    }
  }
  ${CART_PAGE_ITEM_FRAGMENT}
`;

// Get cart details
export const GET_CART_DETAILS = gql`
  query GetCartDetails($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      ...CartPageFragment
    }
  }
  ${CART_PAGE_FRAGMENT}
`;

// Get mini cart
export const GET_MINI_CART = gql`
  query GetMiniCart($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      ...MiniCartFragment
    }
  }
  ${MINI_CART_FRAGMENT}
`;

// Get cart items count
export const GET_CART_ITEMS_COUNT = gql`
  query getCartItemsCount {
    cart {
      id
      total_quantity
    }
  }
`;

// Create empty cart
export const CREATE_CART = gql`
  mutation CreateCart {
    cartId: createEmptyCart
  }
`;

// Update cart items
export const UPDATE_CART_ITEMS = gql`
  mutation UpdateCartItems($cartId: String!, $cartItems: [CartItemUpdateInput!]!) {
    updateCartItems(input: { cart_id: $cartId, cart_items: $cartItems }) {
      cart {
        id
        ...MiniCartFragment
      }
    }
  }
  ${MINI_CART_FRAGMENT}
`;

// Remove item from cart
export const REMOVE_ITEM_FROM_CART = gql`
  mutation RemoveItemFromCart($cartId: String!, $cartItemUid: ID!) {
    removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $cartItemUid }) {
      cart {
        id
        ...MiniCartFragment
      }
    }
  }
  ${MINI_CART_FRAGMENT}
`;

// Remove all items from cart
export const REMOVE_ALL_CART_ITEMS = gql`
  mutation RemoveAllItemsFromCart($cartId: String!) {
    removeAllCartItems(input: { cart_id: $cartId }) {
      success
    }
  }
`;

// Apply coupon to cart
export const APPLY_COUPON_TO_CART = gql`
  mutation ApplyCouponToCart($cartId: String!, $couponCode: String!) {
    applyCouponToCart(input: { cart_id: $cartId, coupon_code: $couponCode }) {
      cart {
        id
        ...CartPageFragment
      }
    }
  }
  ${CART_PAGE_FRAGMENT}
`;

// Remove coupon from cart
export const REMOVE_COUPON_FROM_CART = gql`
  mutation RemoveCouponFromCart($cartId: String!) {
    removeCouponFromCart(input: { cart_id: $cartId }) {
      cart {
        id
        ...CartPageFragment
      }
    }
  }
  ${CART_PAGE_FRAGMENT}
`;

// Add comment to cart item
export const ADD_COMMENT_TO_CART_ITEM = gql`
  mutation AddCommentToCartItem($cartId: String!, $cartItemUid: ID!, $comment: String!) {
    addCommentToCartItem(input: { cart_id: $cartId, cart_item_uid: $cartItemUid, comment: $comment }) {
      cart {
        id
        items {
          uid
          comment
        }
      }
    }
  }
`;

// Check price change
export const CHECK_PRICE_CHANGE = gql`
  query CheckPriceChange($cartId: String!) {
    CheckPriceChange(cart_id: $cartId) {
      is_price_change
    }
  }
`;

// Get cross-sell products
export const GET_CROSS_SELL_PRODUCTS = gql`
  query GetCrossSellProducts($skus: [String!]!) {
    products(filter: { sku: { in: $skus } }) {
      items {
        uid
        crosssell_products {
          uid
          sku
          name
          ecom_name
          url_key
          url_suffix
          small_image {
            url
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
          stock_status
        }
      }
    }
  }
`;

