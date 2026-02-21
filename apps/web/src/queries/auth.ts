import { gql } from 'graphql-request';

// Sign In Mutation
export const SIGN_IN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    generateCustomerTokenV2(email: $email, password: $password) {
      token
      location_user {
        region_id
        city
        city_code
        district
        district_code
        ward
        ward_code
        address
        store_view_code
      }
    }
  }
`;

// Create Account Mutation
export const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccount(
    $email: String!
    $firstname: String!
    $lastname: String!
    $password: String!
    $is_subscribed: Boolean!
    $custom_attributes: [AttributeValueInput!]!
  ) {
    createCustomerV2(
      input: {
        email: $email
        firstname: $firstname
        lastname: $lastname
        password: $password
        is_subscribed: $is_subscribed
        custom_attributes: $custom_attributes
      }
    ) {
      customer {
        email
      }
    }
  }
`;

// Sign In After Create Account
export const SIGN_IN_AFTER_CREATE_MUTATION = gql`
  mutation SignInAfterCreate($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

// Get Customer Query
export const GET_CUSTOMER_QUERY = gql`
  query GetCustomer {
    customer {
      customer_uid
      email
      firstname
      is_subscribed
      custom_attributes(attributeCodes: ["company_user_phone_number"]) {
        code
        ... on AttributeValue {
          value
        }
      }
    }
  }
`;

// Request Password Reset Email
export const REQUEST_PASSWORD_RESET_EMAIL_MUTATION = gql`
  mutation RequestPasswordResetEmail($email: String!) {
    requestPasswordResetEmail(email: $email)
  }
`;

// Reset Password
export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword(
    $email: String!
    $resetPasswordToken: String!
    $newPassword: String!
  ) {
    resetPassword(
      email: $email
      resetPasswordToken: $resetPasswordToken
      newPassword: $newPassword
    )
  }
`;

// Create Cart Mutation
export const CREATE_CART_MUTATION = gql`
  mutation CreateCart {
    cartId: createEmptyCart
  }
`;

// Merge Carts Mutation
export const MERGE_CARTS_MUTATION = gql`
  mutation MergeCarts($sourceCartId: String!, $destinationCartId: String!) {
    mergeCarts(
      source_cart_id: $sourceCartId
      destination_cart_id: $destinationCartId
    ) {
      id
      items {
        uid
      }
    }
  }
`;

// Get Store Config Query
export const GET_STORE_CONFIG_QUERY = gql`
  query GetStoreConfig {
    storeConfig {
      store_code
      minimum_password_length
      customer_access_token_lifetime
    }
  }
`;

// Types
export interface SignInVariables {
  email: string;
  password: string;
}

export interface SignInResponse {
  generateCustomerTokenV2: {
    token: string;
    location_user?: {
      region_id?: string;
      city?: string;
      city_code?: string;
      district?: string;
      district_code?: string;
      ward?: string;
      ward_code?: string;
      address?: string;
      store_view_code?: string;
    };
  };
}

export interface CreateAccountVariables {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  is_subscribed: boolean;
  custom_attributes: Array<{
    attribute_code: string;
    value: string;
  }>;
}

export interface CreateAccountResponse {
  createCustomerV2: {
    customer: {
      email: string;
    };
  };
}

export interface GetCustomerResponse {
  customer: {
    customer_uid: string;
    email: string;
    firstname: string;
    is_subscribed: boolean;
    custom_attributes: Array<{
      code: string;
      value: string;
    }>;
  };
}

export interface RequestPasswordResetVariables {
  email: string;
}

export interface RequestPasswordResetResponse {
  requestPasswordResetEmail: boolean;
}

export interface ResetPasswordVariables {
  email: string;
  resetPasswordToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  resetPassword: boolean;
}

export interface StoreConfigResponse {
  storeConfig: {
    store_code: string;
    minimum_password_length: number;
    customer_access_token_lifetime: number;
  };
}

// Social Login
export const SOCIAL_LOGIN_MUTATION = gql`
  mutation SocialLogin($provider: String!, $token: String!) {
    socialLogin(input: { provider: $provider, token: $token }) {
      token
      customer {
        email
        firstname
        lastname
      }
    }
  }
`;
