import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'

interface UserData {
    name: string
    avatar_url: string
    bio: string
}

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
    name1: string = ''
    name2: string = ''
    avatarUrl1: string = ''
    bio1: string = ''
    avatarUrl2: string = ''
    bio2: string = ''
    url1: string = ''
    url2: string = ''

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.url1 = 'https://api.github.com/users/KieranMueller'
        this.url2 = 'https://api.github.com/users/NicoleR1234'

        this.fetchDataAndUpdateDOM(this.url1, this.url2)
    }
    async fetchDataAndUpdateDOM(url1: string, url2: string): Promise<void> {
        try {
            const [data1, data2] = await Promise.all([
                this.http.get<UserData>(url1).toPromise(),
                this.http.get<UserData>(url2).toPromise(),
            ])

            if (data1 !== undefined) {
                console.log(data1)
                this.name1 = data1.name
                this.avatarUrl1 = data1.avatar_url
                this.bio1 = data1.bio
            }

            if (data2 !== undefined) {
                this.name2 = data2.name
                this.avatarUrl2 = data2.avatar_url
                this.bio2 = data2.bio
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    git1() {
        window.open('https://github.com/KieranMueller', '_blank')
    }

    git2() {
        window.open('https://github.com/NIcoleR1234', '_blank')
    }

    viewRepo() {
        window.open('https://github.com/KieranMueller/WhosWho', '_blank')
    }
}
