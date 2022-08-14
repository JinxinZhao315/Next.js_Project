import { gql } from '@apollo/client'
// When dealing with multiple input arguments, define a seperate Input type!! 
// Use "input" keyword instead of "type"
// So the type of the arguments is clear = UserInput

export const typeDefs = gql`
  type User {
    id: String!
    email: String!
    password: String!
    inputReferralCode: String
  }

  input OnboardUserInput {
    email: String!
    password: String!
    inputReferralCode: String
  }

  input LoginUserInput {
    email: String!
    password: String!
  }

  type ViewerResponse {
    email: String!
    referralNo: Int!
    referralCode: String!
  }

  type Query {
    viewer: ViewerResponse
  }

  type Mutation {
    onboard(input: OnboardUserInput!): User!
    login(input: LoginUserInput!): User!
    signOut: Boolean!
  }


  `