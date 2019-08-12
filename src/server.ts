import 'dotenv/config';
import App from './app';
import AuthenticationControllers from './authentication/authentication.controller';
import UserControllers from './users/user.controller';
import PostControllers from './posts/post.controller';
import reportControllers from './reports/report.controller';
import validateEnv from './utils/validateEnv';

validateEnv();

const app = new App(
  [
    new AuthenticationControllers(),
    new UserControllers(),
    new PostControllers(),
    new reportControllers()
  ],
  process.env.PORT
);

app.listen();
