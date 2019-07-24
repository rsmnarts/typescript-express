import { IsString, IsEmail } from 'class-validator';

export default class LogInDto {
	@IsEmail() public email: string;
	@IsString() public password: string;
}
