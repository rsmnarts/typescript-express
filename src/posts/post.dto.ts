import { IsString } from 'class-validator';

export default class CreatePostDto {
	@IsString() public author: string;
	@IsString() public content: string;
	@IsString() public title: string;
}
