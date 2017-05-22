from flask import Flask, request
from flask_restful import Resource, Api
from json import dumps

app = Flask(__name__)
api = Api(app)

@app.route('/example/',methods = ['GET'])
def example():
    return {'hello': 'world'}

if __name__ == '__main__':
    app.run(debug=True)