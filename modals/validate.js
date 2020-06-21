const Joi = require('joi');

function validateUser(user) {
  const Schema = {
    username: Joi.string().min(2).max(50).required(),
    phone: Joi.number().min(10).required(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(user, Schema);
}

function validateUserSign(user) {
    
    const Schema = {
      phone: Joi.number().min(10).required(),
      password: Joi.string().min(5).max(255).required(),
    };
    
    return user;
  }


exports.validateUser = validateUser;
exports.validateUserSign=validateUserSign;