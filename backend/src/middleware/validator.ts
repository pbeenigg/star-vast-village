import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { errorResponse } from '@/utils/response'

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ')
      return res.status(400).json(errorResponse(400, errorMessage))
    }

    next()
  }
}

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ')
      return res.status(400).json(errorResponse(400, errorMessage))
    }

    next()
  }
}
