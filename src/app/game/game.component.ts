import { HttpClient } from '@angular/common/http'
import { Component, OnDestroy, OnInit, Input } from '@angular/core'
import { GeneralService } from '../general.service'

// TO FIX! Correct answer is always on the left lol

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
    artists: any = []
    isCorrect: boolean = false
    guessed: boolean = false
    correctArtistName: string = ''
    isWrong: boolean = false
    hitPlay: boolean = false
    totalScore: number = 0
    totalElapsed: number = -1
    isAutoplay: boolean = false

    constructor(private http: HttpClient, private service: GeneralService) {}

    ngOnDestroy(): void {
        this.getSongs().unsubscribe()
    }
    ngOnInit(): void {
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
        this.isCorrect = false
        this.isWrong = false
        this.guessed = false
        this.hitPlay = true
        this.totalElapsed++
        this.availableSongs = []
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
                next: data => this.artists.push(data),
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
}
