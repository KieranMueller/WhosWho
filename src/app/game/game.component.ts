import { HttpClient } from '@angular/common/http'
import { Component, OnDestroy, OnInit, Input } from '@angular/core'
import { GeneralService } from '../general.service'

// TO FIX! Multiple of same artist showing up, sometimes correct artist always last, sometimes always first...
// TO DO! Add songs based on home page selection

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})

export class GameComponent implements OnInit, OnDestroy {
    @Input() selectedSong: any;
    @Input() selectedArtist: any;



    availableSongs: Array<any> = []
    randomIndex: number = 0
    artists: Array<any> = []
    isCorrect: boolean = false
    guessed: boolean = false
    correctArtistName: string = ''
    isWrong: boolean = false
    hitPlay: boolean = false
    totalScore: number = 0
    totalElapsed: number = -1
    isAutoplay: boolean = false
    numSongs: number = 1
    numSongsArr: Array<number> = []

    constructor(private http: HttpClient, private service: GeneralService) {}

    ngOnDestroy(): void {
        this.getSongs().unsubscribe()
    }

    ngOnInit(): void {
        this.numSongs = this.service.numSongs
        this.makeSongsArrIterable()
        this.getSongs()
    }

    makeSongsArrIterable(): void {
        for (let i = 0; i < this.numSongs; i++) this.numSongsArr.push(1)
    }

    getSongs() {
        return this.http
            .get(
                `https://api.spotify.com/v1/search?q=genre%3A${this.service.selectedGenre}&type=track&limit=50&include_external=audio`,
                { headers: { Authorization: `Bearer ${this.service.token}` } }
            )
            .subscribe({
                next: (data: any) => {
                    this.resetStuff()
                    for (let song of data.tracks.items)
                        if (song.preview_url != null)
                            this.availableSongs.push(song)
                    this.randomIndex = Math.floor(
                        Math.random() * this.availableSongs.length
                    )
                    this.correctArtistName =
                        this.availableSongs[this.randomIndex].artists[0].name
                    this.handleArtists(this.service.numArtists)
                },
            })
    }

    resetStuff(): void {
        this.artists = []
        this.availableSongs = []
        this.isCorrect = false
        this.isWrong = false
        this.guessed = false
        this.hitPlay = true
        this.totalElapsed++
    }

    handleArtists(num: number = 2): void {
        this.pushArtist(this.availableSongs[this.randomIndex].artists[0].id)
        for (let i = 0; i < num - 1; i++) {
            this.pushArtist(
                this.availableSongs[
                    Math.floor(Math.random() * this.availableSongs.length)
                ].artists[0].id
            )
        }
    }

    pushArtist(id: string): void {
        this.http
            .get(`https://api.spotify.com/v1/artists/${id}`, {
                headers: { Authorization: `Bearer ${this.service.token}` },
            })
            .subscribe({
                next: data => {
                    this.artists.splice(
                        Math.floor(Math.random() * this.artists.length + 1),
                        0,
                        data
                    )
                    console.log(this.artists)
                },
            })
    }

    checkArtistClicked(e: any): void {
        console.log(this.artists)
        this.guessed = true
        if (e === this.correctArtistName) {
            this.isCorrect = true
            this.totalScore++
        } else this.isWrong = true
        setTimeout(() => {
            this.getSongs()
        }, 200)
    }
}
