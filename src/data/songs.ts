export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  audioUrl: string;
  coverImage: string;
}

export const tamilSongs: Song[] = [
  {
    id: 1,
    title: "Kannalane",
    artist: "A.R. Rahman",
    album: "Bombay",
    audioUrl: "/music/kannalane.mp3",
    coverImage: "/images/kannalane.jpg"
  },
  {
    id: 2,
    title: "Munbe Vaa",
    artist: "A.R. Rahman",
    album: "Sillunu Oru Kaadhal",
    audioUrl: "/music/munbe-vaa.mp3",
    coverImage: "/images/munbe-vaa.jpg"
  },
  {
    id: 3,
    title: "Kadhal Rojave",
    artist: "A.R. Rahman",
    album: "Roja",
    audioUrl: "/music/kadhal-rojave.mp3",
    coverImage: "/images/kadhal-rojave.jpg"
  },
  {
    id: 4,
    title: "Vennilave",
    artist: "Ilaiyaraaja",
    album: "Minsara Kanavu",
    audioUrl: "/music/vennilave.mp3",
    coverImage: "/images/vennilave.jpg"
  },
  {
    id: 5,
    title: "Uyire",
    artist: "A.R. Rahman",
    album: "Bombay",
    audioUrl: "/music/uyire.mp3",
    coverImage: "/images/uyire.jpg"
  },
  {
    id: 6,
    title: "Why This Kolaveri Di",
    artist: "Anirudh Ravichander",
    album: "3",
    audioUrl: "/music/why-this-kolaveri-di.mp3",
    coverImage: "/images/why-this-kolaveri-di.jpg"
  },
  {
    id: 7,
    title: "Thalli Pogathey",
    artist: "A.R. Rahman",
    album: "Achcham Yenbadhu Madamaiyada",
    audioUrl: "/music/thalli-pogathey.mp3",
    coverImage: "/images/thalli-pogathey.jpg"
  },
  {
    id: 8,
    title: "Rowdy Baby",
    artist: "Yuvan Shankar Raja",
    album: "Maari 2",
    audioUrl: "/music/rowdy-baby.mp3",
    coverImage: "/images/rowdy-baby.jpg"
  },
  {
    id: 9,
    title: "Nenjukkul Peidhidum",
    artist: "Yuvan Shankar Raja",
    album: "Vaaranam Aayiram",
    audioUrl: "/music/nenjukkul-peidhidum.mp3",
    coverImage: "/images/nenjukkul-peidhidum.jpg"
  },
  {
    id: 10,
    title: "Vaseegara",
    artist: "Harris Jayaraj",
    album: "Minnale",
    audioUrl: "/music/vaseegara.mp3",
    coverImage: "/images/vaseegara.jpg"
  }
];
