export const types = `#graphql

    input CreateTweetData{
        content: String!
        imgUrl: String
    }

    input LikeUnlikeTweetData{
        tweetId: String!
    }

    type Tweet{
        id: ID!
        content: String!
        imgUrl: String
        author: User
        likes: [Likes]
    }

    type Likes{
        tweet: Tweet!
        tweetId: String!
        liker:  User
        likerId: String!
    }`;
