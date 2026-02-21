import { gql } from 'graphql-request';

// Get customer data
export const GET_CUSTOMER = gql`
  query GetCustomer {
    customer {
      id
      firstname
      lastname
      email
      date_of_birth
      gender
      customer_no
      loyalty_points
      vat_address {
        customer_vat_id
        company_name
        company_vat_number
        company_address
      }
      custom_attributes {
        code
        value
      }
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
      orders(currentPage: 1, pageSize: 3) {
        total_count
        items {
          id
          number
          order_date
          status
          total {
            grand_total {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

// Update customer info
export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($customerInput: CustomerUpdateInput!) {
    updateCustomerV2(input: $customerInput) {
      customer {
        id
        firstname
        lastname
        email
        date_of_birth
        gender
        customer_no
        vat_address {
          customer_vat_id
          company_name
          company_vat_number
          company_address
        }
        custom_attributes {
          code
          value
        }
      }
    }
  }
`;

// Update customer email
export const UPDATE_CUSTOMER_EMAIL = gql`
  mutation UpdateCustomerEmail($email: String!, $password: String!) {
    updateCustomerEmail(email: $email, password: $password) {
      customer {
        email
      }
    }
  }
`;

// Change password
export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changeCustomerPassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      id
      email
    }
  }
`;

// Get customer addresses with pagination (for AddressBookPage)
export const GET_CUSTOMER_ADDRESSES_PAGINATED = gql`
  query GetCustomerAddressesForAddressBook($currentPage: Int!, $pageSize: Int!) {
    customer {
      addressesV2(currentPage: $currentPage, pageSize: $pageSize) {
        total_count
        total_pages
        addresses {
          id
          firstname
          telephone
          default_shipping
          is_new_administrative
          country_code
          city
          street
          custom_attributes {
            attribute_code
            value
          }
        }
      }
    }
  }
`;

// Create customer address
export const CREATE_CUSTOMER_ADDRESS = gql`
  mutation CreateCustomerAddress($address: CustomerAddressInput!) {
    createCustomerAddress(input: $address) {
      id
    }
  }
`;

// Update customer address
export const UPDATE_CUSTOMER_ADDRESS = gql`
  mutation UpdateCustomerAddress($addressId: Int!, $updated_address: CustomerAddressInput!) {
    updateCustomerAddress(id: $addressId, input: $updated_address) {
      id
      firstname
      telephone
      default_shipping
      is_new_administrative
      country_code
      city
      street
      custom_attributes {
        attribute_code
        value
      }
    }
  }
`;

// Delete customer address
export const DELETE_CUSTOMER_ADDRESS = gql`
  mutation DeleteCustomerAddress($addressId: Int!) {
    deleteCustomerAddress(id: $addressId)
  }
`;

// Get customer orders
export const GET_CUSTOMER_ORDERS = gql`
  query GetCustomerOrders($currentPage: Int = 1, $pageSize: Int = 10, $filter: CustomerOrdersFilterInput) {
    customer {
      orders(currentPage: $currentPage, pageSize: $pageSize, filter: $filter) {
        total_count
        items {
          id
          number
          order_date
          status
          status_code
          state
          total {
            grand_total {
              value
              currency
            }
            subtotal {
              value
              currency
            }
          }
          items {
            id
            product_name
            product_sku
            product_url_key
            product_sale_price {
              value
              currency
            }
            quantity_ordered
            quantity_shipped
            quantity_canceled
            quantity_refunded
            product {
              uid
              ecom_name
              unit_ecom
              thumbnail {
                url
              }
            }
          }
          shipping_address {
            firstname
            lastname
            street
            city
            region
            postcode
            telephone
          }
          payment_methods {
            name
            type
          }
          shipments {
            id
            number
            tracking {
              title
              number
              carrier
            }
          }
        }
        page_info {
          current_page
          page_size
          total_pages
        }
      }
    }
  }
`;

// Get order details
export const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($orderNumber: String!) {
    customer {
      orders(filter: { number: { eq: $orderNumber } }) {
        items {
          id
          number
          order_date
          status
          state
          carrier
          total {
            grand_total {
              value
              currency
            }
            subtotal {
              value
              currency
            }
            total_shipping {
              value
              currency
            }
            total_tax {
              value
              currency
            }
            discounts {
              amount {
                value
                currency
              }
              label
            }
          }
          items {
            id
            product_name
            product_sku
            product_url_key
            product_sale_price {
              value
              currency
            }
            quantity_ordered
            quantity_shipped
            quantity_canceled
            quantity_refunded
            selected_options {
              label
              value
            }
          }
          billing_address {
            firstname
            lastname
            street
            city
            region
            postcode
            telephone
          }
          shipping_address {
            firstname
            lastname
            street
            city
            region
            postcode
            telephone
          }
          payment_methods {
            name
            type
            additional_data {
              name
              value
            }
          }
          shipping_method
          shipments {
            id
            number
            tracking {
              title
              number
              carrier
            }
            items {
              id
              product_name
              product_sku
              quantity_shipped
            }
          }
          invoices {
            id
            number
            items {
              id
              product_name
              product_sku
              quantity_invoiced
            }
          }
          credit_memos {
            id
            number
            items {
              id
              product_name
              product_sku
              quantity_refunded
            }
          }
        }
      }
    }
  }
`;

// Get wishlist
export const GET_WISHLIST = gql`
  query GetWishlist {
    customer {
      wishlist {
        id
        items_count
        items {
          id
          product {
            uid
            id
            name
            sku
            art_no
            ecom_name
            url_key
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
                  percent_off
                }
              }
            }
            stock_status
          }
          added_at
        }
      }
    }
  }
`;

// Add product to wishlist
export const ADD_TO_WISHLIST = gql`
  mutation AddProductToWishlist($wishlistId: ID!, $items: [WishlistItemInput!]!) {
    addProductsToWishlist(wishlistId: $wishlistId, wishlistItems: $items) {
      wishlist {
        id
        items_count
      }
    }
  }
`;

// Remove product from wishlist
export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveProductFromWishlist($wishlistId: ID!, $wishlistItemsIds: [ID!]!) {
    removeProductsFromWishlist(
      wishlistId: $wishlistId
      wishlistItemsIds: $wishlistItemsIds
    ) {
      wishlist {
        id
        items_count
      }
    }
  }
`;

// Reorder items from a previous order
export const REORDER_ITEMS = gql`
  mutation ReorderItems($orderNumber: String!) {
    reorderItems(orderNumber: $orderNumber) {
      cart {
        id
        total_quantity
      }
      userInputErrors {
        code
        message
        path
      }
    }
  }
`;

// Get available order statuses for filter
export const GET_AVAILABLE_STATUS = gql`
  query GetAvailableStatus {
    availableStatus {
      status
      label
    }
  }
`;
