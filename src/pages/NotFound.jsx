import { Link } from 'react-router-dom';
import NotFoundSeo from '../components/NotFoundSeo';

const NotFound = () => (
  <div className="min-h-screen py-16 flex items-center justify-center">
    <NotFoundSeo />
    <div className="text-center px-4">
      <h1 className="text-2xl font-bold text-primary mb-4">Página no encontrada</h1>
      <Link to="/" className="text-primary hover:underline">
        Volver al inicio
      </Link>
    </div>
  </div>
);

export default NotFound;
