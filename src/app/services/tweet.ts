import { prismaClient } from "../../clients/db";
import { redisClient } from "../../clients/redis";

export interface CreateTweetData {
	content: string;
	imgUrl?: string;
	userId: string;
}
export class TweetService {
	public static async createTweet(data: CreateTweetData) {
		const isRateLimited = await redisClient.get(
			`RATE_LIMIT:TWEET:${data.userId}`
		);
		if (isRateLimited) throw new Error("Please wait, don't spam");
		const tweet = await prismaClient.tweet.create({
			data: {
				content: data.content,
				imgUrl: data.imgUrl,
				author: { connect: { id: data.userId } },
			},
		});
		await redisClient.setex(`RATE_LIMIT:TWEET:${data.userId}`, 5, 1);
		await redisClient.del(`USER-${data.userId}`);
		await redisClient.del(`ALL_TWEETS`);
		return tweet;
	}
	public static async getAllTweets() {
		const cachedTweets = await redisClient.get("ALL_TWEETS");
		if (cachedTweets) return JSON.parse(cachedTweets);
		const tweets = await prismaClient.tweet.findMany({
			orderBy: { createdAt: "desc" },
		});
		await redisClient.set("ALL_TWEETS", JSON.stringify(tweets));
		return tweets;
	}
	public static allTweetsByUser(id: string) {
		return prismaClient.tweet.findMany({ where: { author: { id } } });
	}
}
