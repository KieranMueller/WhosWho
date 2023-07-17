import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { GeneralService } from '../general.service'

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
    possibleArtists: any

    constructor(private http: HttpClient, private service: GeneralService) {}

    ngOnInit(): void {}

    getSongs() {
        return this.http
            .get(
                'https://api.spotify.com/v1/search?q=genre%3Ametal&type=track',
                { headers: { Authorization: `Bearer ${this.service.token}` } }
            )
            .subscribe(data => console.log(data))
    }
}
