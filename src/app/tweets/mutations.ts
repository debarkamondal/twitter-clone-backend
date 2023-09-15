export const mutations = `#graphql
    createTweet(payload: CreateTweetData!): Tweet
    likeTweet(payload: LikeUnlikeTweetData!): Tweet
    unlikeTweet(payload: LikeUnlikeTweetData!): Tweet

`;
