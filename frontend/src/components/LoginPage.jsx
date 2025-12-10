import BannerRed from '../assets/BannerRed.png';
import LogoLegs from '../assets/LogoLegs.png'
import { useState } from 'react'
import { signUpUser, loginUser } from '../firebase'


function LoginPage({ onAuthSuccess }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false) // tracks whether user is signing up or logging in
    const [error, setError] = useState('') // will store error messages to show user (i.e. invalid email)
    const [loading, setLoading] = useState(false) // shows loading button

    const handleSubmit = async (e) => {
        e.preventDefault() //stops page refresh on form submit

        setError('')
        setLoading(true)

        try {
            if (isSignUp) {
                await signUpUser(email, password) // if sign up create a new acc
            } else {
                await loginUser(email, password)
            }

            onAuthSuccess() // passes auth change back to App, triggers re-render
        
        } catch (error) {
             if(error.code === 'auth/email-already-in-use'){
                setError('Email already in use')
            } else if(error.code === 'auth/weak-password'){
                setError('Password should be at least 6 characters')
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address')
            } else if (error.code === 'auth/user-not-found') {
                setError('No account found with this email')
            } else if (error.code === 'auth/wrong-password') {
                setError('Incorrect password')
            } else {
                setError(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

  return (
  <div className="min-h-screen bg-[#FFF5E6] flex flex-col items-center">

    <div className="flex flex-col items-center w-full">

      {/* Banner */}
      <div className="relative inline-block">
        <img
          src={BannerRed}
          alt="Banner"
          className="w-[350px] mx-auto"
        />
        <h1
          className="
            absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 
            font-bold text-[#5C2E12] text-xs
          "
        >
          Hello Student!
        </h1>
      </div>

      {/* Logo (sprite) */}
      <img
        src={LogoLegs}
        className="w-[250px] h-[250px] logo-bounce"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Form container */}
      <div
        className="
          bg-[#E5B276]
          border-4 border-[#8A4B27]
          rounded-xl
          shadow-[6px_6px_0px_#5C2E12]
          w-full max-w-md
          p-6
          text-center
        "
      >
        <h2 className="text-xl font-bold text-[#5C2E12] mb-4">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="
              bg-[#FFE8C9]
              border-4 border-[#8A4B27]
              rounded-lg
              px-3 py-2
              focus:outline-none focus:border-[#5C2E12]
              text-[#5C2E12]
            "
          />

          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="
              bg-[#FFE8C9]
              border-4 border-[#8A4B27]
              rounded-lg
              px-3 py-2
              focus:outline-none focus:border-[#5C2E12]
              text-[#5C2E12]
            "
          />

          {error && (
            <p className="text-red-700 font-semibold text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              bg-[#D4904F]
              border-4 border-[#8A4B27]
              rounded-xl
              px-6 py-2
              text-white font-bold
              shadow-[4px_4px_0px_#5C2E12]
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
            "
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <p className="mt-4 text-[#5C2E12] font-medium text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="ml-1 text-blue-700 underline"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  </div>

);
}

export default LoginPage
