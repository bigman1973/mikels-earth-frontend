const Contact = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">
          Contacto
        </h1>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-primary mb-6">
              Mikel's by Farms Planet SL
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Dirección:</strong><br />
                Carrer Cardenal Cisneros, 10<br />
                Lérida, España
              </p>
              <p>
                <strong>Email:</strong> info@mikels.es
              </p>
              <p>
                <strong>Teléfono:</strong> +34 XXX XXX XXX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

