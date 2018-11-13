import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  userIsAuthenticated = false;

  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  private postsSub: Subscription;
  private authListenerSub: Subscription;

  constructor(public postService: PostsService,
              private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);

    this.postsSub = this.postService
      .getPostUpdateListener()
      .subscribe(
        (postData: { posts: Post[], postCount: number }) => {
          this.posts = postData.posts;
          this.totalPosts = postData.postCount;
          this.isLoading = false;
        }
      );
    // Used for first time load this component, for it's only loaded after login, so it willnot receive the change
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onPageChanged(pageData: PageEvent) {
    this.isLoading = true;
    this.postsPerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authListenerSub.unsubscribe();
  }

}
