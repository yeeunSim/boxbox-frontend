import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* 모바일 배율/줌 기본값 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* iOS 자동 전화번호 감지 방지(선택) */}
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
