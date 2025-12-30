// ============================================
// CONFIGURACIÓN DE PLAYLIST DE WINAMP
// ============================================

/*
Para agregar canciones al reproductor Winamp:

1. Coloca tus archivos MP3 en la carpeta: assets/music/

2. Ve al archivo script.js y busca la función loadWinampPlaylist()

3. En el array musicFiles, agrega las rutas de tus canciones:

Ejemplo:
*/

const musicFiles = [
    'assets/music/cancion1.mp3',
    'assets/music/cancion2.mp3',
    'assets/music/cancion3.mp3',
    // Agrega más canciones aquí...
];

/*
4. Guarda el archivo y recarga la página

FORMATOS SOPORTADOS:
- MP3 (recomendado)
- OGG
- WAV

EJEMPLO COMPLETO:

En script.js, línea ~738, reemplaza:

    const musicFiles = [];

Por:

    const musicFiles = [
        'assets/music/song1.mp3',
        'assets/music/song2.mp3',
    ];

*/
