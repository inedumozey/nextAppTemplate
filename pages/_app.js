import ScrollToTop from "react-scroll-to-top";
import NextProgress from 'nextjs-progressbar';
import Head from 'next/head'
import { ContextApi } from "../contextApi/ContextApi";
import { GlobalStyle } from "../styles/globalStyles";

function MyApp({ Component, pageProps }) {


  return (
    <>

      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=1"
        />
      </Head>
      <GlobalStyle />
      <ScrollToTop smooth color="var(--major-color-purest)" style={{ background: 'rgba(0,0,0,.2)' }} />

      <NextProgress options={{ showSpinner: false }} />

      <ContextApi>
        <Component {...pageProps} />
      </ContextApi>

    </>
  )
}

export default MyApp
