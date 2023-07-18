import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root',
})
export class GeneralService {
    token: string = ''
    selectedGenre: string = ''
    numArtists: number = 2
    numSongs: number = 1
    guessType: String = 'easy'
    constructor() {}
}
