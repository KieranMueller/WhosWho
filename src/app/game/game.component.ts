import { HttpClient } from '@angular/common/http'
import { Component, OnDestroy, OnInit, Input } from '@angular/core'
import { GeneralService } from '../general.service'

// Save high score in local storage? Longest right answer streak? Tweak UI, css, mobile friendly, loading pages?
// Add end game modal/ disable everything, set timeout route back to home page?

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
    livesRemaining: Array<number> = [1, 2, 3]
    selectedGenre: string = ''
    availableSongs: Array<any> = []
    randomIndex: number = 0
    artists: Array<any> = []
    isCorrect: boolean = false
    guessed: boolean = false
    correctArtistName: string = ''
    correctArtistData: any = {}
    isWrong: boolean = false
    hitPlay: boolean = false
    totalScore: number = 0
    totalElapsed: number = -1
    isAutoplay: boolean = false
    numSongs: number = 1
    songsArr: Array<any> = []
    wrongCounter: number = 0

    constructor(private http: HttpClient, private service: GeneralService) {}

    ngOnDestroy(): void {
        this.getSongs().unsubscribe()
        this.handleSongs('').unsubscribe()
    }

    ngOnInit(): void {
        this.numSongs = this.service.numSongs
        this.selectedGenre = this.service.selectedGenre
        this.getSongs()
    }

    handleSongs(artistId: string) {
        return this.http
            .get(
                `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
                {
                    headers: { Authorization: `Bearer ${this.service.token}` },
                }
            )
            .subscribe({
                next: (obj: any) => {
                    for (let i = 0; i < this.numSongs; i++) {
                        if (obj.tracks[i].preview_url != null)
                            this.songsArr.push(obj.tracks[i])
                    }
                },
                error: e => console.log(e),
            })
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
                    this.correctArtistData =
                        this.availableSongs[this.randomIndex]
                    this.handleSongs(this.correctArtistData.artists[0].id)
                    this.handleArtists(this.service.numArtists)
                },
                error: e => console.log(e),
            })
    }

    resetStuff(): void {
        this.songsArr = []
        this.artists = []
        this.availableSongs = []
        this.isCorrect = false
        this.isWrong = false
        this.guessed = false
        this.hitPlay = true
        this.totalElapsed++
        if (this.totalElapsed - this.totalScore != this.wrongCounter) {
            this.livesRemaining.pop()
            this.wrongCounter++
        }
    }

    handleArtists(num: number = 2): void {
        let artistNameArr: Array<string> = []
        artistNameArr.push(
            this.availableSongs[this.randomIndex].artists[0].name
        )
        this.pushArtist(this.availableSongs[this.randomIndex].artists[0].id)
        let i = 0
        while (i < num - 1) {
            let randomIndex = Math.floor(
                Math.random() * this.availableSongs.length
            )
            if (
                !artistNameArr.includes(
                    this.availableSongs[randomIndex].artists[0].name
                )
            ) {
                artistNameArr.push(
                    this.availableSongs[randomIndex].artists[0].name
                )
                this.pushArtist(this.availableSongs[randomIndex].artists[0].id)
                i++
            }
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
                },
            })
    }

    checkArtistClicked(e: any): void {
        this.guessed = true
        if (e === this.correctArtistName) {
            this.isCorrect = true
            this.totalScore++
        } else this.isWrong = true
        setTimeout(() => {
            this.getSongs()
        }, 200)
    }

    testStuff() {
        console.log(this.songsArr)
    }
}
