import * as express from 'express';
import { getRepository } from 'typeorm';
import Controller from '../interfaces/controller.interface';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';
import CreatePostDto from './post.dto';
import Post from './post.entity';

export default class PostsControllers implements Controller {
  public path = '/posts';
  public router = express.Router();
  private postRepository = getRepository(Post);

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
    const posts = await this.postRepository.find();
    res.send(posts);
  };

  private getPostById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const id = req.params.id;
    const post = await this.postRepository.findOne(id);
    if (post) {
      res.send(post);
    } else {
      next(new PostNotFoundException(id));
    }
  };

  private createPosts = async (req: RequestWithUser, res: express.Response) => {
    const postData: CreatePostDto = req.body;
    const createdPost = this.postRepository.create(postData);
    await this.postRepository.save(createdPost);
    res.send(createdPost);
  };

  private modifyPost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const id = req.params.id;
    const postData: Post = req.body;
    await this.postRepository.update(id, postData);
    const updatedPost = await this.postRepository.findOne(id);
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(new PostNotFoundException(id));
    }
  };

  private deletePost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const id = req.params.id;
    const deletedPost = await this.postRepository.delete(id);
    if (deletedPost) {
      res.send(200);
    } else {
      next(new PostNotFoundException(id));
    }
  };
}
