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

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
    livesRemaining: Array<number> = []
    selectedGenre: string = ''
    artists: Array<any> = []
    isCorrect: boolean = false
    guessed: boolean = false
    previousCorrectArtistName: string = ''
    correctArtistName: string = ''
    isWrong: boolean = false
    totalScore: number = 0
    totalElapsed: number = 0
    isAutoplay: boolean = true
    songsArr: Array<any> = []
    wrongCounter: number = 0
    isError: boolean = false
    redirectTime: number = 2000
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
    artistIds: Array<any> = []
    numWrongInRound: number = 0

    constructor(
        private http: HttpClient,
        private service: GeneralService,
        private router: Router
    ) {}

    ngOnDestroy(): void {
        this.calculateStreaks()
        this.saveLocalStorage()
    }

    ngOnInit(): void {
        this.selectedGenre = this.service.selectedGenre
        this.isDarkMode = this.service.isDarkMode
        for (let i = 0; i < this.service.guessAmount; i++)
            this.livesRemaining.push(1)
        this.getLocalStorage()
        this.getSongs()
    }

    getSongs(): void {
        this.http
            .get(
                `https://api.spotify.com/v1/search?q=genre%3A${this.service.selectedGenre}&type=track&limit=50&include_external=audio`,
                { headers: { Authorization: `Bearer ${this.service.token}` } }
            )
            .subscribe({
                next: (data: any) => {
                    this.resetStuff()
                    let i = 0
                    let j = 0
                    while (i < this.service.numArtists) {
                        let randomIndex = Math.floor(
                            Math.random() * data.tracks.items.length
                        )
                        if (
                            !this.artistIds.includes(
                                data.tracks.items[randomIndex].artists[0].id
                            )
                        ) {
                            this.artistIds.push(
                                data.tracks.items[randomIndex].artists[0].id
                            )
                            i++
                        }
                        j++
                        if (j === 50) this.redirectHome()
                    }
                    if (this.artistIds.length === 0) this.redirectHome()
                    this.handleSongs([...this.artistIds])
                },
                error: e => {
                    console.log(e)
                    this.redirectHome()
                },
            })
    }

    handleSongs(artistIds: Array<string>) {
        let foundRightArtist = false
        for (let i = 0; i < artistIds.length; i++) {
            this.http
                .get(
                    `https://api.spotify.com/v1/artists/${artistIds[i]}/top-tracks?market=US`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.service.token}`,
                        },
                    }
                )
                .subscribe({
                    next: (data: any) => {
                        let validCount = 0
                        if (!foundRightArtist)
                            for (let track of data.tracks)
                                if (
                                    track.preview_url != null &&
                                    this.previousCorrectArtistName !==
                                        track.album.artists[0].name
                                )
                                    validCount++
                        if (validCount >= this.service.numSongs) {
                            foundRightArtist = true
                            this.correctArtistName =
                                data.tracks[0].album.artists[0].name
                            let tempSongsArr: any = []
                            for (let track of data.tracks)
                                if (track.preview_url != null)
                                    tempSongsArr.splice(
                                        Math.floor(
                                            Math.random() * tempSongsArr.length
                                        ),
                                        0,
                                        track
                                    )
                            for (let i = 0; i < this.service.numSongs; i++)
                                this.songsArr.push(tempSongsArr[i])
                        }
                        this.artists.splice(
                            Math.floor(Math.random() * this.artists.length),
                            0,
                            data.tracks[
                                Math.floor(Math.random() * data.tracks.length)
                            ]
                        )
                    },
                    error: e => {
                        console.log(e)
                        this.redirectHome()
                    },
                })
        }
    }

    resetStuff(): void {
        this.songIndex = 0
        this.prevDisabled = true
        this.nextDisabled = false
        this.numWrongInRound = 0
        this.previousCorrectArtistName = this.correctArtistName
        this.songsArr = []
        this.artistIds = []
        this.artists = []
        this.isCorrect = false
        this.isWrong = false
        this.guessed = false
    }

    checkArtistClicked(name: any): void {
        this.isViewingRecords = false
        if (name === this.correctArtistName) {
            this.guessed = true
            this.isCorrect = true
            this.handleScoring()
            this.totalElapsed++
            if (this.totalScore > this.highScore)
                this.highScore = this.totalScore
            this.scoreTracker.push(1)
            setTimeout(() => {
                this.getSongs()
            }, 100)
        } else {
            this.isWrong = true
            this.numWrongInRound++
            setTimeout(() => {
                this.isWrong = false
            }, 400)
            this.scoreTracker.push(0)
            this.livesRemaining.pop()
        }
    }

    handleScoring() {
        let scoreBefore = this.totalScore
        let multiplier = 1
        if (this.artists.length >= 6) multiplier = 2.3
        else if (this.artists.length > 4) multiplier = 1.9
        else if (this.artists.length > 2) multiplier = 1.3
        else if (this.artists.length <= 2) multiplier = 1
        if (this.service.numSongs === 1) multiplier += 3
        else if (this.service.numSongs < 4) multiplier += 1.5
        if (this.numWrongInRound === 0) this.totalScore += 1000 * multiplier
        else if (this.numWrongInRound < 3) this.totalScore += 500 * multiplier
        else if (this.numWrongInRound < 6) this.totalScore += 200 * multiplier
        else this.totalScore += 50 * multiplier
        let score = this.totalScore - scoreBefore
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
            `I just got ${this.totalScore} points guessing ${this.selectedGenre} artists` +
            ` playing WhosWho! See if you can beat my score! https://spotify-whos-who.netlify.app/` +
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
        localStorage.setItem('autoplay', String(this.isAutoplay))
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
