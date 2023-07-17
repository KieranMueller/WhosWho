import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'
import { GeneralService } from '../general.service'

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent {
    availableSongs: Array<any> = []
    randomIndex: number = 0
    artists: any = []
    isCorrect: boolean = false
    guessed: boolean = false
    correctArtistName: string = ''
    isWrong: boolean = false
    hitPlay: boolean = false
    totalScore: number = 0
    totalElapsed: number = -1

    constructor(private http: HttpClient, private service: GeneralService) {}

    getSongs() {
        return this.http
            .get(
                `https://api.spotify.com/v1/search?q=genre%3A${this.service.selectedGenre}&type=track&limit=50&include_external=audio`,
                { headers: { Authorization: `Bearer ${this.service.token}` } }
            )
            .subscribe({
                next: (data: any) => {
                    this.artists = []
                    this.isCorrect = false
                    this.isWrong = false
                    this.guessed = false
                    this.hitPlay = true
                    this.totalElapsed++
                    this.availableSongs = []
                    for (let song of data.tracks.items)
                        if (song.preview_url != null)
                            this.availableSongs.push(song)
                    console.log(this.availableSongs)
                    this.randomIndex = Math.floor(
                        Math.random() * this.availableSongs.length
                    )
                    console.log(this.randomIndex)
                    this.correctArtistName =
                        this.availableSongs[this.randomIndex].artists[0].name
                    this.handleWrongArtists(this.service.numArtists)
                },
            })
    }

    handleWrongArtists(num: number = 2) {
        this.getArtist(this.availableSongs[this.randomIndex].artists[0].id)
        for (let i = 1; i < num; i++) {
            this.getArtist(
                this.availableSongs[
                    Math.floor(Math.random() * this.availableSongs.length)
                ].artists[0].id
            )
        }
    }

    getArtist(id: string) {
        console.log(this.artists)
        this.http
            .get(`https://api.spotify.com/v1/artists/${id}`, {
                headers: { Authorization: `Bearer ${this.service.token}` },
            })
            .subscribe({
                next: data => this.artists.push(data),
            })
    }

    checkArtistClicked(e: any) {
        this.guessed = true
        if (e === this.correctArtistName) {
            this.isCorrect = true
            this.totalScore++
        } else this.isWrong = true
        setTimeout(() => {
            this.getSongs()
        }, 700)
    }
}
