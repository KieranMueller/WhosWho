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

// Tweak UI, css, mobile friendly, loading pages?
// add highest streaks in view record strip, local storage
// add a point system instead? weighting mechanism, more points for less clicks on songs etc, difficulty
// make correct or incorrect icon appear over image when clicked instead of below it
// share score on twitter option?
// style things like spotify
// internet slow error message
// make some configuration setting sliders not dropdowns?
// work on contact/about the creators page
// don't allow same song to ever be played twice in one game
// split this component into smaller components, someday... especially toggle autoplay
// make audio player more attractive
// game component UI is too cluttered
// store light/dark mode in localstorage

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
    highScore: number = 0
    isViewingRecords: boolean = false
    scoreTracker: Array<number> = []
    rightStreak: number = 0
    wrongStreak: number = 0
    isDarkMode: boolean = true

    constructor(
        private http: HttpClient,
        private service: GeneralService,
        private router: Router
    ) {}

    ngOnDestroy(): void {
        this.getSongs().unsubscribe()
        this.handleSongs('').unsubscribe()
        this.calculateStreaks()
        this.saveLocalStorage()
    }

    ngOnInit(): void {
        this.numSongs = this.service.numSongs
        this.selectedGenre = this.service.selectedGenre
        this.isDarkMode = this.service.isDarkMode
        for (let i = 0; i < this.service.guessAmount; i++)
            this.livesRemaining.push(1)
        this.getLocalStorage()
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
                                i < this.numSongs
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
            if (this.totalScore > this.highScore)
                this.highScore = this.totalScore
            this.scoreTracker.push(1)
        } else {
            this.isWrong = true
            this.scoreTracker.push(0)
        }
        setTimeout(() => {
            this.getSongs()
        }, 100)
    }

    calculateStreaks() {
        let right = 0
        let wrong = 0
        let rightStreak = 0
        let wrongStreak = 0
        for (let i = 0; i < this.scoreTracker.length; i++) {
            if (this.scoreTracker[i] === 1) {
                right++
            } else right = 0
            if (this.scoreTracker[i] === 0) {
                wrong++
            } else wrong = 0
            if (right > rightStreak) rightStreak = right
            if (wrong > wrongStreak) wrongStreak = wrong
        }
        if (rightStreak > this.rightStreak) this.rightStreak = rightStreak
        if (wrongStreak > this.wrongStreak) this.wrongStreak = wrongStreak
    }

    nextSong(): void {
        this.prevDisabled = false
        if (this.songIndex < this.songsArr.length - 1) this.songIndex += 1
        if (this.songIndex === this.songsArr.length - 1)
            this.nextDisabled = true
    }

    prevSong(): void {
        this.nextDisabled = false
        if (this.songIndex > 0) this.songIndex -= 1
        if (this.songIndex === 0) this.prevDisabled = true
    }

    getUrl(): string {
        let message =
            `I correctly guessed ${this.totalScore} artists out of ${this.totalElapsed}` +
            ` playing WhosWho! See if you can beat my score! http://localhost:4200` +
            ` %23WhosWho %23GuessTheArtist %23Spotify`
        return `https://twitter.com/intent/tweet?text=${message}`
    }

    redirectHome(): void {
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

    recordsTimeout() {
        setTimeout(() => {
            this.isViewingRecords = true
        }, 1000)
    }

    saveLocalStorage() {
        localStorage.setItem('highScore', String(this.highScore))
        localStorage.setItem('autoplay', JSON.stringify(this.isAutoplay))
        localStorage.setItem('rightStreak', String(this.rightStreak))
        localStorage.setItem('wrongStreak', String(this.wrongStreak))
        localStorage.setItem('isDarkMode', String(this.isDarkMode))
    }

    getLocalStorage() {
        const savedHighScore = localStorage.getItem('highScore')
        if (savedHighScore) {
            const parsedSavedHighScore = parseInt(savedHighScore, 10)
            if (parsedSavedHighScore > this.highScore) {
                this.highScore = parsedSavedHighScore
            }
        }
        const savedAutoplay = localStorage.getItem('autoplay')
        if (savedAutoplay)
            savedAutoplay === 'true'
                ? (this.isAutoplay = true)
                : (this.isAutoplay = false)
        const savedRightStreak = localStorage.getItem('rightStreak')
        if (savedRightStreak) {
            const parsedRightStreak = parseInt(savedRightStreak, 10)
            this.rightStreak = parsedRightStreak
        }
        const savedWrongStreak = localStorage.getItem('wrongStreak')
        if (savedWrongStreak) {
            const parsedWrongStreak = parseInt(savedWrongStreak, 10)
            this.wrongStreak = parsedWrongStreak
        }
        const isDarkMode = localStorage.getItem('isDarkMode')
        if (isDarkMode)
            if (isDarkMode === 'true') {
                this.isDarkMode = true
                this.service.isDarkMode = true
            } else {
                this.isDarkMode = false
                this.service.isDarkMode = false
            }
    }
}
