import { IsString, IsEmail } from 'class-validator';

export default class CreateUserDto {
	@IsString() public name: string;
	@IsEmail() public email: string;
	@IsString() public password: string;
}
