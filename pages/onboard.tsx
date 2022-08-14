import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getErrorMessage } from '../lib/form'
import { gql, useMutation } from '@apollo/client';

const onboardMutation = gql`
  mutation onboardMutation($email: String!, $password: String!, $inputReferralCode: String) {
    onboard(input: {email: $email, password: $password, inputReferralCode: $inputReferralCode}) {
      email
    }
  }
`
// Don't return password for security!

function Onboard() {
  const [onboard] = useMutation(onboardMutation)
  const [errorMsg, setErrorMsg] = useState()
  const router = useRouter()

  async function handleSubmit(event) {
    event.preventDefault()
    const emailElement = event.currentTarget.elements.email
    const passwordElement = event.currentTarget.elements.password
    const inputReferralCodeElement = event.currentTarget.elements.referralCode


    try {
      const {data} = await onboard({
        variables: {
          email: emailElement.value,
          password: passwordElement.value,
          inputReferralCode: inputReferralCodeElement.value
        },
      })
      router.push('/login')

    } catch (error) {
      setErrorMsg(getErrorMessage(error))
    }
  }

  return (
    <>

      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign up for a new account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}

            <Link href="/login">
                  <a className="font-medium text-indigo-600 hover:text-indigo-500">
                      Sign in
                  </a>
            </Link>

          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" action="#" method="POST" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter valid email with a @ and dot"
                    pattern = "[^@\s]+@[^@\s]+\.[^@\s]+"
                    title = "Please enter a valid email with a @ and a dot"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="At least 6 characters, with 1 number and 1 alphabet."
                    pattern="^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$"
                    title ="At least 6 characters, with 1 number and 1 alphabet."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">
                  Referral Code
                </label>
                <div className="mt-1">
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    autoComplete="on"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter valid referral code"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="error-msg" className="ml-2 block text-xs text-red-600">
                    {errorMsg? <p>{errorMsg} </p>: <p> &nbsp; </p>}
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )

  /*
  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
              alt="Workflow"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign up for a new account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/login">
                  <a className="font-medium text-indigo-600 hover:text-indigo-500">
                      Sign in
                  </a>
                </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" action="#" method="POST" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">

              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  pattern = "[^@\s]+@[^@\s]+\.[^@\s]+"
                />
              </div>



              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  pattern="^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$"
                  title ="Password must have at least 6 characters, with 1 number and 1 alphabet."
                />
              </div>

              <div>
                <label htmlFor="referral-code" className="block text-sm font-medium text-gray-700">
                  Referral Code
                </label>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  autoComplete="on"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Referral Code"
                />
              </div>

            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label htmlFor="error-msg" className="ml-2 block text-xs text-red-600">
                    {errorMsg? <p>{errorMsg} </p>: <p> &nbsp; </p>}
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
  */
}

export default Onboard
