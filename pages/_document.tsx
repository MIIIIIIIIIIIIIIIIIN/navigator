import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      
      <Head />
      <body>
        <Main />
        <script async src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBKDg3XGgB40sS1IFfYpcrYk3X91B_XNf0&callback=console.debug&libraries=maps,marker&v=beta">
        </script>
        <NextScript />
      </body>
    </Html>
  );
}
