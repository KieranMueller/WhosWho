import { HttpClient } from '@angular/common/http'
import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core'
import { GeneralService } from '../general.service'
import { Router } from '@angular/router'

// Save high score in local storage? Longest right answer streak? Tweak UI, css, mobile friendly, loading pages?
// Make home page more user friendly, explain what is going on, mitigate confusion
// add a point system instead? weighting mechanism, more points for less clicks on songs etc
// make correct or incorrect icon appear over image when clicked instead of below it
// share score on twitter option?
// redirect settimeout still fires after 5 seconds even when button clicked, kicks you out of next game
// site crashing sometimes, finding it with chill genre, stuck in loop in handleSongs()

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
    livesRemaining: Array<number> = []
    selectedGenre: string = ''
    availableSongs: Array<any> = []
    randomIndex: number = 0
    artists: Array<any> = []
    isCorrect: boolean = false
    guessed: boolean = false
    previousCorrectArtistName: string = ''
    correctArtistName: string = ''
    correctArtistData: any = {}
    isWrong: boolean = false
    hitPlay: boolean = false
    totalScore: number = 0
    totalElapsed: number = -1
    isAutoplay: boolean = true
    numSongs: number = 1
    songsArr: Array<any> = []
    wrongCounter: number = 0
    isError: boolean = false
    redirectTime: number = 3000
    countdown: any = this.redirectTime / 1000
    songIndex: number = 0
    nextDisabled: boolean = false
    prevDisabled: boolean = true

    constructor(
        private http: HttpClient,
        private service: GeneralService,
        private router: Router
    ) {}

    ngOnDestroy(): void {
        this.getSongs().unsubscribe()
        this.handleSongs('').unsubscribe()
    }

    ngOnInit(): void {
        this.numSongs = this.service.numSongs
        this.selectedGenre = this.service.selectedGenre
        for (let i = 0; i < this.service.guessAmount; i++)
            this.livesRemaining.push(1)
        this.getSongs()
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
                    if (this.availableSongs.length === 0) this.redirectHome()
                    this.randomIndex = Math.floor(
                        Math.random() * (this.availableSongs.length - 1)
                    )
                    if (
                        this.availableSongs[this.randomIndex].artists[0]
                            .name === this.previousCorrectArtistName
                    )
                        this.randomIndex += 1
                    this.correctArtistName =
                        this.availableSongs[this.randomIndex].artists[0].name
                    this.correctArtistData =
                        this.availableSongs[this.randomIndex]
                    this.handleSongs(this.correctArtistData.artists[0].id)
                    this.handleArtists(this.service.numArtists)
                },
                error: e => {
                    console.log(e)
                    this.isError = true
                    this.redirectHome()
                },
            })
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
                    this.songsArr.push(this.correctArtistData)
                    let i = 0
                    let j = 0
                    while (j < this.numSongs - 1) {
                        let preview_urls: Array<string> = []
                        for (let song of this.songsArr)
                            preview_urls.push(song.preview_url)
                        for (let track of obj.tracks) {
                            if (
                                track.preview_url != null &&
                                !preview_urls.includes(track.preview_url) &&
                                i < this.numSongs - 1
                            ) {
                                this.songsArr.push(track)
                                i++
                            }
                        }
                        j++
                    }
                },
                error: e => {
                    console.log(e)
                    this.isError = true
                    this.redirectHome()
                },
            })
    }

    resetStuff(): void {
        this.songIndex = 0
        this.prevDisabled = true
        this.nextDisabled = false
        this.previousCorrectArtistName = this.correctArtistName
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

    checkArtistClicked(name: any): void {
        this.guessed = true
        if (name === this.correctArtistName) {
            this.isCorrect = true
            this.totalScore++
        } else this.isWrong = true
        setTimeout(() => {
            this.getSongs()
        }, 100)
    }

    nextSong() {
        this.prevDisabled = false
        if (this.songIndex < this.songsArr.length - 1) this.songIndex += 1
        if (this.songIndex === this.songsArr.length - 1)
            this.nextDisabled = true
    }

    prevSong() {
        this.nextDisabled = false
        if (this.songIndex > 0) this.songIndex -= 1
        if (this.songIndex === 0) this.prevDisabled = true
    }

    redirectHome() {
        this.isError = true
        setTimeout(() => {
            this.redirectTime -= 1000
            this.countdown = this.redirectTime / 1000
            if (this.redirectTime > 0) this.redirectHome()
        }, 1000)
        setTimeout(() => {
            this.router.navigateByUrl('')
            this.isError = false
        }, this.redirectTime)
    }

    test() {
        console.log(this.availableSongs)
        console.log(this.songsArr)
    }
}
