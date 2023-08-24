export const types = `#graphql

    input CreateTweetData{
        content: String!
        imgUrl: String
    }

    type Tweet{
        id: ID!
        content: String!
        imgUrl: String
        author: User
    }
`;
