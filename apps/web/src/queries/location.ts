import { gql } from 'graphql-request';

// Get cities (provinces) in Vietnam
export const GET_CITIES = gql`
  query GetCities($countryId: String!) {
    cities(country_id: $countryId, is_new_administrative: 1) {
      id
      name
      city_code
    }
  }
`;

// Get districts based on city_code
export const GET_DISTRICTS = gql`
  query GetDistricts($cityCode: String!) {
    districts(city_code: $cityCode) {
      id
      name
      district_code
    }
  }
`;

// Get wards based on city_code
export const GET_WARDS = gql`
  query GetWards($cityCode: String!) {
    wards(city_code: $cityCode) {
      id
      name
      ward_code
    }
  }
`;
