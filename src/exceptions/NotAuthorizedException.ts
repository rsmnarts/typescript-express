import HttpException from './HttpException';

export default class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(403, "You're not authorized");
  }
}
