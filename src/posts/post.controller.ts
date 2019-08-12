import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import Post from './post.interface';
import postModel from './post.model';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';
import CreatePostDto from './post.dto';

export default class PostsControllers implements Controller {
  public path = '/posts';
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, authMiddleware, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .post(
        this.path,
        authMiddleware,
        validationMiddleware(CreatePostDto),
        this.createPosts
      )
      .patch(
        `${this.path}/:id`,
        authMiddleware,
        validationMiddleware(CreatePostDto, true),
        this.modifyPost
      )
      .delete(`${this.path}/:id`, authMiddleware, this.deletePost);
  }

  getAllPosts = async (req: express.Request, res: express.Response) => {
    const posts = await this.post.find().populate('author', 'name');
    res.send(posts);
  };

  private getPostById = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const id = req.params.id;
    this.post.findById(id).then((post: object) => {
      if (post) {
        res.send(post);
      } else {
        next(new PostNotFoundException(id));
      }
    });
  };

  private createPosts = async (req: RequestWithUser, res: express.Response) => {
    const postData: CreatePostDto = req.body;
    const createdPost = new this.post({
      ...postData,
      author: req.user._id
    });
    const savedPost = await createdPost.save();
    await savedPost.populate('author', 'name').execPopulate();
    res.send(savedPost);
  };

  private modifyPost = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const id = req.params.id;
    const postData: Post = req.body;
    this.post
      .findByIdAndUpdate(id, postData, { new: true })
      .then((modifiedPost: any) => {
        if (modifiedPost) {
          res.send(modifiedPost);
        } else {
          next(new PostNotFoundException(id));
        }
      });
  };

  private deletePost = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const id = req.params.id;
    this.post.findByIdAndDelete(id).then((successResponse: any) => {
      if (successResponse) {
        res.send(200);
      } else {
        next(new PostNotFoundException(id));
      }
    });
  };
}
