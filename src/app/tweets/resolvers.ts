import { Tweet } from "@prisma/client";
import { GraphQLContext } from "../../interfaces";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UserService } from "../services/user";
import { CreateTweetData, TweetService } from "../services/tweet";

const s3Client = new S3Client({
	region: process.env.AWS_DEFAULT_REGION,
});

const queries = {
	getAllTweets: async () => await TweetService.getAllTweets(),

	getTweetImgPresignedUrl: async (
		parent: any,
		{ ImgName, ImgType }: { ImgName: string; ImgType: string },
		ctx: GraphQLContext
	) => {
		if (!ctx.user || !ctx.user.id)
			throw new Error("Your are not authorized to make this tweet");
		const allowedImgTypes = [
			"image/jpeg",
			"image/jpg",
			"image/webp",
			"image/png",
		];
		if (!allowedImgTypes.includes(ImgType))
			throw new Error("Image type not supported");
		const putObjectCommand = new PutObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET,
			Key: `uploads/${ctx.user.id}/${
				ImgName.split(".")[0]
			}-${Date.now().toString()}.${ImgType.split("/")[1]}`,
		});
		const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
			expiresIn: 300,
		});

		return signedUrl;
	},
};

const mutations = {
	createTweet: async (
		parent: any,
		{ payload }: { payload: CreateTweetData },
		ctx: GraphQLContext
	) => {
		if (!ctx.user?.id) throw new Error("Unauthorized action");
		const tweet = await TweetService.createTweet({
			...payload,
			userId: ctx.user.id,
		});
		return tweet;
	},
};

const extraResolvers = {
	Tweet: {
		author: async (parent: Tweet) =>
			await UserService.getUserById(parent.authorId),
	},
};

export const resolvers = { mutations, extraResolvers, queries };
