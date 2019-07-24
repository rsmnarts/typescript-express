import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import * as express from 'express';
import HttpException from '../exceptions/HttpException';

export default function validationMiddleware<T>(type: any, skipMissingProperties = false): express.RequestHandler {
	return (req: { body: any }, res: any, next: { (arg0: HttpException): void; (): void }) => {
		validate(plainToClass(type, req.body)).then((errors: ValidationError[]) => {
			if (errors.length > 0) {
				const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
				next(new HttpException(400, message));
			} else {
				next();
			}
		});
	};
}
