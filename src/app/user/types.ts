export const types = `#graphql
    type User{
        id: ID!
        firstName: String!
        lastName: String
        email: String!
        profileImgUrl: String
        tweets: [Tweet]
        followers: [User]
        following: [User]
    }
`;
