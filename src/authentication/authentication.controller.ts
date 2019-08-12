import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import WrongCredentialsException from '../exceptions/WrongAuthenticationTokenException';
import Controller from '../interfaces/controller.interface';
import TokenData from '../interfaces/tokenData.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../users/user.dto';
import userModel from '../users/user.model';
import User from '../users/user.interface';
import LogInDto from './logIn.dto';
import DataStoredInToken from 'interfaces/dataStoredInToken.interface';

export default class AuthenticationController implements Controller {
  public path = '/auth';
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.registration
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LogInDto),
      this.loggingIn
    );
  }

  private registration = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const userData: CreateUserDto = req.body;
    if (await userModel.findOne({ email: userData.email })) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await userModel.create({
        ...userData,
        password: hashedPassword
      });
      user.password = undefined;
      res.send(user);
    }
  };

  private loggingIn = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const loginData: LogInDto = req.body;
    const user = await userModel.findOne({ email: loginData.email });
    if (user) {
      const isPasswordHashing = await bcrypt.compare(
        loginData.password,
        user.password
      );
      if (isPasswordHashing) {
        user.password = undefined;
        const tokenData = this.createToken(user);
        res.send({
          msg: 'login successfully',
          token: tokenData.token
        });
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60;
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, {
        expiresIn,
        algorithm: 'HS512'
      })
    };
  }
}
