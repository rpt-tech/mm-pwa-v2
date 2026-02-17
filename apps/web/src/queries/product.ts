import { gql } from '@apollo/client';

// Product details fragment with all fields needed for PDP
export const PRODUCT_DETAILS_FRAGMENT = gql`
  fragment ProductDetailsFragment on ProductInterface {
    __typename
    categories {
      uid
      breadcrumbs {
        category_uid
      }
      name
    }
    main_category {
      uid
      id
      name
      breadcrumbs {
        category_uid
        category_level
        category_name
        category_url_key
        category_url_path
      }
    }
    description {
      html
    }
    short_description {
      html
    }
    id
    uid
    is_alcohol
    allow_pickup
    media_gallery_entries {
      uid
      label
      position
      disabled
      file
      video_content {
        video_url
        video_title
      }
    }
    meta_description
    meta_title
    meta_keyword
    url_suffix
    name
    ecom_name
    mm_product_type
    unit_ecom
    mm_brand
    dnr_price {
      qty
      promo_label
      promo_type
      promo_amount
      promo_value
      event_id
      event_name
    }
    art_no
    price {
      regularPrice {
        amount {
          currency
          value
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
          percent_off
        }
      }
    }
    sku
    small_image {
      url
    }
    stock_status
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
    rating_summary
    review_count
    reviews {
      items {
        average_rating
        ratings_breakdown {
          name
          value
        }
      }
    }
    similar_products {
      uid
      sku
      name
      ecom_name
      unit_ecom
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
      small_image {
        url
      }
      url_key
      url_suffix
      stock_status
    }
    custom_attributes {
      selected_attribute_options {
        attribute_option {
          uid
          label
          is_default
        }
      }
      entered_attribute_value {
        value
      }
      attribute_metadata {
        uid
        code
        label
        attribute_labels {
          store_code
          label
        }
        data_type
        is_system
        entity_type
        ui_input {
          ui_input_type
          is_html_allowed
        }
        ... on ProductAttributeMetadata {
          used_in_components
        }
      }
    }
    additional_attributes {
      attribute_code
      label
      value
    }
    ... on ConfigurableProduct {
      configurable_options {
        attribute_code
        attribute_id
        uid
        label
        values {
          uid
          default_label
          label
          store_label
          use_default_value
          value_index
          swatch_data {
            ... on ImageSwatchData {
              thumbnail
            }
            value
          }
        }
      }
      variants {
        attributes {
          code
          value_index
        }
        product {
          uid
          media_gallery_entries {
            uid
            disabled
            file
            label
            position
          }
          sku
          stock_status
          price {
            regularPrice {
              amount {
                currency
                value
              }
            }
          }
          price_range {
            maximum_price {
              final_price {
                currency
                value
              }
              discount {
                amount_off
              }
            }
          }
          custom_attributes {
            selected_attribute_options {
              attribute_option {
                uid
                label
                is_default
              }
            }
            entered_attribute_value {
              value
            }
            attribute_metadata {
              uid
              code
              label
              attribute_labels {
                store_code
                label
              }
              data_type
              is_system
              entity_type
              ui_input {
                ui_input_type
                is_html_allowed
              }
              ... on ProductAttributeMetadata {
                used_in_components
              }
            }
          }
        }
      }
    }
  }
`;

// Get product detail by URL key
export const GET_PRODUCT_DETAIL = gql`
  query getProductDetailForProductPage($urlKey: String!) {
    products(filter: { url_key: { eq: $urlKey } }) {
      items {
        ...ProductDetailsFragment
      }
    }
  }
  ${PRODUCT_DETAILS_FRAGMENT}
`;

// Add product to cart
export const ADD_PRODUCT_TO_CART = gql`
  mutation addProductToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        id
        total_quantity
        prices {
          grand_total {
            value
            currency
          }
        }
      }
      user_errors {
        code
        message
      }
    }
  }
`;

// Get related and upsell products
export const GET_RELATED_UPSELL_PRODUCTS = gql`
  query getRelatedUpsellProducts($urlKey: String!) {
    products(filter: { url_key: { eq: $urlKey } }) {
      items {
        uid
        related_products {
          uid
          sku
          name
          ecom_name
          unit_ecom
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
        upsell_products {
          uid
          sku
          name
          ecom_name
          unit_ecom
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

// Get product reviews
export const GET_PRODUCT_REVIEWS = gql`
  query getProductReviews($sku: String!, $currentPage: Int = 1, $pageSize: Int = 10) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        uid
        review_count
        reviews(currentPage: $currentPage, pageSize: $pageSize) {
          items {
            average_rating
            summary
            text
            created_at
            nickname
            ratings_breakdown {
              name
              value
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
  }
`;

// Create product review
export const CREATE_PRODUCT_REVIEW = gql`
  mutation createProductReview($input: CreateProductReviewInput!) {
    createProductReview(input: $input) {
      review {
        nickname
        summary
        text
        average_rating
        ratings_breakdown {
          name
          value
        }
      }
    }
  }
`;
