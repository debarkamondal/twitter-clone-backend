export interface JWTUser {
	id: string;
	email: string;
}

export interface GraphQLContext {
	user?: JWTUser;
}
