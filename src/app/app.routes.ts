import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    // TODO: Guards
    canMatch: [
      NotAuthenticatedGuard,
      // () => {
      //   console.log('Hola mundo')
      //   return true;
      // }
    ]
  },
  {
    path: '',
    loadChildren: () => import('./store-front/store-front.routes'),
  },
];
