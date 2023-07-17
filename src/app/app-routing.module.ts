import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { HomeComponent } from './home/home.component'
import { GameComponent } from './game/game.component'

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'game', component: GameComponent },
]

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
