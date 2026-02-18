import { gql } from 'graphql-request';

// Fragments
export const CHECKOUT_PAGE_FRAGMENT = gql`
  fragment CheckoutPageFragment on Cart {
    id
    email
    is_virtual
    applied_coupons {
      code
    }
    prices {
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
      discounts {
        amount {
          currency
          value
        }
        label
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
      uid
      product {
        uid
        name
        sku
        thumbnail {
          url
        }
      }
      prices {
        price {
          currency
          value
        }
      }
      quantity
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
      country {
        code
        label
      }
      telephone
      postcode
      available_shipping_methods {
        amount {
          currency
          value
        }
        available
        carrier_code
        carrier_title
        method_code
        method_title
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
`;

export const ITEMS_REVIEW_FRAGMENT = gql`
  fragment ItemsReviewFragment on Cart {
    id
    total_quantity
    items {
      uid
      comment
      product {
        art_no
        uid
        sku
        ecom_name
        name
        is_alcohol
        id
        dnr_price {
          qty
          promo_label
          promo_type
          promo_amount
          promo_value
          event_id
          event_name
        }
        thumbnail {
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
      }
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
      quantity
      ... on ConfigurableCartItem {
        configurable_options {
          configurable_product_option_uid
          option_label
          configurable_product_option_value_uid
          value_label
        }
      }
    }
  }
`;

// Get customer addresses
export const GET_CUSTOMER_ADDRESSES = gql`
  query GetCustomerAddresses {
    customer {
      email
      firstname
      lastname
      addresses {
        id
        uid
        firstname
        lastname
        street
        city
        city_code
        ward
        ward_code
        region {
          region_code
          region_id
          region
        }
        country_code
        postcode
        telephone
        default_shipping
        default_billing
      }
    }
  }
`;

// Get checkout details
export const GET_CHECKOUT_DETAILS = gql`
  query GetCheckoutDetails($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      customer_no
      pickup_location {
        pickup_location_code
        name
        latitude
        longitude
        pickup_direction_url
        city_id
        ward_id
        street
        phone
      }
      ...CheckoutPageFragment
      ...ItemsReviewFragment
      prices {
        grand_total {
          value
          currency
        }
        subtotal_excluding_tax {
          currency
          value
        }
        discounts {
          amount {
            currency
            value
          }
          label
        }
      }
    }
  }
  ${CHECKOUT_PAGE_FRAGMENT}
  ${ITEMS_REVIEW_FRAGMENT}
`;

// Get order details before placing order
export const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      email
      billing_address {
        firstname
        lastname
        street
        city
        region {
          code
          label
        }
        country {
          code
          label
        }
        telephone
        postcode
      }
      shipping_addresses {
        firstname
        lastname
        street
        city
        city_code
        ward
        ward_code
        region {
          code
          label
        }
        country {
          code
          label
        }
        telephone
        postcode
        selected_shipping_method {
          carrier_code
          carrier_title
          method_code
          method_title
          amount {
            value
            currency
          }
        }
      }
      items {
        uid
        product {
          uid
          name
          sku
          art_no
          ecom_name
          thumbnail {
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
            }
          }
        }
        prices {
          price {
            currency
            value
          }
          row_total {
            value
            currency
          }
          total_item_discount {
            value
          }
        }
        quantity
      }
      available_payment_methods {
        code
        title
        note
        available
      }
      selected_payment_method {
        code
        title
      }
      applied_coupons {
        code
      }
      prices {
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
        discounts {
          amount {
            currency
            value
          }
          label
        }
        applied_taxes {
          amount {
            currency
            value
          }
          label
        }
      }
    }
  }
`;

// Set guest email on cart
export const SET_GUEST_EMAIL = gql`
  mutation SetGuestEmailOnCart($cartId: String!, $email: String!) {
    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart {
        id
        email
      }
    }
  }
`;

// Set shipping address on cart
export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddressesOnCart($cartId: String!, $shippingAddresses: [ShippingAddressInput!]!) {
    setShippingAddressesOnCart(input: { cart_id: $cartId, shipping_addresses: $shippingAddresses }) {
      cart {
        id
        shipping_addresses {
          firstname
          lastname
          street
          city
          city_code
          ward
          ward_code
          region {
            code
            label
          }
          country {
            code
            label
          }
          telephone
          postcode
          available_shipping_methods {
            amount {
              currency
              value
            }
            available
            carrier_code
            carrier_title
            method_code
            method_title
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
    }
  }
`;

// Set billing address on cart
export const SET_BILLING_ADDRESS = gql`
  mutation SetBillingAddressOnCart($cartId: String!, $billingAddress: BillingAddressInput!) {
    setBillingAddressOnCart(input: { cart_id: $cartId, billing_address: $billingAddress }) {
      cart {
        id
        billing_address {
          firstname
          lastname
          street
          city
          region {
            code
            label
          }
          country {
            code
            label
          }
          telephone
          postcode
        }
      }
    }
  }
`;

// Set shipping method on cart
export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethodsOnCart($cartId: String!, $shippingMethods: [ShippingMethodInput!]!) {
    setShippingMethodsOnCart(input: { cart_id: $cartId, shipping_methods: $shippingMethods }) {
      cart {
        id
        shipping_addresses {
          selected_shipping_method {
            carrier_code
            method_code
            carrier_title
            method_title
            amount {
              value
              currency
            }
          }
        }
        prices {
          grand_total {
            value
            currency
          }
        }
      }
    }
  }
`;

// Set payment method on cart
export const SET_PAYMENT_METHOD = gql`
  mutation SetPaymentMethodOnCart($cartId: String!, $paymentMethod: PaymentMethodInput!) {
    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: $paymentMethod }) {
      cart {
        id
        selected_payment_method {
          code
          title
        }
      }
    }
  }
`;

// Get available payment methods
export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods($cartId: String!) {
    cart(cart_id: $cartId) {
      id
      available_payment_methods {
        code
        title
        note
        available
      }
      selected_payment_method {
        code
        title
      }
    }
  }
`;

// Place order (MM custom with orderV2)
export const PLACE_ORDER = gql`
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      orderV2 {
        id
        number
        status
        payment_methods {
          name
          type
          pay_url
        }
      }
      errors {
        message
        code
      }
    }
  }
`;

// Get Vietnam location data (custom MM endpoints)
export const GET_CITIES = gql`
  query GetCities {
    getCities {
      city_id
      default_name
      country_id
    }
  }
`;

export const GET_DISTRICTS = gql`
  query GetDistricts($cityId: Int!) {
    getDistrict(city_id: $cityId) {
      district_id
      default_name
      city_id
    }
  }
`;

export const GET_WARDS = gql`
  query GetWards($districtId: Int!) {
    getWard(district_id: $districtId) {
      ward_id
      default_name
      district_id
    }
  }
`;
