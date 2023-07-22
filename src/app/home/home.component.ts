import { Component, OnInit } from '@angular/core'
import fetchFromSpotify, { request } from '../../services/api'
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
    constructor(private service: GeneralService) {}

    genres: String[] = ['House', 'Alternative', 'J-Rock', 'R&B']
    songs: number[] = [1, 2, 3, 4, 5, 6, 7, 8]
    artists: number[] = [2, 3, 4, 5, 6]
    guesses: String[] = ['easy', 'medium', 'hard']
    selectedGenre: String = ''
    selectedSong: number = 1
    selectedArtist: number = 2
    selectedGuesses: String = 'easy'
    authLoading: boolean = false
    configLoading: boolean = false
    token: String = ''
    isDarkMode: boolean = true

    ngOnInit(): void {
        this.authLoading = true
        this.isDarkMode = this.service.isDarkMode
        const storedTokenString = localStorage.getItem(TOKEN_KEY)
        if (storedTokenString) {
            const storedToken = JSON.parse(storedTokenString)
            if (storedToken.expiration > Date.now()) {
                console.log('Token found in localstorage')
                this.authLoading = false
                this.token = storedToken.value
                this.service.token = storedToken.value
                this.loadGenres(storedToken.value)
                this.getDataFromLocalStorage()
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
        this.getDataFromLocalStorage()
    }

    ngOnDestroy(): void {
        this.service.isDarkMode = this.isDarkMode
        this.saveDataToLocalStorage()
    }

    loadGenres = async (t: any) => {
        this.configLoading = true
        const response = await fetchFromSpotify({
            token: t,
            endpoint: 'recommendations/available-genre-seeds',
        })
        this.genres = response.genres
        this.configLoading = false
    }

    setGenre(selectedGenre: any) {
        this.selectedGenre = selectedGenre
        this.service.selectedGenre = selectedGenre
    }

    syncWithService() {
        this.service.numArtists = this.selectedArtist
        this.service.numSongs = this.selectedSong
        switch (this.selectedGuesses) {
            case 'easy': {
                this.service.guessAmount = 10
                break
            }
            case 'medium': {
                this.service.guessAmount = 5
                break
            }
            case 'hard': {
                this.service.guessAmount = 1
                break
            }
        }
    }

    changeTheme() {
        this.isDarkMode = !this.isDarkMode
        this.service.isDarkMode = !this.service.isDarkMode
        this.saveDataToLocalStorage()
    }

    // Method to save data to local storage
    saveDataToLocalStorage(): void {
        localStorage.setItem('selectedGenre', String(this.selectedGenre))
        localStorage.setItem('selectedSong', String(this.selectedSong))
        localStorage.setItem('selectedArtist', String(this.selectedArtist))
        localStorage.setItem('selectedGuesses', String(this.selectedGuesses))
        localStorage.setItem('isDarkMode', String(this.isDarkMode))
    }

    // Method to get data from local storage
    getDataFromLocalStorage(): void {
        const storedGenre = localStorage.getItem('selectedGenre')
        const storedSong = localStorage.getItem('selectedSong')
        const storedArtist = localStorage.getItem('selectedArtist')
        const storedGuesses = localStorage.getItem('selectedGuesses')
        const isDarkMode = localStorage.getItem('isDarkMode')

        if (storedGenre) {
            this.selectedGenre = storedGenre
            this.service.selectedGenre = storedGenre
        }

        if (storedSong) {
            this.selectedSong = parseInt(storedSong, 10)
        }

        if (storedArtist) {
            this.selectedArtist = parseInt(storedArtist, 10)
        }

        if (storedGuesses) {
            this.selectedGuesses = storedGuesses
        }

        if (isDarkMode) {
            if (isDarkMode === 'true') {
                this.service.isDarkMode = true
                this.isDarkMode = true
            } else {
                this.service.isDarkMode = false
                this.isDarkMode = false
            }
        }
    }
}
