from webargs import fields, validate
from marshmallow import Schema

class UserCreateSchema(Schema):
    name = fields.Str(required = True,validate = validate.Length(min=3, max=20))
    age = fields.Int(required = True, validate = validate.Range(min=12,max=125))
    hobby = fields.List(fields.Str(),required=True)

class FindUserSchema(Schema):
    q = fields.Str(required = True)

class PostMessageSchema(Schema):
    sender = fields.Str(required = True)
    text = fields.Str(required = True,validate = validate.Length(min=1))


