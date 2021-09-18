import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>

          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

          <link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
        </Head>
        <body>
          <Main />
          {/* Todo conteúdo da aplicação será renderizado neste Main */}

          <NextScript />
          {/* NextScript é onde o next colocará os arquivos JS que farão a aplicação funcionar. */}
        </body>
      </Html>
    )
  }
}
