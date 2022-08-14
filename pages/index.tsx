import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { usePlaidLink } from "react-plaid-link";
import Link from 'next/link'
import { gql, useQuery } from '@apollo/client'

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      email
      referralNo
      referralCode
    }
  }
`
const Index = () => {
  const router = useRouter()
  const { data, loading, error } = useQuery(ViewerQuery)
  const viewer = data?.viewer
  const shouldRedirect = !(loading || error || viewer)
  const [linkToken, setLinkToken] = useState(null);
  const [isPlaidConnected, setIsPlaidConnected] = useState(false);

  const generateToken = async () => {
    const response = await fetch('/plaid/create_link_token', {
      method: 'POST',
    });
    const data = await response.json();
    setLinkToken(data.link_token);
  };

  const getPlaidResponse = async () => {
    const authResponse = await fetch(`/plaid/auth`, { 
      method: "GET",
    });
    const data = await authResponse.json();
    const dataString = JSON.stringify(data, null, 2);
    document.getElementById("plaidResponse").innerHTML = dataString;
  }

  const displayBeforePlaidConnect = () => {
    document.getElementById("plaidResponse").innerHTML = "Please connect to plaid first!";
  }

  const onSuccess = React.useCallback(
    (public_token: string) => {
      // send public_token to server
      const setToken = async () => {
        const response = await fetch("/plaid/set_access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: `public_token=${public_token}`,
        });
        if (!response.ok) {
          return;
        }
        setIsPlaidConnected(true);
      };
      setToken();
    },[]);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    generateToken();
    if (shouldRedirect) {
      router.push('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRedirect])



  if (error) {
    return <p>{error.message}</p>
  }

  if (viewer) {

    return (
      <>
      <div className = "justify-center py-16 px-80">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and Plaid account.</p>
            </div>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="flex-grow">{viewer.email}</span>
                    <span className="ml-4 flex-shrink-0">
                      <Link href="/signout">
                        <a className="rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Sign Out
                        </a>
                      </Link>
                    </span>
                  </dd>
                </div>

                <div className="py-4 sm:grid sm:py-5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Referral Code</dt>
                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="flex-grow">{viewer.referralCode}</span>
                  </dd>
                </div>

                <div className="py-4 sm:grid sm:py-5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Referral Number</dt>
                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="flex-grow">{viewer.referralNo}</span>
                  </dd>
                </div>

                <div className="py-4 sm:grid sm:py-5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Referral Bonus</dt>
                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="flex-grow"> ${viewer.referralNo * 5}</span>
                  </dd>
                </div>

                <div className="py-4 sm:grid sm:py-5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Plaid Account</dt>
                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="flex-grow">
                      Plaid is a fintech service that help applications connect with users&apos; bank accounts. 
                      Click the &quot;Connect&quot; button to experience plaid in action!
                    </span>
                    <span className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        className="rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick = {() => open()}
                      >
                        Connect
                      </button>
                    </span>
                  </dd>
                </div>

                <div className="py-4 sm:grid sm:py-5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Plaid Response</dt>
                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="flex-grow" id = "plaidResponse">

                    </span>
                    <span className="ml-4 flex-shrink-0">
                      <button
                        type="button"
                        className="rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick = {isPlaidConnected? getPlaidResponse : displayBeforePlaidConnect}
                      >
                        View Response
                      </button>
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </>
    )


    /*
    return (
      <div>
        You're signed in as {viewer.email} {' '}
        <Link href="/signout">
          <a>signout</a>
        </Link>
        <br/>
        Your referral code is {viewer.referralCode} <br/>
        You have referred {viewer.referralNo} users <br/>
        Your current referral bonus is ${viewer.referralNo * 5} <br/> <br/>
        <button type="button" onClick = {() => open()}>Connect to Plaid</button> <br/><br/>
        {isPlaidConnected? <div><button type="button" onClick = {getPlaidResponse}>View Plaid Response</button></div>: null }
      <pre id = "plaidResponse"></pre>
      </div>
    )
    */
  }

  return <p>Loading...</p>
}

export default Index
