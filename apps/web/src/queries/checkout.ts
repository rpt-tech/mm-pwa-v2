import { gql } from '@apollo/client';

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

// Get available countries and regions
export const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      id
      two_letter_abbreviation
      full_name_locale
      available_regions {
        id
        code
        name
      }
    }
  }
`;

// Get Vietnam districts/wards (custom Magento endpoints)
export const GET_REGIONS_BY_COUNTRY = gql`
  query GetRegionsByCountry($countryCode: String!) {
    country(id: $countryCode) {
      id
      full_name_locale
      available_regions {
        id
        code
        name
      }
    }
  }
`;

// Get districts by region
export const GET_DISTRICTS = gql`
  query GetDistricts($regionId: Int!) {
    getDistrict(region_id: $regionId) {
      district_id
      default_name
      region_id
    }
  }
`;

// Get wards by district
export const GET_WARDS = gql`
  query GetWards($districtId: Int!) {
    getWard(district_id: $districtId) {
      ward_id
      default_name
      district_id
    }
  }
`;

// Set guest email on cart
export const SET_GUEST_EMAIL = gql`
  mutation SetGuestEmailOnCart($cartId: String!, $email: String!) {
    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart {
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
          region {
            code
            label
          }
          country {
            code
            label
          }
          telephone
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

// Get available payment methods
export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods($cartId: String!) {
    cart(cart_id: $cartId) {
      available_payment_methods {
        code
        title
      }
      selected_payment_method {
        code
        title
        purchase_order_number
      }
    }
  }
`;

// Set payment method on cart
export const SET_PAYMENT_METHOD = gql`
  mutation SetPaymentMethodOnCart($cartId: String!, $paymentMethod: PaymentMethodInput!) {
    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: $paymentMethod }) {
      cart {
        selected_payment_method {
          code
          title
        }
      }
    }
  }
`;

// Place order
export const PLACE_ORDER = gql`
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
        order_id
      }
    }
  }
`;

// Get order details after placement
export const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($orderNumber: String!) {
    customer {
      orders(filter: { number: { eq: $orderNumber } }) {
        items {
          number
          status
          total {
            grand_total {
              value
              currency
            }
          }
          items {
            product_name
            product_sku
            quantity_ordered
            product_sale_price {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

// Get delivery time slots (custom MM endpoint)
export const GET_DELIVERY_TIME = gql`
  query GetDeliveryTime($cartId: String!) {
    getDeliveryTime(cart_id: $cartId) {
      date
      time_slots {
        from
        to
        available
      }
    }
  }
`;

// Set delivery time on cart (custom MM mutation)
export const SET_DELIVERY_TIME = gql`
  mutation SetDeliveryTime($cartId: String!, $deliveryDate: String!, $deliveryTime: String!) {
    setDeliveryTime(input: { cart_id: $cartId, delivery_date: $deliveryDate, delivery_time: $deliveryTime }) {
      cart {
        id
      }
    }
  }
`;
