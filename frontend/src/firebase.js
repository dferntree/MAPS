// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
 } from "firebase/auth";
import { createUser } from "./api/api"

// Web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inititalize Firebase Authentication and export it
export const auth = getAuth(app)

//SIGN UP= Create Firebase user AND store in DB

export const signUpUser = async (email, password) => {
  try {

    console.log('Creating Firebase user account')

    //Step 1: Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log('Firebase user created:', user.uid)
    console.log('Storing user in PostgreSQL DB')

    //Step 2: Store user in YOUR DB

    await createUser({ userId: user.uid, email: user.email })

    console.log('User stored in DB!')
    console.log('Sign up complete!')

    return user
  } catch (error) {
    console.error('Signup error', error.code, error.message)
    throw error
  }
}

//LOGIN - Authenticate Existing user

export const loginUser = async (email, password) => {
  try {
    console.log('Logging in user...')

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    console.log('Login successful:', user.email)

    return user
  } catch (error) {
    console.error('Login error:', error.code, error.message)
    throw error
  }
}

//LOGOUT - Sign out current user

export const logoutUser = async () => {
  try{
    console.log('Logging out...')
    await signOut(auth)
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

// AUTH STATE LISTENER - Monitor login/logout state

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback)
}
// Keeps user logged in across page refreshes, without would flicker between pages and user would appear to be logged out

// GET CURRENT USER - Get currently logged in user

export const getCurrentUser = () => {
  return auth.currentUser
}
