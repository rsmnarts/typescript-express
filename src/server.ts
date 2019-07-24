import 'dotenv/config';
import App from './app';
import PostControllers from './posts/post.controller';
import AuthenticationControllers from './authentication/authentication.controller';
import validateEnv from './utils/validateEnv';

validateEnv();

const app = new App([ new PostControllers(), new AuthenticationControllers() ], process.env.PORT);

app.listen();
