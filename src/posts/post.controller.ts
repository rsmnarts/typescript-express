import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import Post from './post.interface';
import postModel from './post.model';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import CreatePostDto from './post.dto';

class PostsControllers implements Controller {
	public path = '/posts';
	public router = express.Router();

	constructor() {
		this.intializeRoutes();
	}

	public intializeRoutes() {
		this.router.get(this.path, this.getAllPosts);
		this.router.get(`${this.path}/:id`, this.getPostById);
		this.router
			.all(this.path, authMiddleware)
			.post(this.path, authMiddleware, validationMiddleware(CreatePostDto), this.createPosts)
			.patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost)
			.delete(`${this.path}/:id`, this.deletePost);
	}

	getAllPosts = (req: express.Request, res: express.Response) => {
		postModel.find().then((posts: any) => res.send(posts));
	};

	private getPostById = (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const id = req.params.id;
		postModel.findById(id).then((post: any) => {
			if (post) {
				res.send(post);
			} else {
				next(new PostNotFoundException(id));
			}
		});
	};

	private createPosts = (req: express.Request, res: express.Response) => {
		const postData: Post = req.body;
		const createdPost = new postModel(postData);
		createdPost.save().then((savedPost: any) => res.send(savedPost));
	};

	private modifyPost = (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const id = req.params.id;
		const postData: Post = req.body;
		postModel.findByIdAndUpdate(id, postData, { new: true }).then((modifiedPost: any) => {
			if (modifiedPost) {
				res.send(modifiedPost);
			} else {
				next(new PostNotFoundException(id));
			}
		});
	};

	private deletePost = (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const id = req.params.id;
		postModel.findByIdAndDelete(id).then((successResponse: any) => {
			if (successResponse) {
				res.send(200);
			} else {
				next(new PostNotFoundException(id));
			}
		});
	};
}

export default PostsControllers;
