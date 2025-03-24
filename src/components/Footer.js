import React from 'react';

function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>F1 Penca</h5>
            <p className="mb-0">Demuestra tus conocimientos de Fórmula 1 y compite con tus amigos.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">&copy; {year} F1 Penca. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;