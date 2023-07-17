import { Component, OnInit } from '@angular/core'
import fetchFromSpotify, { request } from '../../services/api'
import { HttpClient } from '@angular/common/http'
import { GeneralService } from '../general.service'

const AUTH_ENDPOINT =
    'https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token'
const TOKEN_KEY = 'whos-who-access-token'

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
    static token: string
    constructor(private http: HttpClient, private service: GeneralService) {}

    genres: String[] = ['House', 'Alternative', 'J-Rock', 'R&B']
    songs: number[] = [2, 3, 4, 5, 6, 7, 8]
    artists: number[] = [2, 3, 4, 5, 6, 7, 8]
    selectedGenre: String = ''
    selectedSong: String = ''
    selectedArtist: number = 2
    authLoading: boolean = false
    configLoading: boolean = false
    token: String = ''

    ngOnInit(): void {
        this.authLoading = true
        const storedTokenString = localStorage.getItem(TOKEN_KEY)
        if (storedTokenString) {
            const storedToken = JSON.parse(storedTokenString)
            if (storedToken.expiration > Date.now()) {
                console.log('Token found in localstorage')
                this.authLoading = false
                this.token = storedToken.value
                this.service.token = storedToken.value
                this.loadGenres(storedToken.value)
                return
            }
        }
        console.log('Sending request to AWS endpoint')
        request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
            const newToken = {
                value: access_token,
                expiration: Date.now() + (expires_in - 20) * 1000,
            }
            localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken))
            this.authLoading = false
            this.token = newToken.value
            this.service.token = newToken.value
            this.loadGenres(newToken.value)
        })
    }

    loadGenres = async (t: any) => {
        this.configLoading = true
        const response = await fetchFromSpotify({
            token: t,
            endpoint: 'recommendations/available-genre-seeds',
        })
        console.log(response)
        this.genres = response.genres
        this.configLoading = false
    }

    setGenre(selectedGenre: any) {
        this.selectedGenre = selectedGenre
        this.service.selectedGenre = selectedGenre
        console.log(this.selectedGenre)
        console.log(TOKEN_KEY)
    }

    setSong(selectedSong: any) {
        this.selectedSong = selectedSong
        console.log(this.selectedSong)
        console.log(TOKEN_KEY)
    }

    setArtist(selectedArtist: any) {
        this.selectedArtist = selectedArtist
        console.log(this.selectedArtist)
        console.log(TOKEN_KEY)
    }

    testApi() {
        return this.http
            .get(
                'https://api.spotify.com/v1/search?q=genre%3Ametal&type=track',
                { headers: { Authorization: `Bearer ${this.token}` } }
            )
            .subscribe(data => {
                console.log(data)
            })
    }

    syncWithService() {
        this.service.numArtists = this.selectedArtist
    }
}
