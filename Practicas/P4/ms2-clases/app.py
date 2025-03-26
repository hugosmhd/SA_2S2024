from app import create_app  # Importa la función create_app del archivo __init__.py en app
from flask import Flask, make_response
app = create_app()  # Inicializa la aplicación Flask con los Blueprints registrados

@app.route('/', methods=['GET'])
def get_init():
    response = make_response('hello, world python s2!', 200)
    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5060, debug=True)  # Ejecuta el servidor en el puerto 5050
