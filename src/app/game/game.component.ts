import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { GeneralService } from '../general.service'

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
    availableSongs: Array<any> = []
    randomIndex: number = 0
    artists: any = []
    isCorrect: boolean = false
    guessed: boolean = false

    constructor(private http: HttpClient, private service: GeneralService) {}

    ngOnInit(): void {}

    getArtist(id: string) {
        return this.http
            .get(`https://api.spotify.com/v1/artists/${id}`, {
                headers: { Authorization: `Bearer ${this.service.token}` },
            })
            .subscribe({
                next: data => {
                    console.log(data)
                    this.artists.push(data)
                },
            })
    }

    getSongs() {
        return this.http
            .get(
                'https://api.spotify.com/v1/search?q=genre%3Arock&type=track',
                { headers: { Authorization: `Bearer ${this.service.token}` } }
            )
            .subscribe({
                next: (data: any) => {
                    console.log(data)
                    this.availableSongs = []
                    for (let song of data.tracks.items)
                        if (song.preview_url != null)
                            this.availableSongs.push(song)
                    this.randomIndex = Math.floor(
                        Math.random() * this.availableSongs.length
                    )
                    console.log(this.availableSongs)
                    console.log(this.randomIndex)
                    this.getArtist(
                        this.availableSongs[this.randomIndex].artists[0].id
                    )
                    this.getArtist(this.availableSongs[0].artists[0].id)
                    this.getArtist(this.availableSongs[1].artists[0].id)
                },
            })
    }

    checkArtistClicked(e: any) {
        this.guessed = true
        console.log(e)
    }
}
