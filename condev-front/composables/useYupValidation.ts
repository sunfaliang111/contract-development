import type { AnyObjectSchema, ValidationError } from 'yup'

export type FieldErrors = Record<string, string>

export const collectYupErrors = (error: unknown) => {
  const errors: FieldErrors = {}
  const validationError = error as ValidationError
  const items = validationError.inner?.length ? validationError.inner : [validationError]

  for (const item of items) {
    if (item.path && !errors[item.path]) {
      errors[item.path] = item.message
    }
  }

  return errors
}

export const validateYupForm = async <T extends Record<string, unknown>>(
  schema: AnyObjectSchema,
  values: T
) => {
  try {
    await schema.validate(values, { abortEarly: false })
    return {}
  } catch (error) {
    return collectYupErrors(error)
  }
}
