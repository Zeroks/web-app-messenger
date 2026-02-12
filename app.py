import uuid
from flask import Flask, render_template
from flask import request
from webargs.flaskparser import use_args
from schemas.schemas import UserCreateSchema, FindUserSchema, PostMessageSchema
from flasgger import Swagger
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON

db = SQLAlchemy()

app = Flask(__name__, template_folder='frontend/templates', static_folder='frontend/static')
app.config['SWAGGER'] = {
    'openapi': '3.0.0',
    'title': 'Chat API',
    'version': '1.0.0'
}
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chatdatabase.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db.init_app(app)
swagger = Swagger(app)

class UsersDB(db.Model):
    __tablename__ = 'users'
    name = db.Column(db.String(50), nullable=False )
    age = db.Column(db.Integer, nullable=False )
    hobby = db.Column(JSON, nullable=False , default=list)
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()) )

class MessagesDB(db.Model):
    __tablename__ = 'messages'
    message_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()) )
    dialog_id = db.Column(db.String(100), nullable=False)
    sender = db.Column(db.String(36),nullable=False)
    text = db.Column(db.Text,nullable=False)

with app.app_context():
    db.create_all()


@app.route("/")
def index():
    return render_template("index.html")


@app.route('/users', methods=['POST'])
@use_args(UserCreateSchema(),location="json")
def create_new_user(args):
    """
    Создает нового пользователя
    ---
    tags:
      - Users
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            age:
              type: integer
            hobby:
              type: array
              items:
                type: string
    responses:
      200:
        description: Пользователь успешно создан
    """

    new_user = UsersDB(
        name = args['name'],
        age = args['age'],
        hobby = args['hobby'],
    )

    db.session.add(new_user)
    db.session.commit()

    return new_user.id

@app.route('/users', methods=['GET'])
@use_args(FindUserSchema(),location="query")
def find_a_user(args):
    """
    Поиск нового пользователя
    ---
    tags:
      - Users
    parameters:
      - name: q
        in: query
        type: string
        required: true
    responses:
      200:
        description: Пользователь успешно найден
    """
    search_query = args['q']
    users = UsersDB.query.filter(UsersDB.name.contains(search_query)).all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": user.name,
            "age": user.age,
            "hobby": user.hobby
        })
    return result

@app.route('/messages/<conversation_id>', methods=['POST'])
@use_args(PostMessageSchema(), location="json")
def post_new_message( args, conversation_id):
    """
    Отправка нового сообщения
    ---
    tags:
      - Messages
    parameters:
      - name: conversation_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            sender:
              type: string
            text:
              type: integer
    responses:
      200:
        description: Сообщение успешно доставлено
    """
    parts_of_dialog_id  = sorted(conversation_id.split('_'))
    new_message = MessagesDB(
        dialog_id = f'{parts_of_dialog_id [0]}_{parts_of_dialog_id [1]}',
        sender = args['sender'],
        text = args['text']
    )
    db.session.add(new_message)
    db.session.commit()
    return {"message_id": new_message.message_id}

@app.route('/messages/<conversation_id>', methods=['GET'])
def get_messages(conversation_id):
    """
    Получение диалогов
    ---
    tags:
      - Messages
    parameters:
      - name: conversation_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Диалоги успешно получены
    """

    parts_of_dialog_id  = sorted(conversation_id.split('_'))
    normalized_dialog_id = f'{parts_of_dialog_id [0]}_{parts_of_dialog_id [1]}'
    messages = MessagesDB.query.filter(MessagesDB.dialog_id == normalized_dialog_id).all()
    if not messages:
        reversed_dialog_id = f'{parts_of_dialog_id [1]}_{parts_of_dialog_id [0]}'
        messages = MessagesDB.query.filter(MessagesDB.dialog_id == reversed_dialog_id).all()
    result = []
    for msg in messages:
        result.append({
            "message_id": msg.message_id,
            "sender": msg.sender,
            "text": msg.text
        })

    return result


@app.route('/messages/<conversation_id>/<message_id>', methods=['PATCH'])
def edit_message(conversation_id, message_id):
    """
    Редактирование сообщения
    ---
    tags:
      - Messages
    parameters:
        - name: conversation_id
          in: path
          required: true
        - name: message_id
          in: path
          required: true
        - in: body
          name: body
          required: true
          schema:
            type: object
            properties:
              text:
                type: string
    responses:
      200:
        description: Сообщение успешно отредактировано
    """

    new_text = request.json['text']
    parts_of_dialog_id = sorted(conversation_id.split('_'))
    normalized_dialog_id = f'{parts_of_dialog_id[0]}_{parts_of_dialog_id[1]}'
    message = MessagesDB.query.filter(
        MessagesDB.message_id == message_id,
        MessagesDB.dialog_id == normalized_dialog_id
        ).first()
    if not message:
        reversed_dialog_id = f'{parts_of_dialog_id[1]}_{parts_of_dialog_id[0]}'
        message = MessagesDB.query.filter(
            MessagesDB.message_id == message_id,
            MessagesDB.dialog_id == reversed_dialog_id
        ).first()
    message.text = new_text

    db.session.commit()

    return { "sender" : message.sender,"text": message.text }


if __name__ == '__main__':
    app.run(debug=True)
