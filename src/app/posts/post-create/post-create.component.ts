import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit {
  postTitle = '';
  postContent = '';
  post: Post;
  private mode = 'create';
  private postId: string;

  constructor(public postService: PostsService,
              public route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.postService.getPostById(this.postId).subscribe(postData => {
          this.post = {id: postData._id, title: postData.title, content: postData.content};
        });
      }
    });
  }

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.postService.addPost(form.value.title, form.value.content);
      form.resetForm();
    } else {
      this.postService.updatePostById(this.postId, form.value.title, form.value.content);
      form.resetForm();
    }
  }

}
