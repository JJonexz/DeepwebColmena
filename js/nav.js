/* =====================================================
   La Colmena — nav.js
   Comunicación iframe → parent via postMessage
   Funciona con file://, http:// y cualquier navegador
   ===================================================== */
(function(){
  // Navegar a una URL (desde páginas reales)
  window.go = function(url) {
    try { window.parent.postMessage({ action: 'navigate', url: url }, '*'); } catch(e) {}
  };

  // Señalar que la fachada fue superada (desde páginas de superficie)
  window.surfacePassed = function(url) {
    try { window.parent.postMessage({ action: 'surfacePassed', url: url }, '*'); } catch(e) {}
  };

  // Alias para compatibilidad
  window.navigateTo = window.go;
})();
