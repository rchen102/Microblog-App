import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  // Without selector, it will be created dynamically
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  message = 'An unknown error occurred!';

  // Use a shortcut to store it into data
  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}) {}

  ngOnInit() {
  }

}
