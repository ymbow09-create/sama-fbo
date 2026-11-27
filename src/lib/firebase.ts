
import { initializeApp } from 'firebase/app'
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBZowWBPbEsI15TuUKzgkOK7UVVYgx9LJg',
  authDomain: 'sama-fbo.firebaseapp.com',
  projectId: 'sama-fbo',
  storageBucket: 'sama-fbo.firebasestorage.app',
  messagingSenderId: '834231209735',
  appId: '1:834231209735:web:61370420b93f2ba7707fa2',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export const facebookProvider = new FacebookAuthProvider()
