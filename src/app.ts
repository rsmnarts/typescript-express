import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as mongoose from 'mongoose';
import * as cors from 'cors';
import * as helmet from 'helmet';
import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';

export default class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Controller[], port) {
    this.app = express();
    this.port = port;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(cookieParser());
  }

  private initializeControllers(ctrls: any) {
    ctrls.forEach((c: any) => {
      this.app.use('/', c.router);
    });
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }

  private connectToDatabase() {
    const { MONGO_USER, MONGO_PASS, MONGO_PATH } = process.env;
    mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}/${MONGO_PATH}`, {
      useNewUrlParser: true
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}
