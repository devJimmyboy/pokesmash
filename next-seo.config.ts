import { NextSeoProps } from 'next-seo'

const SEO: NextSeoProps = {
  titleTemplate: 'PokeSmash | %s',
  defaultTitle: 'PokeSmash',
  title: 'Pokémon Smash or Pass',
  description: `A simple concept, really. Smash or Pass has been instilled in society since the rise of dating apps (and possibly longer). Recently, however, YouTube personality Markiplier started a trend applying the simplicity of Smash or Pass to the vast complexity of Pokémon.
  This website is a means of making that trend have more mainstream accessibility.
  Even if you have done a Pokémon Smash or Pass, this site will show you how far off the average your opinion is and more!`,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pokesmash.xyz/',
    images: [
      {
        url: 'https://pokesmash.xyz/meta.png',
        width: 1200,
        height: 628,
        alt: 'PokeSmash Pokemon Smash or Pass',
      },
    ],
  },
  twitter: {
    handle: '@devJimmyboy',
    site: '@devJimmyboy',
    cardType: 'summary_large_image',
  },
}

export default SEO
