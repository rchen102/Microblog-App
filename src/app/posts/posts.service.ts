import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) { }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPostById(postId: string) {
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      creator: string
    }>(
      BACKEND_URL + postId
    );
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title); // title will be the filename

    this.http
      .post<{message: string, post: Post}>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        console.log(responseData.message);
        this.router.navigate(['/']);
      });
  }

  updatePostById(postId: string, title: string, content: string, image: File | string) {
    let postData: FormData | Post;
    if (typeof(image) === 'object') {  // image's type is File
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {    // image's type is string
      postData = {
        id: postId,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this.http
      .put<{message: string}>(BACKEND_URL + postId, postData)
      .subscribe((responseData) => {
        console.log(responseData.message);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http
      .delete<{message: string}>(BACKEND_URL + postId);
  }
}
