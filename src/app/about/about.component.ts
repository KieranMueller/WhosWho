import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface UserData {
  avatar_url: string;
  bio: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  avatarUrl1: string = '';
  bio1: string = '';
  avatarUrl2: string = '';
  bio2: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const url1 = 'https://api.github.com/users/KieranMueller';
    const url2 = 'https://api.github.com/users/NicoleR1234';

    this.fetchDataAndUpdateDOM(url1, url2);

}
async fetchDataAndUpdateDOM(url1: string, url2: string): Promise<void> {
  try {
    const [data1, data2] = await Promise.all([
      this.http.get<UserData>(url1).toPromise(),
      this.http.get<UserData>(url2).toPromise()
    ]);

    if (data1 !== undefined) {
      this.avatarUrl1 = data1.avatar_url;
      this.bio1 = data1.bio;
    }

    if (data2 !== undefined) {
      this.avatarUrl2 = data2.avatar_url;
      this.bio2 = data2.bio;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
}

