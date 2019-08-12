import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import userModel from '../users/user.model';

export default class reportController implements Controller {
  public path = '/reports';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.generateReport);
  }

  private generateReport = async (
    req: express.Request,
    res: express.Response
  ) => {
    const usersByCountries = await this.user.aggregate([
      {
        $match: {
          'address.country': {
            $exists: true
          }
        }
      },
      {
        $group: {
          _id: {
            country: '$address.country'
          },
          users: {
            $push: {
              name: '$name',
              _id: '$_id'
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'users._id',
          foreignField: 'author',
          as: 'articles'
        }
      },
      {
        $addFields: {
          amountOfArticles: {
            $size: '$articles'
          }
        }
      },
      {
        $sort: {
          amountOfArticles: 1
        }
      }
    ]);
    res.send({
      usersByCountries
    });
  };
}
